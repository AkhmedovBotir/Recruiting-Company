import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import { formatCurrency, formatDate } from '../utils/helpers';
import { WORK_TYPES } from '../utils/constants';
import { renderHTML } from '../utils/htmlUtils';

const VacancyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [vacancy, setVacancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(false);

  useEffect(() => {
    fetchVacancy();
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && vacancy) {
      checkIfApplied();
    }
  }, [isAuthenticated, vacancy]);

  const fetchVacancy = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getVacancy(id);
      if (response.success) {
        console.log('🔍 Ko\'rsatilgan vakansiya:', response.data.vacancy);
        setVacancy(response.data.vacancy);
      }
    } catch (err) {
      setError(err.message || 'Vakansiya ma\'lumotlarini yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const checkIfApplied = async () => {
    if (!isAuthenticated || !vacancy) return;
    
    setCheckingApplication(true);
    try {
      const response = await api.getMyApplications({ limit: 100 }); // Ko'p arizalarni olish
      if (response.success && response.data.applications) {
        const applied = response.data.applications.some(
          (app) => app.vacancy._id === vacancy._id || app.vacancy === vacancy._id
        );
        setHasApplied(applied);
      }
    } catch (err) {
      // Xatolik bo'lsa ham davom etamiz
      console.error('Ariza tekshirishda xatolik:', err);
    } finally {
      setCheckingApplication(false);
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (hasApplied) {
      setError('Siz bu vakansiyaga allaqachon ariza topshirgansiz');
      return;
    }

    setApplying(true);
    setError('');
    try {
      const response = await api.applyToVacancy(id);
      if (response.success) {
        setApplySuccess(true);
        setHasApplied(true);
        setTimeout(() => {
          navigate('/applications');
        }, 2000);
      }
    } catch (err) {
      // Agar allaqachon topshirilgan bo'lsa
      if (err.message && err.message.includes('already applied')) {
        setHasApplied(true);
      }
      setError(err.message || 'Ariza topshirishda xatolik');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Loading />
        </div>
      </div>
    );
  }

  if (error && !vacancy) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Alert message={error} type="error" />
          <Link
            to="/vacancies"
            className="mt-4 inline-block text-blue-500 hover:text-blue-600"
          >
            ← Vakansiyalarga qaytish
          </Link>
        </div>
      </div>
    );
  }

  if (!vacancy) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/vacancies"
            className="text-blue-600 hover:text-blue-700 inline-flex items-center text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Vakansiyalarga qaytish
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && <Alert message={error} type="error" />}
        {applySuccess && (
          <Alert
            message="Ariza muvaffaqiyatli topshirildi!"
            type="success"
          />
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6 md:p-8 mb-6"
            >
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {vacancy.title}
                </h1>
                {vacancy.company && (
                  <p className="text-xl text-gray-700 font-medium mb-4">
                    {vacancy.company.name}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mb-6">
                  {vacancy.department && (
                    <span className="inline-flex items-center px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-sm font-medium">
                      {vacancy.department}
                    </span>
                  )}
                  {vacancy.position && (
                    <span className="inline-flex items-center px-3 py-1 rounded-md bg-gray-100 text-gray-700 text-sm">
                      {vacancy.position}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-md text-sm ${
                      vacancy.workType === WORK_TYPES.FULLTIME
                        ? 'bg-purple-50 text-purple-700'
                        : 'bg-orange-50 text-orange-700'
                    }`}
                  >
                    {vacancy.workType === WORK_TYPES.FULLTIME
                      ? "To'liq ish kuni"
                      : 'Yarim ish kuni'}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                {vacancy.experience && (
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-3 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Tajriba</p>
                      <p className="text-base font-medium text-gray-900">{vacancy.experience}</p>
                    </div>
                  </div>
                )}

                {(vacancy.minAge || vacancy.maxAge) && (
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-3 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Yosh</p>
                      <p className="text-base font-medium text-gray-900">
                        {vacancy.minAge && vacancy.maxAge
                          ? `${vacancy.minAge}-${vacancy.maxAge} yosh`
                          : vacancy.minAge
                          ? `${vacancy.minAge}+ yosh`
                          : `gacha ${vacancy.maxAge} yosh`}
                      </p>
                    </div>
                  </div>
                )}

                {vacancy.company?.inn && (
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-3 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">INN</p>
                      <p className="text-base font-medium text-gray-900">{vacancy.company.inn}</p>
                    </div>
                  </div>
                )}
              </div>

              {vacancy.description && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Tavsif
                  </h2>
                  <div 
                    className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={renderHTML(vacancy.description)}
                  />
                </div>
              )}

              {vacancy.responsibilities && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Vazifalar
                  </h2>
                  <div 
                    className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={renderHTML(vacancy.responsibilities)}
                  />
                </div>
              )}

              {vacancy.preferences && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Afzalliklar
                  </h2>
                  <div 
                    className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={renderHTML(vacancy.preferences)}
                  />
                </div>
              )}

              {vacancy.skills && vacancy.skills.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Ko'nikmalar
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {vacancy.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-medium text-gray-700 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
                Yaratilgan: {formatDate(vacancy.createdAt)}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
              {vacancy.salary && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">Maosh</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(vacancy.salary)}
                  </p>
                </div>
              )}

              {checkingApplication ? (
                <div className="w-full py-4 rounded-lg font-semibold text-lg bg-gray-100 text-gray-600 text-center">
                  Tekshirilmoqda...
                </div>
              ) : (
                <>
                  <motion.button
                    whileHover={hasApplied ? {} : { scale: 1.02 }}
                    whileTap={hasApplied ? {} : { scale: 0.98 }}
                    onClick={handleApply}
                    disabled={applying || applySuccess || hasApplied}
                    className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      hasApplied
                        ? 'bg-green-100 text-green-700 cursor-default'
                        : isAuthenticated
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {!isAuthenticated
                      ? 'Kirish kerak'
                      : hasApplied
                      ? 'Ariza topshirilgan'
                      : applying
                      ? 'Topshirilmoqda...'
                      : applySuccess
                      ? 'Topshirildi!'
                      : 'Ariza topshirish'}
                  </motion.button>

                  {hasApplied && (
                    <Link
                      to="/applications"
                      className="block mt-4 text-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Mening arizalarimni ko'rish
                    </Link>
                  )}

                  {!isAuthenticated && (
                    <Link
                      to="/login"
                      className="block mt-4 text-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Ro'yxatdan o'tish yoki kirish
                    </Link>
                  )}
                </>
              )}

              {vacancy.company && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Kompaniya</p>
                  <p className="text-base font-medium text-gray-900">
                    {vacancy.company.name}
                  </p>
                  {vacancy.company.companyPhone && (
                    <p className="text-sm text-gray-600 mt-2">
                      {vacancy.company.companyPhone}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacancyDetailPage;

