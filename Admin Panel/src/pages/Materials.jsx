/**
 * Materials Page Component
 * View and manage materials with company → vacancy → materials structure
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as materialService from '../services/materialService.js';
import * as vacancyService from '../services/vacancyService.js';
import * as companyService from '../services/companyService.js';
import * as testResultService from '../services/testResultService.js';
import * as interviewService from '../services/interviewService.js';
import CreateMaterialModal from '../components/materials/CreateMaterialModal.jsx';
import EditMaterialModal from '../components/materials/EditMaterialModal.jsx';
import DeleteMaterialModal from '../components/materials/DeleteMaterialModal.jsx';
import ViewMaterialModal from '../components/materials/ViewMaterialModal.jsx';
import ViewTestResultModal from '../components/materials/ViewTestResultModal.jsx';
import ScheduleInterviewModal from '../components/interviews/ScheduleInterviewModal.jsx';
import ViewInterviewModal from '../components/interviews/ViewInterviewModal.jsx';
import CompleteInterviewModal from '../components/interviews/CompleteInterviewModal.jsx';
import AddEvaluationModal from '../components/interviews/AddEvaluationModal.jsx';
import CancelInterviewModal from '../components/interviews/CancelInterviewModal.jsx';

const Materials = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('materials'); // 'materials', 'testResults', or 'interviews'

  const [materials, setMaterials] = useState([]);
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

  // Test Results state
  const [testResults, setTestResults] = useState([]);
  const [loadingTestResults, setLoadingTestResults] = useState(false);
  const [testResultsPagination, setTestResultsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    isActive: '',
  });

  // Test Results filters
  const [testResultsFilters, setTestResultsFilters] = useState({
    minScore: '',
    maxScore: '',
  });

  // Interviews state
  const [candidatesReady, setCandidatesReady] = useState([]);
  const [loadingCandidatesReady, setLoadingCandidatesReady] = useState(false);
  const [candidatesReadyPagination, setCandidatesReadyPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const [interviews, setInterviews] = useState([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [interviewsPagination, setInterviewsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const [interviewsFilters, setInterviewsFilters] = useState({
    status: '',
    result: '',
  });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isViewTestResultModalOpen, setIsViewTestResultModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedTestResult, setSelectedTestResult] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Interview modal states
  const [isScheduleInterviewModalOpen, setIsScheduleInterviewModalOpen] = useState(false);
  const [isViewInterviewModalOpen, setIsViewInterviewModalOpen] = useState(false);
  const [isCompleteInterviewModalOpen, setIsCompleteInterviewModalOpen] = useState(false);
  const [isAddEvaluationModalOpen, setIsAddEvaluationModalOpen] = useState(false);
  const [isCancelInterviewModalOpen, setIsCancelInterviewModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [interviewLoading, setInterviewLoading] = useState(false);

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
   * Fetch materials
   */
  const fetchMaterials = async () => {
    if (!selectedVacancy || !selectedVacancy._id) {
      setMaterials([]);
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
        company: selectedCompany?._id,
      };

      if (filters.isActive !== '') {
        params.isActive = filters.isActive === 'true';
      }

      const response = await materialService.getAllMaterials(params);

      let materialsList = [];
      let paginationData = {
        page: params.page || 1,
        limit: params.limit || 10,
        total: 0,
        pages: 0,
      };

      if (response && response.success) {
        if (response.data && Array.isArray(response.data.materials)) {
          materialsList = response.data.materials;
          paginationData = response.data.pagination || paginationData;
        } else if (Array.isArray(response.materials)) {
          materialsList = response.materials;
          paginationData = response.pagination || paginationData;
        } else if (Array.isArray(response.data)) {
          materialsList = response.data;
        }
      }

      setMaterials(materialsList);
      setPagination(paginationData);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError(err.message || 'Materiallarni yuklashda xatolik yuz berdi');
      setMaterials([]);
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

  /**
   * Fetch test results
   */
  const fetchTestResults = async () => {
    if (!selectedVacancy || !selectedVacancy._id) {
      setTestResults([]);
      setLoadingTestResults(false);
      return;
    }

    try {
      setLoadingTestResults(true);
      setError(null);
      const params = {
        page: testResultsPagination.page,
        limit: testResultsPagination.limit,
        vacancyId: selectedVacancy._id,
      };

      if (testResultsFilters.minScore) params.minScore = testResultsFilters.minScore;
      if (testResultsFilters.maxScore) params.maxScore = testResultsFilters.maxScore;

      const response = await testResultService.getTestResultsByVacancy(selectedVacancy._id, params);

      let testResultsList = [];
      let paginationData = {
        page: params.page || 1,
        limit: params.limit || 10,
        total: 0,
        pages: 0,
      };

      if (response && response.success) {
        if (response.data && Array.isArray(response.data.testResults)) {
          testResultsList = response.data.testResults;
          paginationData = response.data.pagination || paginationData;
        } else if (Array.isArray(response.testResults)) {
          testResultsList = response.testResults;
          paginationData = response.pagination || paginationData;
        } else if (Array.isArray(response.data)) {
          testResultsList = response.data;
        }
      }

      setTestResults(testResultsList);
      setTestResultsPagination(paginationData);
    } catch (err) {
      console.error('Error fetching test results:', err);
      setError(err.message || 'Test natijalarini yuklashda xatolik yuz berdi');
      setTestResults([]);
    } finally {
      setLoadingTestResults(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'materials') {
      fetchMaterials();
    } else if (activeTab === 'testResults') {
      fetchTestResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters.isActive, selectedVacancy, activeTab]);

  useEffect(() => {
    if (activeTab === 'testResults') {
      fetchTestResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testResultsPagination.page, testResultsFilters.minScore, testResultsFilters.maxScore]);

  /**
   * Fetch candidates ready for interview
   */
  const fetchCandidatesReady = async () => {
    if (!selectedVacancy || !selectedVacancy._id) {
      setCandidatesReady([]);
      setLoadingCandidatesReady(false);
      return;
    }

    try {
      setLoadingCandidatesReady(true);
      setError(null);
      const params = {
        page: candidatesReadyPagination.page,
        limit: candidatesReadyPagination.limit,
        vacancyId: selectedVacancy._id,
      };

      const response = await interviewService.getCandidatesReady(params);

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

      setCandidatesReady(candidatesList);
      setCandidatesReadyPagination(paginationData);
    } catch (err) {
      console.error('Error fetching candidates ready:', err);
      setError(err.message || 'Nomzodlarni yuklashda xatolik yuz berdi');
      setCandidatesReady([]);
    } finally {
      setLoadingCandidatesReady(false);
    }
  };

  /**
   * Fetch interviews
   */
  const fetchInterviews = async () => {
    if (!selectedVacancy || !selectedVacancy._id) {
      setInterviews([]);
      setLoadingInterviews(false);
      return;
    }

    try {
      setLoadingInterviews(true);
      setError(null);
      const params = {
        page: interviewsPagination.page,
        limit: interviewsPagination.limit,
        vacancyId: selectedVacancy._id,
      };

      if (interviewsFilters.status) params.status = interviewsFilters.status;
      if (interviewsFilters.result) params.result = interviewsFilters.result;

      const response = await interviewService.getAllInterviews(params);

      let interviewsList = [];
      let paginationData = {
        page: params.page || 1,
        limit: params.limit || 10,
        total: 0,
        pages: 0,
      };

      if (response && response.success) {
        if (response.data && Array.isArray(response.data.interviews)) {
          interviewsList = response.data.interviews;
          paginationData = response.data.pagination || paginationData;
        } else if (Array.isArray(response.interviews)) {
          interviewsList = response.interviews;
          paginationData = response.pagination || paginationData;
        }
      }

      setInterviews(interviewsList);
      setInterviewsPagination(paginationData);
    } catch (err) {
      console.error('Error fetching interviews:', err);
      setError(err.message || 'Suhbatlarni yuklashda xatolik yuz berdi');
      setInterviews([]);
    } finally {
      setLoadingInterviews(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'interviews') {
      fetchCandidatesReady();
      fetchInterviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedVacancy]);

  useEffect(() => {
    if (activeTab === 'interviews') {
      fetchCandidatesReady();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidatesReadyPagination.page]);

  useEffect(() => {
    if (activeTab === 'interviews') {
      fetchInterviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewsPagination.page, interviewsFilters.status, interviewsFilters.result]);

  /**
   * Handle create material
   */
  const handleCreate = async (materialData) => {
    try {
      const response = await materialService.createMaterial(materialData);
      if (response && response.success) {
        await fetchMaterials();
        setIsCreateModalOpen(false);
      }
    } catch (err) {
      throw err;
    }
  };

  /**
   * Handle update material
   */
  const handleUpdate = async (id, materialData) => {
    try {
      const response = await materialService.updateMaterial(id, materialData);
      if (response && response.success) {
        await fetchMaterials();
        setIsEditModalOpen(false);
        setSelectedMaterial(null);
      }
    } catch (err) {
      throw err;
    }
  };

  /**
   * Handle delete material
   */
  const handleDelete = async (id) => {
    try {
      setDeleteLoading(true);
      const response = await materialService.deleteMaterial(id);
      if (response && response.success) {
        await fetchMaterials();
        setIsDeleteModalOpen(false);
        setSelectedMaterial(null);
      }
    } catch (err) {
      setError(err.message || 'Materialni o\'chirishda xatolik yuz berdi');
    } finally {
      setDeleteLoading(false);
    }
  };

  /**
   * Handle view button click
   */
  const handleViewClick = (material) => {
    setSelectedMaterial(material);
    setIsViewModalOpen(true);
  };

  /**
   * Handle edit button click
   */
  const handleEditClick = (material) => {
    setSelectedMaterial(material);
    setIsEditModalOpen(true);
  };

  /**
   * Handle delete button click
   */
  const handleDeleteClick = (material) => {
    setSelectedMaterial(material);
    setIsDeleteModalOpen(true);
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
   * Handle interview filter change
   */
  const handleInterviewFilterChange = (e) => {
    const { name, value } = e.target;
    setInterviewsFilters((prev) => ({ ...prev, [name]: value }));
    setInterviewsPagination((prev) => ({ ...prev, page: 1 }));
  };

  /**
   * Handle schedule interview
   */
  const handleScheduleInterview = async (interviewData) => {
    try {
      setInterviewLoading(true);
      const response = await interviewService.scheduleInterview(interviewData);
      if (response && response.success) {
        await fetchCandidatesReady();
        await fetchInterviews();
        setIsScheduleInterviewModalOpen(false);
        setSelectedCandidate(null);
      }
    } catch (err) {
      throw err;
    } finally {
      setInterviewLoading(false);
    }
  };

  /**
   * Handle complete interview
   */
  const handleCompleteInterview = async (id, data) => {
    try {
      setInterviewLoading(true);
      const response = await interviewService.completeInterview(id, data);
      if (response && response.success) {
        await fetchInterviews();
        setIsCompleteInterviewModalOpen(false);
        setSelectedInterview(null);
      }
    } catch (err) {
      throw err;
    } finally {
      setInterviewLoading(false);
    }
  };

  /**
   * Handle cancel interview
   */
  const handleCancelInterview = async (id) => {
    try {
      setInterviewLoading(true);
      const response = await interviewService.cancelInterview(id);
      if (response && response.success) {
        await fetchInterviews();
        setIsCancelInterviewModalOpen(false);
        setSelectedInterview(null);
      }
    } catch (err) {
      throw err;
    } finally {
      setInterviewLoading(false);
    }
  };

  /**
   * Handle add evaluation
   */
  const handleAddEvaluation = async (id, evaluationData) => {
    try {
      setInterviewLoading(true);
      const response = await interviewService.addEvaluation(id, evaluationData);
      if (response && response.success) {
        await fetchInterviews();
        setIsAddEvaluationModalOpen(false);
        setSelectedInterview(null);
      }
    } catch (err) {
      throw err;
    } finally {
      setInterviewLoading(false);
    }
  };

  /**
   * Handle update evaluation
   */
  const handleUpdateEvaluation = async (id, evaluationId, evaluationData) => {
    try {
      setInterviewLoading(true);
      const response = await interviewService.updateEvaluation(id, evaluationId, evaluationData);
      if (response && response.success) {
        await fetchInterviews();
        setIsAddEvaluationModalOpen(false);
        setSelectedInterview(null);
      }
    } catch (err) {
      throw err;
    } finally {
      setInterviewLoading(false);
    }
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

  /**
   * Extract YouTube video ID from URL
   */
  const getYouTubeThumbnail = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
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
                <h1 className="text-3xl font-bold text-gray-900">Materiallar</h1>
                <p className="mt-2 text-gray-600">
                  {selectedVacancy
                    ? `${selectedVacancy.title} - ${selectedCompany?.name || ''}`
                    : selectedCompany
                    ? `${selectedCompany.name} - Vakansiya tanlang`
                    : 'Kompaniya tanlang'}
                </p>
              </div>
              {activeTab === 'materials' && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  disabled={!selectedVacancy}
                  className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    selectedVacancy
                      ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Yangi Material
                </button>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('materials')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'materials'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } cursor-pointer`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Materiallar
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('testResults')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'testResults'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } cursor-pointer`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Test Natijalari
                    {testResultsPagination.total > 0 && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {testResultsPagination.total}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('interviews')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'interviews'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } cursor-pointer`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Suhbatlar
                    {interviewsPagination.total > 0 && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {interviewsPagination.total}
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
              <p className="mt-1 text-sm text-gray-500">Materiallarni ko'rish uchun chap tomondan kompaniya tanlang.</p>
            </div>
          ) : !selectedVacancy ? (
            <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-gray-200">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Vakansiya tanlang</h3>
              <p className="mt-1 text-sm text-gray-500">Materiallarni ko'rish uchun vakansiya tanlang.</p>
            </div>
          ) : (
            <>
              {activeTab === 'materials' && (
                <>
                  {/* Filters */}
                  <div className="mb-6 rounded-xl bg-white p-4 shadow-sm border border-gray-200">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Active Status Filter */}
                  <div>
                    <label htmlFor="isActive" className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      id="isActive"
                      name="isActive"
                      value={filters.isActive}
                      onChange={handleFilterChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="">Barchasi</option>
                      <option value="true">Faol</option>
                      <option value="false">Nofaol</option>
                    </select>
                  </div>

                  {/* Results Count */}
                  <div className="flex items-end">
                    <p className="text-sm text-gray-600">
                      Jami: <span className="font-semibold text-gray-900">{pagination.total}</span> material
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
                ) : materials.length === 0 ? (
                  <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-gray-200">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Materiallar topilmadi</h3>
                    <p className="mt-1 text-sm text-gray-500">Bu vakansiyaga hali materiallar qo'shilmagan.</p>
                  </div>
                ) : (
                  <>
                    {/* Materials Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {materials.map((material, index) => (
                      <motion.div
                        key={material._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                      >
                        {/* Card Header with Video Thumbnail */}
                        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700">
                          {material.videoUrl && getYouTubeThumbnail(material.videoUrl) ? (
                            <div className="relative h-48 bg-gray-200">
                              <img
                                src={getYouTubeThumbnail(material.videoUrl)}
                                alt={material.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          ) : (
                            <div className="h-48 bg-blue-600 flex items-center justify-center">
                              <svg className="w-16 h-16 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          )}
                          <div className="absolute top-3 right-3">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                material.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {material.isActive ? 'Faol' : 'Nofaol'}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 flex-1 flex flex-col">
                          {/* Title */}
                          <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                            {material.title}
                          </h3>

                          {/* Information */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm">
                              <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-gray-600 line-clamp-1">
                                {material.vacancy?.title || 'N/A'}
                              </span>
                            </div>
                            {material.tests && material.tests.length > 0 && (
                              <div className="flex items-center text-sm">
                                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <span className="text-gray-600">
                                  {material.tests.length} ta test
                                </span>
                              </div>
                            )}
                            <div className="flex items-center text-sm">
                              <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-gray-600">{formatDate(material.createdAt)}</span>
                            </div>
                          </div>

                          {/* Description Preview */}
                          {material.description && (
                            <div className="mb-4 flex-1">
                              <p className="text-sm text-gray-700 line-clamp-3">{material.description}</p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="mt-auto pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewClick(material)}
                                className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Ko'rish
                              </button>
                              <button
                                onClick={() => handleEditClick(material)}
                                disabled={!selectedVacancy}
                                className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors ${
                                  selectedVacancy
                                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 cursor-pointer'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                                }`}
                                title={selectedVacancy ? "Tahrirlash" : "Vakansiya tanlang"}
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteClick(material)}
                                disabled={!selectedVacancy}
                                className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors ${
                                  selectedVacancy
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 cursor-pointer'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                                }`}
                                title={selectedVacancy ? "O'chirish" : "Vakansiya tanlang"}
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
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
              {activeTab === 'testResults' && (
                <>
                  {/* Test Results Tab Content */}
                  {/* Filters */}
                  <div className="mb-6 rounded-xl bg-white p-4 shadow-sm border border-gray-200">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      {/* Min Score Filter */}
                      <div>
                        <label htmlFor="minScore" className="block text-sm font-medium text-gray-700 mb-2">
                          Min. Ball
                        </label>
                        <input
                          type="number"
                          id="minScore"
                          name="minScore"
                          value={testResultsFilters.minScore}
                          onChange={(e) => {
                            setTestResultsFilters((prev) => ({ ...prev, minScore: e.target.value }));
                            setTestResultsPagination((prev) => ({ ...prev, page: 1 }));
                          }}
                          min="0"
                          max="100"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>

                      {/* Max Score Filter */}
                      <div>
                        <label htmlFor="maxScore" className="block text-sm font-medium text-gray-700 mb-2">
                          Max. Ball
                        </label>
                        <input
                          type="number"
                          id="maxScore"
                          name="maxScore"
                          value={testResultsFilters.maxScore}
                          onChange={(e) => {
                            setTestResultsFilters((prev) => ({ ...prev, maxScore: e.target.value }));
                            setTestResultsPagination((prev) => ({ ...prev, page: 1 }));
                          }}
                          min="0"
                          max="100"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="100"
                        />
                      </div>

                      {/* Results Count */}
                      <div className="flex items-end">
                        <p className="text-sm text-gray-600">
                          Jami: <span className="font-semibold text-gray-900">{testResultsPagination.total}</span> natija
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
                  {loadingTestResults ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
                      </div>
                    </div>
                  ) : testResults.length === 0 ? (
                    <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-gray-200">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Test natijalari topilmadi</h3>
                      <p className="mt-1 text-sm text-gray-500">Bu vakansiya uchun hali test natijalari mavjud emas.</p>
                    </div>
                  ) : (
                    <>
                      {/* Test Results Table */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Nomzod
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Material
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  To'g'ri
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Noto'g'ri
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Ball
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Sana
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Amallar
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {testResults.map((result, index) => (
                                <motion.tr
                                  key={result.id || result._id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                      {result.candidate?.firstName} {result.candidate?.lastName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {result.candidate?.phone || 'N/A'}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {result.material?.title || 'N/A'}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      {result.correctCount || 0}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      {result.incorrectCount || 0}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <span className={`text-sm font-semibold ${
                                        result.score >= 80 ? 'text-green-600' :
                                        result.score >= 60 ? 'text-yellow-600' :
                                        'text-red-600'
                                      }`}>
                                        {result.score || 0}%
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(result.submittedAt || result.createdAt)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                      onClick={() => {
                                        setSelectedTestResult(result);
                                        setIsViewTestResultModalOpen(true);
                                      }}
                                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
                                    >
                                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                      Ko'rish
                                    </button>
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Pagination */}
                      {testResultsPagination.pages > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                          <div className="text-sm text-gray-700">
                            <span>
                              Sahifa {testResultsPagination.page} / {testResultsPagination.pages}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setTestResultsPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                              disabled={testResultsPagination.page === 1}
                              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              Oldingi
                            </button>
                            <button
                              onClick={() => setTestResultsPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                              disabled={testResultsPagination.page === testResultsPagination.pages}
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
              {activeTab === 'interviews' && (
                <>
                  {/* Candidates Ready Section */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">Suhbatga Tayyor Nomzodlar</h2>
                      <p className="text-sm text-gray-600">
                        Jami: <span className="font-semibold text-gray-900">{candidatesReadyPagination.total}</span> nomzod
                      </p>
                    </div>

                    {loadingCandidatesReady ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                          <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
                        </div>
                      </div>
                    ) : candidatesReady.length === 0 ? (
                      <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-gray-200">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Tayyor nomzodlar topilmadi</h3>
                        <p className="mt-1 text-sm text-gray-500">Barcha materiallar uchun test topshirgan nomzodlar shu yerda ko'rsatiladi.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {candidatesReady.map((candidate, index) => (
                          <motion.div
                            key={candidate.candidate?.id || candidate.candidate?._id || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="text-base font-semibold text-gray-900">
                                  {candidate.candidate?.firstName} {candidate.candidate?.lastName}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">{candidate.candidate?.phone || 'N/A'}</p>
                              </div>
                              {candidate.hasInterview && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Suhbat mavjud
                                </span>
                              )}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mb-3">
                              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              {candidate.testResultsCount || 0} ta test
                            </div>
                            <button
                              onClick={() => {
                                setSelectedCandidate(candidate);
                                setIsScheduleInterviewModalOpen(true);
                              }}
                              disabled={candidate.hasInterview}
                              className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                candidate.hasInterview
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                              }`}
                            >
                              {candidate.hasInterview ? 'Suhbat Mavjud' : 'Suhbat Rejalashtirish'}
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Candidates Ready Pagination */}
                    {candidatesReadyPagination.pages > 1 && (
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          <span>
                            Sahifa {candidatesReadyPagination.page} / {candidatesReadyPagination.pages}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setCandidatesReadyPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                            disabled={candidatesReadyPagination.page === 1}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            Oldingi
                          </button>
                          <button
                            onClick={() => setCandidatesReadyPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                            disabled={candidatesReadyPagination.page === candidatesReadyPagination.pages}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            Keyingi
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Interviews List Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">Suhbatlar</h2>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 rounded-xl bg-white p-4 shadow-sm border border-gray-200">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                          <label htmlFor="interviewStatus" className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                          </label>
                          <select
                            id="interviewStatus"
                            name="status"
                            value={interviewsFilters.status}
                            onChange={handleInterviewFilterChange}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value="">Barchasi</option>
                            <option value="scheduled">Rejalashtirilgan</option>
                            <option value="completed">Yakunlangan</option>
                            <option value="cancelled">Bekor qilingan</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="interviewResult" className="block text-sm font-medium text-gray-700 mb-2">
                            Natija
                          </label>
                          <select
                            id="interviewResult"
                            name="result"
                            value={interviewsFilters.result}
                            onChange={handleInterviewFilterChange}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value="">Barchasi</option>
                            <option value="passed">O'tdi</option>
                            <option value="failed">O'tmadi</option>
                            <option value="pending">Kutilmoqda</option>
                          </select>
                        </div>

                        <div className="flex items-end">
                          <p className="text-sm text-gray-600">
                            Jami: <span className="font-semibold text-gray-900">{interviewsPagination.total}</span> suhbat
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
                    {loadingInterviews ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                          <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
                        </div>
                      </div>
                    ) : interviews.length === 0 ? (
                      <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-gray-200">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Suhbatlar topilmadi</h3>
                        <p className="mt-1 text-sm text-gray-500">Bu vakansiya uchun hali suhbatlar mavjud emas.</p>
                      </div>
                    ) : (
                      <>
                        {/* Interviews Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nomzod
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Suhbat O'tkazuvchi
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sana / Vaqt
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Natija
                                  </th>
                                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amallar
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {interviews.map((interview, index) => (
                                  <motion.tr
                                    key={interview._id || interview.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-medium text-gray-900">
                                        {interview.candidate?.firstName} {interview.candidate?.lastName}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {interview.candidate?.phone || 'N/A'}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="text-sm text-gray-900">{interview.interviewer}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">
                                        {formatDate(interview.date)}
                                      </div>
                                      <div className="text-sm text-gray-500">{interview.time}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        interview.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                        interview.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        'bg-red-100 text-red-800'
                                      }`}>
                                        {interview.status === 'scheduled' ? 'Rejalashtirilgan' :
                                         interview.status === 'completed' ? 'Yakunlangan' :
                                         'Bekor qilingan'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        interview.result === 'passed' ? 'bg-green-100 text-green-800' :
                                        interview.result === 'failed' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {interview.result === 'passed' ? "O'tdi" :
                                         interview.result === 'failed' ? "O'tmadi" :
                                         'Kutilmoqda'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <div className="flex items-center justify-end space-x-2">
                                        <button
                                          onClick={() => {
                                            setSelectedInterview(interview);
                                            setIsViewInterviewModalOpen(true);
                                          }}
                                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
                                        >
                                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                          </svg>
                                          Ko'rish
                                        </button>
                                        {interview.status === 'scheduled' && (
                                          <>
                                            <button
                                              onClick={() => {
                                                setSelectedInterview(interview);
                                                setIsCompleteInterviewModalOpen(true);
                                              }}
                                              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors cursor-pointer"
                                            >
                                              Yakunlash
                                            </button>
                                            <button
                                              onClick={() => {
                                                setSelectedInterview(interview);
                                                setIsCancelInterviewModalOpen(true);
                                              }}
                                              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors cursor-pointer"
                                            >
                                              Bekor
                                            </button>
                                          </>
                                        )}
                                        {interview.status === 'completed' && (
                                          <button
                                            onClick={() => {
                                              setSelectedInterview(interview);
                                              setIsAddEvaluationModalOpen(true);
                                            }}
                                            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors cursor-pointer"
                                          >
                                            Baxolash
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
                        {interviewsPagination.pages > 1 && (
                          <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                              <span>
                                Sahifa {interviewsPagination.page} / {interviewsPagination.pages}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setInterviewsPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                                disabled={interviewsPagination.page === 1}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              >
                                Oldingi
                              </button>
                              <button
                                onClick={() => setInterviewsPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                                disabled={interviewsPagination.page === interviewsPagination.pages}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              >
                                Keyingi
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* Modals */}
          <CreateMaterialModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={handleCreate}
            selectedVacancyId={selectedVacancy?._id}
            selectedCompanyId={selectedCompany?._id}
          />

          <EditMaterialModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedMaterial(null);
            }}
            onUpdate={handleUpdate}
            material={selectedMaterial}
          />

          <DeleteMaterialModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedMaterial(null);
            }}
            onDelete={handleDelete}
            material={selectedMaterial}
            loading={deleteLoading}
          />

          <ViewMaterialModal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedMaterial(null);
            }}
            material={selectedMaterial}
          />

          <ViewTestResultModal
            isOpen={isViewTestResultModalOpen}
            onClose={() => {
              setIsViewTestResultModalOpen(false);
              setSelectedTestResult(null);
            }}
            testResult={selectedTestResult}
          />

          {/* Interview Modals */}
          <ScheduleInterviewModal
            isOpen={isScheduleInterviewModalOpen}
            onClose={() => {
              setIsScheduleInterviewModalOpen(false);
              setSelectedCandidate(null);
            }}
            onSchedule={handleScheduleInterview}
            candidate={selectedCandidate}
            vacancyId={selectedVacancy?._id}
          />

          <ViewInterviewModal
            isOpen={isViewInterviewModalOpen}
            onClose={() => {
              setIsViewInterviewModalOpen(false);
              setSelectedInterview(null);
            }}
            interview={selectedInterview}
          />

          <CompleteInterviewModal
            isOpen={isCompleteInterviewModalOpen}
            onClose={() => {
              setIsCompleteInterviewModalOpen(false);
              setSelectedInterview(null);
            }}
            onComplete={handleCompleteInterview}
            interview={selectedInterview}
            loading={interviewLoading}
          />

          <AddEvaluationModal
            isOpen={isAddEvaluationModalOpen}
            onClose={() => {
              setIsAddEvaluationModalOpen(false);
              setSelectedInterview(null);
            }}
            onAdd={handleAddEvaluation}
            onUpdate={handleUpdateEvaluation}
            interview={selectedInterview}
            loading={interviewLoading}
          />

          <CancelInterviewModal
            isOpen={isCancelInterviewModalOpen}
            onClose={() => {
              setIsCancelInterviewModalOpen(false);
              setSelectedInterview(null);
            }}
            onCancel={handleCancelInterview}
            interview={selectedInterview}
            loading={interviewLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Materials;
