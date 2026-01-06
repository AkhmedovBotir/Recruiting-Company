import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import {
  INTERVIEW_STATUS_COLORS,
  INTERVIEW_STATUS_LABELS,
  INTERVIEW_RESULT_COLORS,
  INTERVIEW_RESULT_LABELS,
  WORK_TYPES,
} from '../utils/constants';
import { formatDate, formatCurrency, isURL, formatURL } from '../utils/helpers';

const InterviewDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchInterview();
  }, [id, isAuthenticated]);

  const fetchInterview = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getInterview(id);
      if (response.success) {
        setInterview(response.data.interview);
      }
    } catch (err) {
      setError(err.message || 'Suhbat ma\'lumotlarini yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8">
          <Loading />
        </div>
      </div>
    );
  }

  if (error && !interview) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8">
          <Alert message={error} type="error" />
          <Link
            to="/interviews"
            className="mt-4 inline-block text-blue-500 hover:text-blue-600"
          >
            ← Suhbatlarga qaytish
          </Link>
        </div>
      </div>
    );
  }

  if (!interview) {
    return null;
  }

  const { vacancy } = interview;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8 md:py-10 lg:py-12 max-w-7xl">
        <Link
          to="/interviews"
          className="text-blue-500 hover:text-blue-600 mb-4 inline-block"
        >
          ← Suhbatlarga qaytish
        </Link>

        {error && <Alert message={error} type="error" />}

        {/* Interview Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-4 md:p-8 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Suhbat ma'lumotlari
            </h1>
            <div className="flex flex-col gap-2 items-end">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  INTERVIEW_STATUS_COLORS[interview.status] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {INTERVIEW_STATUS_LABELS[interview.status] || interview.status}
              </span>
              {interview.result && (
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    INTERVIEW_RESULT_COLORS[interview.result] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {INTERVIEW_RESULT_LABELS[interview.result] || interview.result}
                </span>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Suhbat o'tkazuvchi</p>
              <p className="font-semibold text-lg text-gray-900">{interview.interviewer}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Sana</p>
              <p className="font-semibold text-lg text-gray-900">
                {formatDate(interview.date)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Vaqt</p>
              <p className="font-semibold text-lg text-gray-900">{interview.time}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Joylashuv</p>
              {isURL(interview.location) ? (
                <a
                  href={formatURL(interview.location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-lg text-blue-600 hover:text-blue-700 hover:underline break-all"
                >
                  {interview.location}
                </a>
              ) : (
                <p className="font-semibold text-lg text-gray-900">{interview.location}</p>
              )}
            </div>
          </div>

          {interview.content && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Mazmun</h3>
              <p className="text-gray-700 whitespace-pre-line">{interview.content}</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t text-sm text-gray-500">
            Yaratilgan: {formatDate(interview.createdAt)}
          </div>
        </motion.div>

        {/* Vacancy Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-4 md:p-8 mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Vakansiya ma'lumotlari
          </h2>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {vacancy.title}
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-blue-100 px-3 py-1 rounded-full text-sm">
                {vacancy.department}
              </span>
              <span className="bg-green-100 px-3 py-1 rounded-full text-sm">
                {vacancy.position}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  vacancy.workType === WORK_TYPES.FULLTIME
                    ? 'bg-purple-100'
                    : 'bg-orange-100'
                }`}
              >
                {vacancy.workType === WORK_TYPES.FULLTIME
                  ? "To'liq ish kuni"
                  : 'Yarim ish kuni'}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {vacancy.company && (
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-700 mb-2">Kompaniya</h3>
                <p className="text-gray-600">{vacancy.company.name}</p>
                {vacancy.company.inn && (
                  <p className="text-sm text-gray-500">INN: {vacancy.company.inn}</p>
                )}
                {vacancy.company.ownerFullName && (
                  <p className="text-sm text-gray-500">
                    Egası: {vacancy.company.ownerFullName}
                  </p>
                )}
                {vacancy.company.companyPhone && (
                  <p className="text-sm text-gray-500">
                    Telefon: {vacancy.company.companyPhone}
                  </p>
                )}
              </div>
            )}

            {vacancy.experience && (
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-700 mb-2">Tajriba</h3>
                <p className="text-gray-600">{vacancy.experience}</p>
              </div>
            )}

            {vacancy.salary && (
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-semibold text-gray-700 mb-2">Maosh</h3>
                <p className="text-green-600 font-bold text-lg">
                  {formatCurrency(vacancy.salary)}
                </p>
              </div>
            )}

            {(vacancy.minAge || vacancy.maxAge) && (
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-700 mb-2">Yosh</h3>
                <p className="text-gray-600">
                  {vacancy.minAge && vacancy.maxAge
                    ? `${vacancy.minAge} - ${vacancy.maxAge} yosh`
                    : vacancy.minAge
                    ? `${vacancy.minAge}+ yosh`
                    : `gacha ${vacancy.maxAge} yosh`}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Evaluations */}
        {interview.status === 'completed' && interview.evaluations && interview.evaluations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-4 md:p-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Baxolashlar ({interview.evaluations.length})
            </h2>
            <div className="space-y-6">
              {interview.evaluations.map((evaluation, index) => (
                <div
                  key={evaluation._id || index}
                  className="p-6 bg-gray-50 rounded-lg border-l-4 border-blue-500"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {evaluation.admin?.username || 'Admin'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(evaluation.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-600">
                        {evaluation.rating}
                      </span>
                      <span className="text-sm text-gray-500">/ 10</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mb-2">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded ${
                          i < evaluation.rating ? 'bg-blue-500' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mt-4 whitespace-pre-line">
                    {evaluation.text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InterviewDetailPage;

