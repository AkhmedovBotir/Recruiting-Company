import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ApplicationCard from '../components/ApplicationCard';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import { APPLICATION_STATUS } from '../utils/constants';

const ApplicationsPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchApplications();
  }, [isAuthenticated, filters.page, filters.status]);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
      };
      if (filters.status) params.status = filters.status;

      const response = await api.getMyApplications(params);
      if (response.success) {
        setApplications(response.data.applications);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Arizalarni yuklashda xatolik');
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Mening arizalarim
          </h1>

          {/* Filter */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Barcha arizalar</option>
              <option value={APPLICATION_STATUS.PENDING}>Kutilyapti</option>
              <option value={APPLICATION_STATUS.REVIEWED}>
                Ko'rib chiqilgan
              </option>
              <option value={APPLICATION_STATUS.ACCEPTED}>
                Qabul qilingan
              </option>
              <option value={APPLICATION_STATUS.REJECTED}>Rad etilgan</option>
            </select>
          </div>
        </motion.div>

        {error && <Alert message={error} type="error" />}

        {loading ? (
          <Loading />
        ) : applications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-lg mb-4">
              Hozircha arizalar mavjud emas
            </p>
            <button
              onClick={() => navigate('/vacancies')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Vakansiyalarni ko'rish
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-8">
              {applications.map((application) => (
                <ApplicationCard
                  key={application._id}
                  application={application}
                />
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

export default ApplicationsPage;

