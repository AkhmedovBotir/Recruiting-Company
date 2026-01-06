import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import {
  INTERVIEW_STATUS,
  INTERVIEW_RESULT,
  INTERVIEW_STATUS_COLORS,
  INTERVIEW_STATUS_LABELS,
  INTERVIEW_RESULT_COLORS,
  INTERVIEW_RESULT_LABELS,
} from '../utils/constants';
import { formatDate, isURL, formatURL } from '../utils/helpers';

const InterviewsPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    result: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchInterviews();
  }, [isAuthenticated, filters.page, filters.status, filters.result]);

  const fetchInterviews = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
      };
      if (filters.status) params.status = filters.status;
      if (filters.result) params.result = filters.result;

      const response = await api.getMyInterviews(params);
      if (response.success) {
        setInterviews(response.data.interviews);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Suhbatlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8 md:py-10 lg:py-12 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Barcha statuslar</option>
                  <option value={INTERVIEW_STATUS.SCHEDULED}>Rejalashtirilgan</option>
                  <option value={INTERVIEW_STATUS.COMPLETED}>Yakunlangan</option>
                  <option value={INTERVIEW_STATUS.CANCELLED}>Bekor qilingan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Natija
                </label>
                <select
                  value={filters.result}
                  onChange={(e) => handleFilterChange('result', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Barcha natijalar</option>
                  <option value={INTERVIEW_RESULT.PASSED}>O'tdi</option>
                  <option value={INTERVIEW_RESULT.FAILED}>O'tmadi</option>
                  <option value={INTERVIEW_RESULT.PENDING}>Kutilmoqda</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {error && <Alert message={error} type="error" />}

        {loading ? (
          <Loading />
        ) : interviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-lg mb-4">
              Hozircha suhbatlar mavjud emas
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-8">
              {interviews.map((interview) => (
                <Link key={interview._id} to={`/interviews/${interview._id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-xl transition-all duration-200 p-6 cursor-pointer"
                  >
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {interview.vacancy.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">
                            <span className="bg-blue-100 px-3 py-1 rounded-full">
                              {interview.vacancy.department}
                            </span>
                            <span className="bg-green-100 px-3 py-1 rounded-full">
                              {interview.vacancy.position}
                            </span>
                            {interview.vacancy.company && (
                              <span className="bg-gray-100 px-3 py-1 rounded-full">
                                {interview.vacancy.company.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
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
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Suhbat o'tkazuvchi</p>
                          <p className="font-medium text-gray-900">{interview.interviewer}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Sana va vaqt</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(interview.date)} {interview.time}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500 mb-1">Joylashuv</p>
                          {isURL(interview.location) ? (
                            <a
                              href={formatURL(interview.location)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-blue-600 hover:text-blue-700 hover:underline break-all"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {interview.location}
                            </a>
                          ) : (
                            <p className="font-medium text-gray-900">{interview.location}</p>
                          )}
                        </div>
                        {interview.content && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-500 mb-1">Mazmun</p>
                            <p className="text-gray-700 line-clamp-2">{interview.content}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-gray-500">
                          Yaratilgan: {formatDate(interview.createdAt)}
                        </span>
                        <span className="text-blue-600 text-sm font-medium">
                          Batafsil →
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page - 1 })
                  }
                  disabled={filters.page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Oldingi
                </button>
                <span className="px-4 py-2">
                  {filters.page} / {pagination.pages}
                </span>
                <button
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page + 1 })
                  }
                  disabled={filters.page === pagination.pages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Keyingi
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InterviewsPage;

