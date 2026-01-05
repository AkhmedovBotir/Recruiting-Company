/**
 * Vacancies Page Component
 * CRUD operations for vacancies with company selector sidebar
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as vacancyService from '../services/vacancyService.js';
import * as companyService from '../services/companyService.js';
import CreateVacancyModal from '../components/vacancies/CreateVacancyModal.jsx';
import EditVacancyModal from '../components/vacancies/EditVacancyModal.jsx';
import DeleteVacancyModal from '../components/vacancies/DeleteVacancyModal.jsx';
import CloseVacancyModal from '../components/vacancies/CloseVacancyModal.jsx';
import ViewVacancyModal from '../components/vacancies/ViewVacancyModal.jsx';

const Vacancies = () => {
  const [vacancies, setVacancies] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Filters and search
  const [filters, setFilters] = useState({
    status: '',
    workType: '',
    search: '',
  });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [closeLoading, setCloseLoading] = useState(false);

  /**
   * Load companies
   */
  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const response = await companyService.getAllCompanies({ limit: 100, status: 'active' });
      if (response && response.success) {
        const companiesList = response.data?.companies || response.companies || [];
        setCompanies(companiesList);
        // Don't auto-select company - show all vacancies by default
        // User can select a company or "Barchasi" to see all
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  /**
   * Fetch vacancies
   */
  const fetchVacancies = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      // Only add company filter if a specific company is selected
      if (selectedCompany && selectedCompany._id) {
        params.company = selectedCompany._id;
      }

      if (filters.status) params.status = filters.status;
      if (filters.workType) params.workType = filters.workType;
      if (filters.search) params.search = filters.search;

      const response = await vacancyService.getAllVacancies(params);
      
      // Handle different response structures
      let vacanciesList = [];
      let paginationData = {
        page: params.page || 1,
        limit: params.limit || 10,
        total: 0,
        pages: 0,
      };

      if (response) {
        // Case 1: response.data.vacancies (standard structure)
        if (response.data && Array.isArray(response.data.vacancies)) {
          vacanciesList = response.data.vacancies;
          paginationData = response.data.pagination || paginationData;
        }
        // Case 2: response.vacancies (direct structure)
        else if (Array.isArray(response.vacancies)) {
          vacanciesList = response.vacancies;
          paginationData = response.pagination || paginationData;
        }
        // Case 3: response.data is array itself
        else if (Array.isArray(response.data)) {
          vacanciesList = response.data;
        }
        // Case 4: response is array itself
        else if (Array.isArray(response)) {
          vacanciesList = response;
        }
      }
      
      setVacancies(vacanciesList);
      setPagination(paginationData);
    } catch (err) {
      console.error('Error fetching vacancies:', err);
      setError(err.message || 'Vakansiyalarni yuklashda xatolik yuz berdi');
      setVacancies([]);
    } finally {
      setLoading(false);
    }
  };

  // Load companies on mount
  useEffect(() => {
    loadCompanies();
  }, []);

  // Reset pagination when company changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [selectedCompany]);

  // Fetch vacancies when dependencies change
  useEffect(() => {
    // Always fetch vacancies (for "Barchasi" or specific company)
    fetchVacancies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters.status, filters.workType, selectedCompany]);

  /**
   * Handle search with debounce
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page === 1) {
        fetchVacancies();
      } else {
        setPagination((prev) => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  /**
   * Handle create vacancy
   */
  const handleCreate = async (vacancyData) => {
    try {
      const response = await vacancyService.createVacancy(vacancyData);
      if (response.success) {
        await fetchVacancies();
        setIsCreateModalOpen(false);
      }
    } catch (err) {
      throw err;
    }
  };

  /**
   * Handle update vacancy
   */
  const handleUpdate = async (id, vacancyData) => {
    try {
      const response = await vacancyService.updateVacancy(id, vacancyData);
      if (response.success) {
        await fetchVacancies();
        setIsEditModalOpen(false);
        setSelectedVacancy(null);
      }
    } catch (err) {
      throw err;
    }
  };

  /**
   * Handle close vacancy
   */
  const handleCloseVacancy = async (id) => {
    try {
      setCloseLoading(true);
      const response = await vacancyService.closeVacancy(id);
      if (response.success) {
        await fetchVacancies();
        setIsCloseModalOpen(false);
        setSelectedVacancy(null);
      }
    } catch (err) {
      setError(err.message || 'Vakansiyani yopishda xatolik yuz berdi');
    } finally {
      setCloseLoading(false);
    }
  };

  /**
   * Handle delete vacancy
   */
  const handleDelete = async (id) => {
    try {
      setDeleteLoading(true);
      const response = await vacancyService.deleteVacancy(id);
      if (response.success) {
        await fetchVacancies();
        setIsDeleteModalOpen(false);
        setSelectedVacancy(null);
      }
    } catch (err) {
      setError(err.message || 'Vakansiyani o\'chirishda xatolik yuz berdi');
    } finally {
      setDeleteLoading(false);
    }
  };

  /**
   * Handle edit button click
   */
  const handleEditClick = (vacancy) => {
    setSelectedVacancy(vacancy);
    setIsEditModalOpen(true);
  };

  /**
   * Handle delete button click
   */
  const handleDeleteClick = (vacancy) => {
    setSelectedVacancy(vacancy);
    setIsDeleteModalOpen(true);
  };

  /**
   * Handle close button click
   */
  const handleCloseClick = (vacancy) => {
    setSelectedVacancy(vacancy);
    setIsCloseModalOpen(true);
  };

  /**
   * Handle view button click
   */
  const handleViewClick = (vacancy) => {
    setSelectedVacancy(vacancy);
    setIsViewModalOpen(true);
  };

  /**
   * Handle page change
   */
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  /**
   * Handle search change
   */
  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  /**
   * Strip HTML tags for preview
   */
  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="flex h-full">
      {/* Company Selector Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Kompaniyalar</h2>
          <p className="text-sm text-gray-500 mt-1">Vakansiyalarini ko'rish uchun kompaniya tanlang</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loadingCompanies ? (
            <div className="flex items-center justify-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="p-2">
              {/* Barchasi Button */}
              <button
                onClick={() => setSelectedCompany(null)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors cursor-pointer ${
                  !selectedCompany
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="font-medium text-gray-900">Barchasi</div>
                <div className="text-sm text-gray-500 mt-1">Barcha vakansiyalar</div>
              </button>
              
              {/* Companies List */}
              {companies.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>Kompaniyalar topilmadi</p>
                </div>
              ) : (
                companies.map((company) => (
                  <button
                    key={company._id}
                    onClick={() => setSelectedCompany(company)}
                    className={`w-full text-left p-3 rounded-lg mb-2 transition-colors cursor-pointer ${
                      selectedCompany?._id === company._id
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{company.name}</div>
                    <div className="text-sm text-gray-500 mt-1">INN: {company.inn}</div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vakansiyalar</h1>
              <p className="mt-2 text-gray-600">
                {selectedCompany ? `${selectedCompany.name} - Vakansiyalarni boshqarish` : 'Barcha vakansiyalar'}
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              disabled={!selectedCompany}
              className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                selectedCompany
                  ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
              }`}
            >
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Yangi Vakansiya
            </button>
          </div>

          <>
            {/* Filters and Search */}
              <div className="mb-6 rounded-xl bg-white p-4 shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  {/* Search */}
                  <div>
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                      Qidirish
                    </label>
                    <input
                      type="text"
                      id="search"
                      value={filters.search}
                      onChange={handleSearchChange}
                      placeholder="Vakansiya nomi, bo'lim..."
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="">Barchasi</option>
                      <option value="active">Faol</option>
                      <option value="close">Yopilgan</option>
                    </select>
                  </div>

                  {/* Work Type Filter */}
                  <div>
                    <label htmlFor="workType" className="block text-sm font-medium text-gray-700 mb-2">
                      Ish Turi
                    </label>
                    <select
                      id="workType"
                      name="workType"
                      value={filters.workType}
                      onChange={handleFilterChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="">Barchasi</option>
                      <option value="fulltime">To'liq ish kuni</option>
                      <option value="parttime">Qisman ish kuni</option>
                    </select>
                  </div>

                  {/* Results Count */}
                  <div className="flex items-end">
                    <p className="text-sm text-gray-600">
                      Jami: <span className="font-semibold text-gray-900">{pagination.total}</span> vakansiya
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700">
                  {error}
                </div>
              )}

              {/* Loading State */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
                  </div>
                </div>
              ) : vacancies.length === 0 ? (
                <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-gray-200">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Vakansiyalar topilmadi</h3>
                  <p className="mt-1 text-sm text-gray-500">Yangi vakansiya qo'shishni boshlang.</p>
                </div>
              ) : (
                <>
                  {/* Vacancies Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {vacancies.map((vacancy, index) => (
                      <motion.div
                        key={vacancy._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                      >
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-bold text-white line-clamp-2 flex-1 pr-2">
                              {vacancy.title}
                            </h3>
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold flex-shrink-0 ${
                                vacancy.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {vacancy.status === 'active' ? 'Faol' : 'Yopilgan'}
                            </span>
                          </div>
                          {vacancy.company?.name && (
                            <p className="text-sm text-blue-100">{vacancy.company.name}</p>
                          )}
                        </div>

                        {/* Card Body */}
                        <div className="p-5 flex-1 flex flex-col">
                          {/* Key Information */}
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center text-sm">
                              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span className="text-gray-600">{vacancy.department || 'N/A'}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className="text-gray-600">{vacancy.position || 'N/A'}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-gray-900 font-semibold">{vacancy.salary || 'N/A'}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-gray-600 capitalize">
                                {vacancy.workType === 'fulltime' ? "To'liq ish kuni" : "Qisman ish kuni"}
                              </span>
                            </div>
                            <div className="flex items-center text-sm">
                              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-gray-600">{vacancy.experience}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="text-gray-600">{vacancy.minAge} - {vacancy.maxAge} yosh</span>
                            </div>
                          </div>

                          {/* Skills Preview */}
                          {vacancy.skills && vacancy.skills.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs font-medium text-gray-500 mb-2">Ko'nikmalar</p>
                              <div className="flex flex-wrap gap-1">
                                {vacancy.skills.slice(0, 3).map((skill) => (
                                  <span
                                    key={skill}
                                    className="inline-flex px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 font-medium"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {vacancy.skills.length > 3 && (
                                  <span className="inline-flex px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 font-medium">
                                    +{vacancy.skills.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Description Preview */}
                          {vacancy.description && (
                            <div className="mb-4 flex-1">
                              <p className="text-xs font-medium text-gray-500 mb-2">Tavsif</p>
                              <p className="text-sm text-gray-700 line-clamp-3">
                                {stripHtml(vacancy.description)}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="mt-auto pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between gap-2">
                              <button
                                onClick={() => handleViewClick(vacancy)}
                                className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Ko'rish
                              </button>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEditClick(vacancy)}
                                  disabled={!selectedCompany}
                                  className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors ${
                                    selectedCompany
                                      ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 cursor-pointer'
                                      : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                                  }`}
                                  title={selectedCompany ? "Tahrirlash" : "Kompaniya tanlang"}
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                {vacancy.status === 'active' && (
                                  <button
                                    onClick={() => handleCloseClick(vacancy)}
                                    disabled={!selectedCompany}
                                    className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors ${
                                      selectedCompany
                                        ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700 cursor-pointer'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                                    }`}
                                    title={selectedCompany ? "Yopish" : "Kompaniya tanlang"}
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteClick(vacancy)}
                                  disabled={!selectedCompany}
                                  className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors ${
                                    selectedCompany
                                      ? 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 cursor-pointer'
                                      : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                                  }`}
                                  title={selectedCompany ? "O'chirish" : "Kompaniya tanlang"}
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        <span>
                          Sahifa {pagination.page} / {pagination.pages}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Oldingi
                        </button>
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.pages}
                          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Keyingi
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
          </>

          {/* Modals */}
          <CreateVacancyModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={handleCreate}
            selectedCompanyId={selectedCompany?._id}
          />

          <EditVacancyModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedVacancy(null);
            }}
            onUpdate={handleUpdate}
            vacancy={selectedVacancy}
          />

          <DeleteVacancyModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedVacancy(null);
            }}
            onDelete={handleDelete}
            vacancy={selectedVacancy}
            loading={deleteLoading}
          />

          <CloseVacancyModal
            isOpen={isCloseModalOpen}
            onClose={() => {
              setIsCloseModalOpen(false);
              setSelectedVacancy(null);
            }}
            onCloseVacancy={handleCloseVacancy}
            vacancy={selectedVacancy}
            loading={closeLoading}
          />

          <ViewVacancyModal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedVacancy(null);
            }}
            vacancy={selectedVacancy}
          />
        </div>
      </div>
    </div>
  );
};

export default Vacancies;

