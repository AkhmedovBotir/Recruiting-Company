import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Alert from '../components/Alert';

const RegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    // Get phone from location state (from login flow)
    if (location.state?.phone) {
      setPhone(location.state.phone);
    } else {
      // If no phone in state, redirect to login
      navigate('/login');
    }
  }, [location.state, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || firstName.trim().length < 2) {
      setError('Ism kamida 2 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    if (!lastName.trim() || lastName.trim().length < 2) {
      setError('Familiya kamida 2 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    setLoading(true);
    try {
      const response = await api.register(phone, firstName.trim(), lastName.trim());
      if (response.success) {
        login(response.data.token, response.data.candidate);
        navigate('/vacancies');
      }
    } catch (err) {
      setError(err.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Ro'yxatdan o'tish
          </h1>
          <p className="text-gray-600">
            Ma'lumotlaringizni to'ldiring
          </p>
          {phone && (
            <p className="text-sm text-gray-500 mt-2">Telefon: {phone}</p>
          )}
        </div>

        {error && <Alert message={error} type="error" />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ism *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ismingizni kiriting"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Familiya *
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Familiyangizni kiriting"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Ro\'yxatdan o\'tmoqda...' : 'Ro\'yxatdan o\'tish'}
          </motion.button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full text-blue-500 hover:text-blue-600 text-sm"
          >
            Kirish sahifasiga qaytish
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterPage;

