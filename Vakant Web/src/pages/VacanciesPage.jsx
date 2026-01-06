import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import VacancyCard from '../components/VacancyCard';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import { WORK_TYPES } from '../utils/constants';

const VacanciesPage = () => {
    const [vacancies, setVacancies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        workType: '',
        search: '',
        page: 1,
        limit: 10,
    });
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        fetchVacancies();
    }, [filters.page, filters.workType, filters.search]);

    const fetchVacancies = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                page: filters.page,
                limit: filters.limit,
            };
            if (filters.workType) params.workType = filters.workType;
            if (filters.search) params.search = filters.search;

            console.log('🔍 Vakansiyalarni so\'rash:', params);
            const response = await api.getVacancies(params);
            console.log('✅ API javobi:', response);
            
            if (response.success) {
                console.log('📋 Ko\'rsatilgan vakansiyalar:', response.data.vacancies);
                console.log('📊 Jami vakansiyalar soni:', response.data.pagination?.total || 0);
                console.log('📄 Pagination:', response.data.pagination);
                setVacancies(response.data.vacancies || []);
                setPagination(response.data.pagination);
            } else {
                console.error('❌ API xatolik:', response);
                setError(response.message || 'Vakansiyalarni yuklashda xatolik');
            }
        } catch (err) {
            console.error('❌ Xatolik:', err);
            setError(err.message || 'Vakansiyalarni yuklashda xatolik. API server ishlamayapti.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value, page: 1 });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchVacancies();
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-4 md:py-6 max-w-7xl">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                        Vakansiyalar
                    </h1>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8 md:py-10 lg:py-12 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >

                    {/* Filters */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 mb-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="grid md:grid-cols-3 gap-3 md:gap-4">
                                <div className="md:col-span-2">
                                    <input
                                        type="text"
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        placeholder="Vakansiya nomi, lavozim, kompaniya bo'yicha qidirish..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <select
                                        value={filters.workType}
                                        onChange={(e) => handleFilterChange('workType', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    >
                                        <option value="">Ish turi (barchasi)</option>
                                        <option value={WORK_TYPES.FULLTIME}>To'liq ish kuni</option>
                                        <option value={WORK_TYPES.PARTTIME}>Yarim ish kuni</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Qidirish
                            </button>
                        </form>
                    </div>
                </motion.div>

                {error && <Alert message={error} type="error" />}

                {loading ? (
                    <Loading />
                ) : vacancies.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">
                            Vakansiyalar topilmadi
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {vacancies.map((vacancy) => (
                                <VacancyCard key={vacancy._id} vacancy={vacancy} />
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

export default VacanciesPage;

