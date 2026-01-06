import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import {
  formatCurrency,
  formatDate,
  isURL,
  formatURL,
} from '../utils/helpers';
import {
  STATUS_COLORS,
  STATUS_LABELS,
  WORK_TYPES,
  INTERVIEW_STATUS_COLORS,
  INTERVIEW_STATUS_LABELS,
  INTERVIEW_RESULT_COLORS,
  INTERVIEW_RESULT_LABELS,
} from '../utils/constants';

const ApplicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [application, setApplication] = useState(null);
  const [interview, setInterview] = useState(null);
  const [loadingInterview, setLoadingInterview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchApplication();
  }, [id, isAuthenticated]);

  const fetchApplication = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getApplication(id);
      if (response.success) {
        const app = response.data.application;
        setApplication(app);
        
        // If application has interview status or interviewId, fetch interview
        if (app.status === 'interview' || app.interviewId || app.interview) {
          const interviewId = app.interviewId || app.interview?._id || app.interview;
          if (interviewId) {
            fetchInterview(interviewId);
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Ariza ma\'lumotlarini yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const fetchInterview = async (interviewId) => {
    setLoadingInterview(true);
    try {
      const response = await api.getInterview(interviewId);
      if (response.success) {
        setInterview(response.data.interview);
      }
    } catch (err) {
      console.error('Interview ma\'lumotlarini yuklashda xatolik:', err);
    } finally {
      setLoadingInterview(false);
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

  if (error && !application) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8">
          <Alert message={error} type="error" />
          <Link
            to="/applications"
            className="mt-4 inline-block text-blue-500 hover:text-blue-600"
          >
            ← Arizalarga qaytish
          </Link>
        </div>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  const { vacancy } = application;
  const statusClass =
    STATUS_COLORS[application.status] || STATUS_COLORS.pending;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8 md:py-10 lg:py-12 max-w-7xl">
        <Link
          to="/applications"
          className="text-blue-500 hover:text-blue-600 mb-4 inline-block"
        >
          ← Arizalarga qaytish
        </Link>

        {error && <Alert message={error} type="error" />}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-4 md:p-8 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Ariza ma'lumotlari
            </h1>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${statusClass}`}
            >
              {STATUS_LABELS[application.status] || application.status}
            </span>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Topshirilgan sana</p>
            <p className="font-semibold">{formatDate(application.createdAt)}</p>
          </div>

          {application.notes && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Eslatma
              </p>
              <p className="text-gray-700">{application.notes}</p>
            </div>
          )}

          {/* Interview Information */}
          {(application.status === 'interview' || interview) && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  Suhbat ma'lumotlari
                </h3>
                {loadingInterview && (
                  <span className="text-sm text-gray-500">Yuklanmoqda...</span>
                )}
              </div>
              {interview ? (
                <div className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Suhbat o'tkazuvchi</p>
                      <p className="font-semibold text-gray-900">{interview.interviewer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Sana va vaqt</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(interview.date)} {interview.time}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Joylashuv</p>
                      {isURL(interview.location) ? (
                        <a
                          href={formatURL(interview.location)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline break-all"
                        >
                          {interview.location}
                        </a>
                      ) : (
                        <p className="font-semibold text-gray-900">{interview.location}</p>
                      )}
                    </div>
                    {interview.content && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600 mb-1">Mazmun</p>
                        <p className="text-gray-700">{interview.content}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        INTERVIEW_STATUS_COLORS[interview.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {INTERVIEW_STATUS_LABELS[interview.status] || interview.status}
                    </span>
                    {interview.result && (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          INTERVIEW_RESULT_COLORS[interview.result] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {INTERVIEW_RESULT_LABELS[interview.result] || interview.result}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <Link
                      to={`/interviews/${interview._id}`}
                      className="text-purple-600 hover:text-purple-700 font-medium text-sm inline-flex items-center"
                    >
                      Batafsil ko'rish →
                    </Link>
                  </div>
                </div>
              ) : application.status === 'interview' && !loadingInterview ? (
                <p className="text-gray-600">Suhbat ma'lumotlari hali tayyorlanmagan</p>
              ) : null}
            </div>
          )}
        </motion.div>

        {/* Vacancy Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-4 md:p-8"
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

          <div className="grid md:grid-cols-2 gap-6 mb-8">
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

          {vacancy.description && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Tavsif</h3>
              <p className="text-gray-700 whitespace-pre-line">
                {vacancy.description}
              </p>
            </div>
          )}

          {vacancy.responsibilities && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Vazifalar</h3>
              <p className="text-gray-700 whitespace-pre-line">
                {vacancy.responsibilities}
              </p>
            </div>
          )}

          {vacancy.preferences && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Afzalliklar
              </h3>
              <p className="text-gray-700 whitespace-pre-line">
                {vacancy.preferences}
              </p>
            </div>
          )}

          {vacancy.skills && vacancy.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Ko'nikmalar
              </h3>
              <div className="flex flex-wrap gap-2">
                {vacancy.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t text-sm text-gray-500">
            Vakansiya yaratilgan: {formatDate(vacancy.createdAt)}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ApplicationDetailPage;

