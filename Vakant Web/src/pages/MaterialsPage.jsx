import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import { EmptyIcon, BookIcon, TestIcon } from '../components/Icons';
import { formatDate, formatCurrency } from '../utils/helpers';

const MaterialsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyVacancies, setCompanyVacancies] = useState([]);
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [vacancyMaterials, setVacancyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, []);

  // URL parametrlaridan state'ni restore qilish (faqat bir marta)
  useEffect(() => {
    const companyId = searchParams.get('company');
    const vacancyId = searchParams.get('vacancy');
    
    if (companyId && companies.length > 0 && !selectedCompany) {
      const company = companies.find(c => c._id === companyId);
      if (company) {
        setSelectedCompany(company);
        
        if (vacancyId && materials.length > 0 && !selectedVacancy) {
          // Vakansiyani topish
          const materialsForCompany = materials.filter(m => {
            const cId = m.company?._id || m.company;
            return cId === companyId;
          });
          const vacancy = materialsForCompany
            .map(m => m.vacancy)
            .find(v => v && (v._id === vacancyId || v === vacancyId));
          
          if (vacancy) {
            setSelectedVacancy(vacancy);
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companies.length, materials.length]);

  useEffect(() => {
    if (selectedCompany && materials.length > 0) {
      // Tanlangan kompaniyaning materiallariga ega vakansiyalarni topish
      const vacanciesWithMaterials = materials
        .filter(material => {
          const companyId = material.company?._id || material.company;
          return companyId === selectedCompany._id;
        })
        .map(material => material.vacancy)
        .filter((vacancy, index, self) => 
          vacancy && index === self.findIndex(v => v && v._id === vacancy._id)
        );
      setCompanyVacancies(vacanciesWithMaterials);
    } else {
      setCompanyVacancies([]);
    }
  }, [selectedCompany, materials]);

  useEffect(() => {
    if (selectedVacancy && materials.length > 0) {
      // Tanlangan vakansiyaning materiallarini topish
      const materialsForVacancy = materials.filter(material => {
        const vacancyId = material.vacancy?._id || material.vacancy;
        return vacancyId === selectedVacancy._id;
      });
      setVacancyMaterials(materialsForVacancy);
    } else {
      setVacancyMaterials([]);
    }
  }, [selectedVacancy, materials]);

  const fetchMaterials = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getMaterials();
      if (response.success) {
        const materialsData = response.data.materials || [];
        setMaterials(materialsData);
        
        // Kompaniyalarni unikal qilib guruhlash
        const uniqueCompanies = [];
        const companyMap = new Map();
        
        materialsData.forEach(material => {
          const company = material.company;
          if (company && company._id) {
            if (!companyMap.has(company._id)) {
              companyMap.set(company._id, company);
              uniqueCompanies.push(company);
            }
          }
        });
        
        setCompanies(uniqueCompanies);
      }
    } catch (err) {
      setError(err.message || 'Materiallarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const updateURL = (companyId = null, vacancyId = null) => {
    const params = new URLSearchParams();
    if (companyId) params.set('company', companyId);
    if (vacancyId) params.set('vacancy', vacancyId);
    navigate(`/materials?${params.toString()}`, { replace: true });
  };

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setSelectedVacancy(null);
    setVacancyMaterials([]);
    updateURL(company._id, null);
  };

  const handleVacancySelect = (vacancy) => {
    setSelectedVacancy(vacancy);
    if (selectedCompany) {
      updateURL(selectedCompany._id, vacancy._id);
    }
  };

  const handleBackToCompanies = () => {
    setSelectedCompany(null);
    setSelectedVacancy(null);
    setCompanyVacancies([]);
    setVacancyMaterials([]);
    navigate('/materials', { replace: true });
  };

  const handleBackToVacancies = () => {
    setSelectedVacancy(null);
    setVacancyMaterials([]);
    if (selectedCompany) {
      updateURL(selectedCompany._id, null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8 md:py-10 lg:py-12 max-w-7xl">
        {error && <Alert message={error} type="error" />}

        {loading ? (
          <Loading />
        ) : !selectedCompany ? (
          // Kompaniyalar ro'yxati
          companies.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="flex justify-center mb-4">
                <EmptyIcon className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg mb-2 font-semibold">
                Hozircha materiallar mavjud emas
              </p>
              <p className="text-gray-500 text-sm">
                Materiallarni ko'rish uchun qabul qilingan yoki intervyudan o'tgan bo'lishingiz kerak
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Kompaniyalarni tanlang
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {companies.map((company) => (
                  <motion.div
                    key={company._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    onClick={() => handleCompanySelect(company)}
                    className="bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-xl transition-all duration-200 p-6 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-blue-600">
                          {company.name?.[0]?.toUpperCase() || 'C'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                          {company.name}
                        </h3>
                        {company.inn && (
                          <p className="text-sm text-gray-500">INN: {company.inn}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span className="text-blue-600 text-sm font-medium">
                        Vakansiyalarni ko'rish →
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        ) : !selectedVacancy ? (
          // Tanlangan kompaniyaning vakansiyalari
          <div>
            <button
              onClick={handleBackToCompanies}
              className="mb-6 text-blue-600 hover:text-blue-700 inline-flex items-center text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kompaniyalarga qaytish
            </button>
            
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              {selectedCompany.name} vakansiyalari
            </h2>

            {companyVacancies.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <div className="flex justify-center mb-4">
                  <EmptyIcon className="w-16 h-16 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg mb-2 font-semibold">
                  Bu kompaniyada o'quv kurslari mavjud vakansiyalar topilmadi
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companyVacancies.map((vacancy) => (
                  <motion.div
                    key={vacancy._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    onClick={() => handleVacancySelect(vacancy)}
                    className="bg-white border border-gray-200 rounded-lg hover:border-blue-300 shadow-md hover:shadow-xl transition-all duration-200 p-6 cursor-pointer"
                  >
                    <div className="flex flex-col space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                            {vacancy.title}
                          </h3>
                          {vacancy.company && (
                            <p className="text-base text-gray-700 font-medium mb-2">
                              {vacancy.company.name}
                            </p>
                          )}
                        </div>
                        {vacancy.salary && (
                          <div className="text-right flex-shrink-0">
                            <div className="text-lg font-bold text-green-600 whitespace-nowrap">
                              {formatCurrency(vacancy.salary)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
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
                      </div>

                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-blue-600 text-sm font-medium">
                          Darslarni ko'rish →
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Tanlangan vakansiyaning darslari (materiallar)
          <div>
            <button
              onClick={handleBackToVacancies}
              className="mb-6 text-blue-600 hover:text-blue-700 inline-flex items-center text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Vakansiyalarga qaytish
            </button>
            
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              {selectedVacancy.title} - Darslar
            </h2>

            {vacancyMaterials.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <div className="flex justify-center mb-4">
                  <EmptyIcon className="w-16 h-16 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg mb-2 font-semibold">
                  Bu vakansiyada darslar mavjud emas
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vacancyMaterials.map((material) => (
                  <Link
                    key={material._id}
                    to={`/materials/${material._id}`}
                    state={{
                      companyId: selectedCompany?._id,
                      vacancyId: selectedVacancy?._id,
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-xl transition-all duration-200 p-6 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                            {material.title}
                          </h3>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center ml-4 flex-shrink-0">
                          <BookIcon className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>

                      {material.description && (
                        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                          {material.description}
                        </p>
                      )}

                      {material.tests && material.tests.length > 0 && (
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <TestIcon className="w-4 h-4 mr-2" />
                          <span>{material.tests.length} ta test</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          {formatDate(material.createdAt)}
                        </span>
                        <span className="text-blue-600 text-sm font-medium">
                          O'qish →
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialsPage;
