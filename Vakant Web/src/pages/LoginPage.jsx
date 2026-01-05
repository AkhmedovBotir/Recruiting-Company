import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PhoneInput from '../components/PhoneInput';
import CodeInput from '../components/CodeInput';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import { validatePhoneNumber } from '../utils/helpers';
import { isTelegramWebApp } from '../utils/telegram';

const LoginPage = () => {
  const [step, setStep] = useState('phone'); // 'phone' | 'code'
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const intervalRef = useRef(null);
  const navigate = useNavigate();
  const { login, isAuthenticated, isTelegram, loading: authLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/vacancies');
    }
  }, [isAuthenticated, navigate]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Show loading only while Telegram auth is in progress
  if (authLoading && isTelegram) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Loading text="Telegram orqali autentifikatsiya qilinmoqda..." />
      </div>
    );
  }

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validatePhoneNumber(phone)) {
      setError('Telefon raqam noto\'g\'ri formatda');
      return;
    }

    setLoading(true);
    try {
      await api.loginStart(phone);
      setStep('code');
      setCountdown(300); // 5 minutes
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!code || code.length !== 5) {
      setError('Kod 5 raqamdan iborat bo\'lishi kerak');
      return;
    }

    setLoading(true);
    try {
      const response = await api.verifyCode(phone, code);
      if (response.success) {
        if (response.data.exists) {
          // User exists, login
          login(response.data.token, response.data.candidate);
          navigate('/vacancies');
        } else {
          // User doesn't exist, go to registration
          navigate('/register', { state: { phone } });
        }
      }
    } catch (err) {
      setError(err.message || 'Kod noto\'g\'ri yoki muddati o\'tgan');
    } finally {
      setLoading(false);
    }
  };

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Kirish</h1>
          <p className="text-gray-600">
            {step === 'phone'
              ? 'Telefon raqamingizni kiriting'
              : 'SMS orqali yuborilgan kodni kiriting'}
          </p>
        </div>

        {error && <Alert message={error} type="error" />}

        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <PhoneInput
              value={phone}
              onChange={setPhone}
              error={error && !validatePhoneNumber(phone) ? error : ''}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Yuborilmoqda...' : 'Kod yuborish'}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit} className="space-y-6">
            <div>
              <CodeInput
                value={code}
                onChange={setCode}
                error={error && code.length !== 5 ? error : ''}
              />
              {countdown > 0 && (
                <p className="mt-4 text-center text-sm text-gray-600">
                  Kod muddati: {formatCountdown(countdown)}
                </p>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || code.length !== 5}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
            </motion.button>
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-blue-500 hover:text-blue-600 text-sm"
            >
              Orqaga
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default LoginPage;

