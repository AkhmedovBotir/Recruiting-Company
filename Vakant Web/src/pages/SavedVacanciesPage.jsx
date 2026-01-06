import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import VacancyCard from '../components/VacancyCard';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import { StarIcon, EmptyIcon } from '../components/Icons';

const SavedVacanciesPage = () => {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchSavedVacancies();
  }, [page]);

  const fetchSavedVacancies = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getSavedVacancies({ page, limit: 10 });
      if (response.success) {
        setVacancies(response.data.savedVacancies || []);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Saqlangan vakansiyalarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (vacancyId) => {
    try {
      await api.unsaveVacancy(vacancyId);
      fetchSavedVacancies();
    } catch (err) {
      setError(err.message || 'Vakansiyani o\'chirishda xatolik');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8 md:py-10 lg:py-12 max-w-7xl">
        {error && <Alert message={error} type="error" />}

        {loading ? (
          <Loading />
        ) : vacancies.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="flex justify-center mb-4">
              <EmptyIcon className="w-16 h-16 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg mb-4 font-semibold">
              Hozircha saqlangan vakansiyalar mavjud emas
            </p>
            <Link
              to="/vacancies"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Vakansiyalarni ko'rish
            </Link>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {vacancies.map((savedVacancy) => (
                <div key={savedVacancy._id} className="relative">
                  <VacancyCard vacancy={savedVacancy.vacancy} />
                  <button
                    onClick={() => handleUnsave(savedVacancy.vacancy._id)}
                    className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    title="Saqlanganlardan o'chirish"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Oldingi
                </button>
                <span className="px-4 py-2">
                  {page} / {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.pages}
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

export default SavedVacanciesPage;

