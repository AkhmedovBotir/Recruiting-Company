/**
 * Certificates Page Component
 * Manage certificates - create and view certificates
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as certificateService from '../services/certificateService.js';
import * as companyService from '../services/companyService.js';
import * as vacancyService from '../services/vacancyService.js';
import CreateCertificateModal from '../components/certificates/CreateCertificateModal.jsx';
import ViewCertificateModal from '../components/certificates/ViewCertificateModal.jsx';
import RevokeCertificateModal from '../components/certificates/RevokeCertificateModal.jsx';

const Certificates = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'list'

  // Companies and Vacancies
  const [companies, setCompanies] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingVacancies, setLoadingVacancies] = useState(true);

  // Eligible candidates state
  const [eligibleCandidates, setEligibleCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidatesPagination, setCandidatesPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Certificates list state
  const [certificates, setCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [certificatesPagination, setCertificatesPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const [certificatesFilters, setCertificatesFilters] = useState({
    status: '',
  });

  const [error, setError] = useState(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [certificateLoading, setCertificateLoading] = useState(false);

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
   * Fetch eligible candidates
   */
  const fetchEligibleCandidates = async () => {
    try {
      setLoadingCandidates(true);
      setError(null);
      const params = {
        page: candidatesPagination.page,
        limit: candidatesPagination.limit,
      };

      if (selectedVacancy?._id) {
        params.vacancyId = selectedVacancy._id;
      }

      const response = await certificateService.getCandidatesEligible(params);

      let candidatesList = [];
      let paginationData = {
        page: params.page || 1,
        limit: params.limit || 10,
        total: 0,
        pages: 0,
      };

      if (response && response.success) {
        if (response.data && Array.isArray(response.data.candidates)) {
          candidatesList = response.data.candidates;
          paginationData = response.data.pagination || paginationData;
        } else if (Array.isArray(response.candidates)) {
          candidatesList = response.candidates;
          paginationData = response.pagination || paginationData;
        }
      }

      setEligibleCandidates(candidatesList);
      setCandidatesPagination(paginationData);
    } catch (err) {
      console.error('Error fetching eligible candidates:', err);
      setError(err.message || 'Nomzodlarni yuklashda xatolik yuz berdi');
      setEligibleCandidates([]);
    } finally {
      setLoadingCandidates(false);
    }
  };

  /**
   * Fetch certificates
   */
  const fetchCertificates = async () => {
    try {
      setLoadingCertificates(true);
      setError(null);
      const params = {
        page: certificatesPagination.page,
        limit: certificatesPagination.limit,
      };

      if (selectedVacancy?._id) {
        params.vacancyId = selectedVacancy._id;
      }
      if (certificatesFilters.status) {
        params.status = certificatesFilters.status;
      }

      const response = await certificateService.getAllCertificates(params);

      let certificatesList = [];
      let paginationData = {
        page: params.page || 1,
        limit: params.limit || 10,
        total: 0,
        pages: 0,
      };

      if (response && response.success) {
        if (response.data && Array.isArray(response.data.certificates)) {
          certificatesList = response.data.certificates;
          paginationData = response.data.pagination || paginationData;
        } else if (Array.isArray(response.certificates)) {
          certificatesList = response.certificates;
          paginationData = response.pagination || paginationData;
        }
      }

      setCertificates(certificatesList);
      setCertificatesPagination(paginationData);
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError(err.message || 'Sertifikatlarni yuklashda xatolik yuz berdi');
      setCertificates([]);
    } finally {
      setLoadingCertificates(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    loadVacancies();
  }, [selectedCompany]);

  useEffect(() => {
    if (activeTab === 'create' && selectedVacancy) {
      fetchEligibleCandidates();
    }
  }, [activeTab, selectedVacancy, candidatesPagination.page]);

  useEffect(() => {
    if (activeTab === 'list') {
      fetchCertificates();
    }
  }, [activeTab, selectedVacancy, certificatesPagination.page, certificatesFilters.status]);

  /**
   * Handle issue certificate
   * Note: Certificate creation is now handled in the modal with image editor
   */
  const handleIssueCertificate = async (interviewId) => {
    try {
      setCertificateLoading(true);
      setError(null);
      
      // Validate interviewId
      if (!interviewId) {
        throw { message: 'Suhbat ID talab qilinadi' };
      }

      // Validate MongoDB ObjectId format
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(interviewId)) {
        throw { message: 'Noto\'g\'ri suhbat ID formati' };
      }

      console.log('Issuing certificate for interviewId:', interviewId);
      const response = await certificateService.issueCertificate({ interviewId });
      
      if (response && response.success) {
        await fetchEligibleCandidates();
        await fetchCertificates();
        setIsCreateModalOpen(false);
        setSelectedCandidate(null);
      }
      return response;
    } catch (err) {
      console.error('Error in handleIssueCertificate:', err);
      
      // Format error message for display
      let errorMessage = err.message || 'Sertifikat yaratishda xatolik yuz berdi';
      
      if (err.errors && Array.isArray(err.errors)) {
        if (err.errors.length > 0 && typeof err.errors[0] === 'string') {
          errorMessage = err.errors.join(', ');
        } else if (err.errors.length > 0 && err.errors[0]?.msg) {
          errorMessage = err.errors.map(e => e.msg || e).join(', ');
        }
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setCertificateLoading(false);
    }
  };

  /**
   * Handle revoke certificate
   */
  const handleRevokeCertificate = async (id) => {
    try {
      setCertificateLoading(true);
      const response = await certificateService.revokeCertificate(id);
      if (response && response.success) {
        await fetchCertificates();
        setIsRevokeModalOpen(false);
        setSelectedCertificate(null);
      }
    } catch (err) {
      throw err;
    } finally {
      setCertificateLoading(false);
    }
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setCertificatesFilters((prev) => ({ ...prev, [name]: value }));
    setCertificatesPagination((prev) => ({ ...prev, page: 1 }));
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Sertifikatlar</h1>
                <p className="mt-2 text-gray-600">
                  {selectedVacancy
                    ? `${selectedVacancy.title} - ${selectedCompany?.name || ''}`
                    : selectedCompany
                    ? `${selectedCompany.name} - Vakansiya tanlang`
                    : 'Kompaniya tanlang'}
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('create')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'create'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } cursor-pointer`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Sertifikat Yaratish
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('list')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'list'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } cursor-pointer`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Sertifikatlar
                    {certificatesPagination.total > 0 && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {certificatesPagination.total}
                      </span>
                    )}
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {!selectedCompany ? (
            <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-gray-200">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Kompaniya tanlang</h3>
              <p className="mt-1 text-sm text-gray-500">Sertifikatlarni ko'rish uchun chap tomondan kompaniya tanlang.</p>
            </div>
          ) : !selectedVacancy ? (
            <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-gray-200">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Vakansiya tanlang</h3>
              <p className="mt-1 text-sm text-gray-500">Sertifikatlarni ko'rish uchun vakansiya tanlang.</p>
            </div>
          ) : (
            <>
              {activeTab === 'create' && (
                <>
                  {/* Eligible Candidates Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">Sertifikatga Tayyor Nomzodlar</h2>
                      <p className="text-sm text-gray-600">
                        Jami: <span className="font-semibold text-gray-900">{candidatesPagination.total}</span> nomzod
                      </p>
                    </div>

                    {loadingCandidates ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                          <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
                        </div>
                      </div>
                    ) : eligibleCandidates.length === 0 ? (
                      <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-gray-200">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Tayyor nomzodlar topilmadi</h3>
                        <p className="mt-1 text-sm text-gray-500">Suhbatdan o'tgan va hali sertifikat olmagan nomzodlar shu yerda ko'rsatiladi.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {eligibleCandidates.map((item, index) => (
                          <motion.div
                            key={item.candidate?.id || item.candidate?._id || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="text-base font-semibold text-gray-900">
                                  {item.candidate?.firstName} {item.candidate?.lastName}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">{item.candidate?.phone || 'N/A'}</p>
                              </div>
                              {item.hasCertificate && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Sertifikat mavjud
                                </span>
                              )}
                            </div>
                            <div className="mb-3">
                              <p className="text-xs text-gray-500 mb-1">Vakansiya</p>
                              <p className="text-sm font-medium text-gray-900">{item.vacancy?.title || 'N/A'}</p>
                            </div>
                            {item.interview && (
                              <div className="mb-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                                <p>Suhbat: {formatDate(item.interview.date)} {item.interview.time}</p>
                                <p>Suhbat o'tkazuvchi: {item.interview.interviewer}</p>
                              </div>
                            )}
                            <button
                              onClick={() => {
                                setSelectedCandidate(item);
                                setIsCreateModalOpen(true);
                              }}
                              disabled={item.hasCertificate}
                              className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                item.hasCertificate
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                              }`}
                            >
                              {item.hasCertificate ? 'Sertifikat Mavjud' : 'Sertifikat Yaratish'}
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Pagination */}
                    {candidatesPagination.pages > 1 && (
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          <span>
                            Sahifa {candidatesPagination.page} / {candidatesPagination.pages}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setCandidatesPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                            disabled={candidatesPagination.page === 1}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            Oldingi
                          </button>
                          <button
                            onClick={() => setCandidatesPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                            disabled={candidatesPagination.page === candidatesPagination.pages}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            Keyingi
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'list' && (
                <>
                  {/* Filters */}
                  <div className="mb-6 rounded-xl bg-white p-4 shadow-sm border border-gray-200">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="certificateStatus" className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          id="certificateStatus"
                          name="status"
                          value={certificatesFilters.status}
                          onChange={handleFilterChange}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="">Barchasi</option>
                          <option value="active">Faol</option>
                          <option value="revoked">Bekor qilingan</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <p className="text-sm text-gray-600">
                          Jami: <span className="font-semibold text-gray-900">{certificatesPagination.total}</span> sertifikat
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
                  {loadingCertificates ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
                      </div>
                    </div>
                  ) : certificates.length === 0 ? (
                    <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-gray-200">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Sertifikatlar topilmadi</h3>
                      <p className="mt-1 text-sm text-gray-500">Bu vakansiya uchun hali sertifikatlar mavjud emas.</p>
                    </div>
                  ) : (
                    <>
                      {/* Certificates Table */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Nomzod
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Sertifikat Raqami
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Berilgan Sana
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Amallar
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {certificates.map((certificate, index) => (
                                <motion.tr
                                  key={certificate._id || certificate.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                      {certificate.candidate?.firstName} {certificate.candidate?.lastName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {certificate.candidate?.phone || 'N/A'}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-mono text-gray-900">{certificate.certificateNumber}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {formatDate(certificate.issuedDate)}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      certificate.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {certificate.status === 'active' ? 'Faol' : 'Bekor qilingan'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-2">
                                      <button
                                        onClick={() => {
                                          setSelectedCertificate(certificate);
                                          setIsViewModalOpen(true);
                                        }}
                                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
                                      >
                                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Ko'rish
                                      </button>
                                      {certificate.status === 'active' && (
                                        <button
                                          onClick={() => {
                                            setSelectedCertificate(certificate);
                                            setIsRevokeModalOpen(true);
                                          }}
                                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors cursor-pointer"
                                        >
                                          Bekor qilish
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Pagination */}
                      {certificatesPagination.pages > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                          <div className="text-sm text-gray-700">
                            <span>
                              Sahifa {certificatesPagination.page} / {certificatesPagination.pages}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setCertificatesPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                              disabled={certificatesPagination.page === 1}
                              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              Oldingi
                            </button>
                            <button
                              onClick={() => setCertificatesPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                              disabled={certificatesPagination.page === certificatesPagination.pages}
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
            </>
          )}

          {/* Modals */}
          <CreateCertificateModal
            isOpen={isCreateModalOpen}
            onClose={() => {
              setIsCreateModalOpen(false);
              setSelectedCandidate(null);
            }}
            onIssue={handleIssueCertificate}
            candidate={selectedCandidate}
            loading={certificateLoading}
          />

          <ViewCertificateModal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedCertificate(null);
            }}
            certificate={selectedCertificate}
          />

          <RevokeCertificateModal
            isOpen={isRevokeModalOpen}
            onClose={() => {
              setIsRevokeModalOpen(false);
              setSelectedCertificate(null);
            }}
            onRevoke={handleRevokeCertificate}
            certificate={selectedCertificate}
            loading={certificateLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Certificates;

