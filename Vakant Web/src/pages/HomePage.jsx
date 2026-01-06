import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import VacancyCard from '../components/VacancyCard';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import { WORK_TYPES } from '../utils/constants';
import { SearchIcon, LightningIcon, ChartIcon } from '../components/Icons';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVacancies();
  }, []);

  const fetchVacancies = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getVacancies({ page: 1, limit: 6 });
      if (response.success) {
        setVacancies(response.data.vacancies || []);
      }
    } catch (err) {
      setError(err.message || 'Vakansiyalarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              Vakant - O'zingizga mos ish toping
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Yuzlab vakansiyalar orasidan o'zingizga mosini toping
            </p>
            {!isAuthenticated && (
              <Link
                to="/login"
                className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Ro'yxatdan o'tish
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {/* Vacancies Section */}
      <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            So'nggi vakansiyalar
          </h2>
          <Link
            to="/vacancies"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Barchasini ko'rish →
          </Link>
        </div>

        {error && <Alert message={error} type="error" />}

        {loading ? (
          <Loading />
        ) : vacancies.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600 text-lg">
              Hozircha vakansiyalar mavjud emas
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {vacancies.map((vacancy) => (
              <VacancyCard key={vacancy._id} vacancy={vacancy} />
            ))}
          </div>
        )}

        {!loading && vacancies.length > 0 && (
          <div className="text-center mt-8">
            <Link
              to="/vacancies"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Barcha vakansiyalarni ko'rish
            </Link>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-md hover:shadow-xl transition-all duration-200"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <SearchIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Qulay qidiruv
            </h3>
            <p className="text-gray-600">
              Turli xil filtrlardan foydalanib, o'zingizga mos vakansiyalarni
              toping
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-md hover:shadow-xl transition-all duration-200"
          >
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <LightningIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Tezkor ariza
            </h3>
            <p className="text-gray-600">
              Bir necha bosqichda osonlik bilan vakansiyaga ariza topshiring
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-md hover:shadow-xl transition-all duration-200"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <ChartIcon className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Jarayonni kuzatish
            </h3>
            <p className="text-gray-600">
              Barcha arizalaringizning holatini real vaqtda kuzating
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

