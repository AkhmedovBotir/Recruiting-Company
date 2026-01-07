import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CertificateCard from '../components/CertificateCard';
import Loading from '../components/Loading';
import Alert from '../components/Alert';

const CertificatesPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState(null);
  
  // Determine active tab based on current route
  const activeTab = location.pathname === '/certificates' ? 'certificates' : 'materials';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCertificates();
  }, [isAuthenticated, filters.page, filters.status]);

  const fetchCertificates = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
      };
      if (filters.status) params.status = filters.status;

      const response = await api.getMyCertificates(params);
      if (response.success) {
        setCertificates(response.data.certificates);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Sertifikatlarni yuklashda xatolik');
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
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => navigate('/materials')}
              className={`flex-1 px-4 py-3 text-center font-medium transition-colors ${
                activeTab === 'materials'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Darslar
            </button>
            <button
              onClick={() => navigate('/certificates')}
              className={`flex-1 px-4 py-3 text-center font-medium transition-colors ${
                activeTab === 'certificates'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Sertifikatlar
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Mening sertifikatlarim</h1>
          
          {/* Filter */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Barcha sertifikatlar</option>
              <option value="active">Faol</option>
              <option value="revoked">Bekor qilingan</option>
            </select>
          </div>
        </motion.div>

        {error && <Alert message={error} type="error" />}

        {loading ? (
          <Loading />
        ) : certificates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-lg mb-4">
              Hozircha sertifikatlar mavjud emas
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-8">
              {certificates.map((certificate) => (
                <CertificateCard
                  key={certificate._id}
                  certificate={certificate}
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

export default CertificatesPage;

