/**
 * Applications Page Component
 * View and manage candidate applications with company → vacancy → applications structure
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as applicationService from '../services/applicationService.js';
import * as vacancyService from '../services/vacancyService.js';
import * as companyService from '../services/companyService.js';
import ViewApplicationModal from '../components/applications/ViewApplicationModal.jsx';
import UpdateStatusModal from '../components/applications/UpdateStatusModal.jsx';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingVacancies, setLoadingVacancies] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    status: '',
  });

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

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
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  /**
   * Load vacancies for selected company
   */
  const loadVacancies = async () => {
    if (!selectedCompany || !selectedCompany._id) {
      setVacancies([]);
      setLoadingVacancies(false);
      setSelectedVacancy(null);
      return;
    }

    try {
      setLoadingVacancies(true);
      const response = await vacancyService.getAllVacancies({
        company: selectedCompany._id,
        limit: 100,
      });

      let vacanciesList = [];
      if (response) {
        if (response.data && Array.isArray(response.data.vacancies)) {
          vacanciesList = response.data.vacancies;
        } else if (Array.isArray(response.vacancies)) {
          vacanciesList = response.vacancies;
        } else if (Array.isArray(response.data)) {
          vacanciesList = response.data;
        } else if (Array.isArray(response)) {
          vacanciesList = response;
        }
      }
      setVacancies(vacanciesList);
      // Auto-select first vacancy if available
      if (vacanciesList.length > 0 && !selectedVacancy) {
        setSelectedVacancy(vacanciesList[0]);
      } else if (vacanciesList.length === 0) {
        setSelectedVacancy(null);
      }
    } catch (err) {
      console.error('Failed to load vacancies:', err);
      setVacancies([]);
    } finally {
      setLoadingVacancies(false);
    }
  };

  /**
   * Fetch applications
   */
  const fetchApplications = async () => {
    if (!selectedVacancy || !selectedVacancy._id) {
      setApplications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        vacancy: selectedVacancy._id,
      };

      if (filters.status) params.status = filters.status;

      const response = await applicationService.getAllApplications(params);

      let applicationsList = [];
      let paginationData = {
        page: params.page || 1,
        limit: params.limit || 10,
        total: 0,
        pages: 0,
      };

      if (response && response.success) {
        if (response.data && Array.isArray(response.data.applications)) {
          applicationsList = response.data.applications;
          paginationData = response.data.pagination || paginationData;
        } else if (Array.isArray(response.applications)) {
          applicationsList = response.applications;
          paginationData = response.pagination || paginationData;
        } else if (Array.isArray(response.data)) {
          applicationsList = response.data;
        }
      }

      setApplications(applicationsList);
      setPagination(paginationData);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.message || 'Nomzodlarni yuklashda xatolik yuz berdi');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadVacancies();
  }, [selectedCompany]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [selectedVacancy]);

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters.status, selectedVacancy]);

  /**
   * Handle status update
   */
  const handleStatusUpdate = async (id, status, notes) => {
    try {
      setUpdateLoading(true);
      let response;
      
      if (status === 'interview') {
        response = await applicationService.acceptInterview(id, { notes });
      } else if (status === 'passed') {
        response = await applicationService.markInterviewPassed(id, { notes });
      } else if (status === 'failed') {
        response = await applicationService.markInterviewFailed(id, { notes });
      } else {
        response = await applicationService.updateApplicationStatus(id, { status, notes });
      }

      if (response && response.success) {
        await fetchApplications();
        setIsUpdateStatusModalOpen(false);
        setSelectedApplication(null);
      }
    } catch (err) {
      throw err;
    } finally {
      setUpdateLoading(false);
    }
  };

  /**
   * Handle view button click
   */
  const handleViewClick = (application) => {
    setSelectedApplication(application);
    setIsViewModalOpen(true);
  };

  /**
   * Handle status button click
   */
  const handleStatusClick = (application) => {
    setSelectedApplication(application);
    setIsUpdateStatusModalOpen(true);
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
   * Get status badge color
   */
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      interview: 'bg-purple-100 text-purple-800',
      passed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      accepted: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Get status text
   */
  const getStatusText = (status) => {
    const texts = {
      pending: 'Kutilmoqda',
      reviewed: "Ko'rib chiqilgan",
      interview: 'Intervyu',
      passed: "O'tgan",
      failed: "O'tmagan",
      accepted: 'Qabul qilingan',
      rejected: 'Rad etilgan',
    };
    return texts[status] || status;
  };

  /**
   * Format date
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
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

      {/* Vacancies Sidebar */}
      {selectedCompany && (
        <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h2 className="text-lg font-semibold text-gray-900">Vakansiyalar</h2>
            <p className="text-sm text-gray-500 mt-1">{selectedCompany.name}</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loadingVacancies ? (
              <div className="flex items-center justify-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : vacancies.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>Vakansiyalar topilmadi</p>
              </div>
            ) : (
              <div className="p-2">
                {vacancies.map((vacancy) => (
                  <button
                    key={vacancy._id}
                    onClick={() => setSelectedVacancy(vacancy)}
                    className={`w-full text-left p-3 rounded-lg mb-2 transition-colors cursor-pointer ${
                      selectedVacancy?._id === vacancy._id
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-white border-2 border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900 line-clamp-1">{vacancy.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{vacancy.department || 'N/A'}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Nomzodlar</h1>
            <p className="mt-2 text-gray-600">
              {selectedVacancy
                ? `${selectedVacancy.title} - ${selectedCompany?.name || ''}`
                : selectedCompany
                ? `${selectedCompany.name} - Vakansiya tanlang`
                : 'Kompaniya tanlang'}
            </p>
          </div>

          {!selectedCompany ? (
            <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-gray-200">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Kompaniya tanlang</h3>
              <p className="mt-1 text-sm text-gray-500">Nomzodlarni ko'rish uchun chap tomondan kompaniya tanlang.</p>
            </div>
          ) : !selectedVacancy ? (
            <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-gray-200">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Vakansiya tanlang</h3>
              <p className="mt-1 text-sm text-gray-500">Nomzodlarni ko'rish uchun vakansiya tanlang.</p>
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="mb-6 rounded-xl bg-white p-4 shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                      <option value="pending">Kutilmoqda</option>
                      <option value="reviewed">Ko'rib chiqilgan</option>
                      <option value="interview">Intervyu</option>
                      <option value="passed">O'tgan</option>
                      <option value="failed">O'tmagan</option>
                      <option value="accepted">Qabul qilingan</option>
                      <option value="rejected">Rad etilgan</option>
                    </select>
                  </div>

                  {/* Results Count */}
                  <div className="flex items-end">
                    <p className="text-sm text-gray-600">
                      Jami: <span className="font-semibold text-gray-900">{pagination.total}</span> nomzod
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
              ) : applications.length === 0 ? (
                <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-gray-200">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nomzodlar topilmadi</h3>
                  <p className="mt-1 text-sm text-gray-500">Bu vakansiyaga hali nomzodlar topilmagan.</p>
                </div>
              ) : (
                <>
                  {/* Applications Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {applications.map((application, index) => (
                      <motion.div
                        key={application._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                      >
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-white">
                                {application.candidate?.firstName} {application.candidate?.lastName}
                              </h3>
                              <p className="text-sm text-blue-100 mt-1">
                                {application.candidate?.phone || 'N/A'}
                              </p>
                            </div>
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold flex-shrink-0 ${getStatusColor(
                                application.status
                              )}`}
                            >
                              {getStatusText(application.status)}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 flex-1 flex flex-col">
                          {/* Information */}
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center text-sm">
                              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-gray-900 font-medium line-clamp-1">
                                {application.vacancy?.title || 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center text-sm">
                              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span className="text-gray-600">
                                {application.vacancy?.company?.name || 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center text-sm">
                              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-gray-600">{formatDate(application.createdAt)}</span>
                            </div>
                          </div>

                          {/* Notes Preview */}
                          {application.notes && (
                            <div className="mb-4 flex-1">
                              <p className="text-xs font-medium text-gray-500 mb-2">Eslatma</p>
                              <p className="text-sm text-gray-700 line-clamp-3">{application.notes}</p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="mt-auto pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewClick(application)}
                                className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Ko'rish
                              </button>
                              <button
                                onClick={() => handleStatusClick(application)}
                                className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors cursor-pointer"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Status
                              </button>
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
          )}

          {/* Modals */}
          <ViewApplicationModal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedApplication(null);
            }}
            application={selectedApplication}
          />

          <UpdateStatusModal
            isOpen={isUpdateStatusModalOpen}
            onClose={() => {
              setIsUpdateStatusModalOpen(false);
              setSelectedApplication(null);
            }}
            onUpdate={handleStatusUpdate}
            application={selectedApplication}
            loading={updateLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Applications;

