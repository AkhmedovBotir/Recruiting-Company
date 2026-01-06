/**
 * View Application Modal Component
 * Displays detailed information about an application
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as applicationService from '../../services/applicationService.js';

const ViewApplicationModal = ({ isOpen, onClose, application, onStatusUpdate }) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);
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

  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  /**
   * Get status workflow steps
   */
  const getStatusWorkflow = () => {
    return [
      { value: 'pending', label: 'Kutilmoqda', icon: '⏳', color: 'yellow' },
      { value: 'reviewed', label: "Ko'rib chiqilgan", icon: '👁️', color: 'blue' },
      { value: 'interview', label: 'Intervyu', icon: '💼', color: 'purple' },
      { value: 'passed', label: "O'tgan", icon: '✅', color: 'green' },
      { value: 'failed', label: "O'tmagan", icon: '❌', color: 'red' },
      { value: 'accepted', label: 'Qabul qilingan', icon: '🎉', color: 'emerald' },
      { value: 'rejected', label: 'Rad etilgan', icon: '🚫', color: 'gray' },
    ];
  };

  /**
   * Get next available statuses based on current status
   */
  const getNextStatuses = () => {
    const currentStatus = application?.status || 'pending';
    const workflow = getStatusWorkflow();
    
    // Define workflow progression
    const workflowMap = {
      pending: ['reviewed'],
      reviewed: ['interview', 'rejected'],
      interview: ['passed', 'failed'],
      passed: ['accepted', 'rejected'],
      failed: ['rejected'],
      accepted: [],
      rejected: [],
    };

    const nextStatuses = workflowMap[currentStatus] || [];
    return workflow.filter((s) => nextStatuses.includes(s.value));
  };

  /**
   * Handle quick status update
   */
  const handleQuickStatusUpdate = async (newStatus) => {
    if (!application || updatingStatus) return;

    try {
      setUpdatingStatus(true);
      let response;
      
      if (newStatus === 'interview') {
        response = await applicationService.acceptInterview(application._id, {});
      } else if (newStatus === 'passed') {
        response = await applicationService.markInterviewPassed(application._id, {});
      } else if (newStatus === 'failed') {
        response = await applicationService.markInterviewFailed(application._id, {});
      } else {
        response = await applicationService.updateApplicationStatus(application._id, { status: newStatus });
      }

      if (response && response.success && onStatusUpdate) {
        await onStatusUpdate();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  /**
   * Get current status index in workflow
   * Handles parallel paths (passed/failed) correctly
   */
  const getCurrentStatusIndex = () => {
    const workflow = getStatusWorkflow();
    const currentStatus = application?.status || 'pending';
    const index = workflow.findIndex((s) => s.value === currentStatus);
    
    // For passed/failed, use interview index + 1 (they come after interview)
    if (currentStatus === 'passed' || currentStatus === 'failed') {
      const interviewIndex = workflow.findIndex((s) => s.value === 'interview');
      return interviewIndex + 1;
    }
    
    // For accepted/rejected after passed, use passed index + 1
    if (currentStatus === 'accepted') {
      const passedIndex = workflow.findIndex((s) => s.value === 'passed');
      return passedIndex + 1;
    }
    
    return index >= 0 ? index : 0;
  };

  if (!isOpen || !application) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 transition-opacity z-40"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4 relative z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl transform overflow-hidden rounded-xl bg-white shadow-xl transition-all max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">
                    {application.candidate?.firstName} {application.candidate?.lastName}
                  </h3>
                  <div className="flex items-center space-x-3 mt-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                        application.status
                      )}`}
                    >
                      {getStatusText(application.status)}
                    </span>
                    <span className="text-sm text-blue-100">
                      {application.vacancy?.title || 'Vakansiya'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1 text-white hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              <div className="bg-white px-6 py-6 space-y-6">
                {/* Candidate Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Nomzod Ma'lumotlari</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Ism</p>
                      <p className="text-base font-semibold text-gray-900">
                        {application.candidate?.firstName || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Familiya</p>
                      <p className="text-base font-semibold text-gray-900">
                        {application.candidate?.lastName || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Telefon</p>
                      <p className="text-base font-semibold text-gray-900">
                        {application.candidate?.phone || 'N/A'}
                      </p>
                    </div>
                    {application.candidate?.telegramId && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-500 mb-1">Telegram ID</p>
                        <p className="text-base font-semibold text-gray-900">
                          {application.candidate.telegramId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vacancy Information */}
                {application.vacancy && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Vakansiya Ma'lumotlari</h4>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-lg font-bold text-gray-900 mb-2">{application.vacancy.title}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Bo'lim</p>
                          <p className="text-base font-semibold text-gray-900">
                            {application.vacancy.department || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Lavozim</p>
                          <p className="text-base font-semibold text-gray-900">
                            {application.vacancy.position || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Ish Turi</p>
                          <p className="text-base font-semibold text-gray-900 capitalize">
                            {application.vacancy.workType === 'fulltime'
                              ? "To'liq ish kuni"
                              : "Qisman ish kuni"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Oylik</p>
                          <p className="text-base font-semibold text-gray-900">
                            {application.vacancy.salary || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Tajriba</p>
                          <p className="text-base font-semibold text-gray-900">
                            {application.vacancy.experience || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Yosh</p>
                          <p className="text-base font-semibold text-gray-900">
                            {application.vacancy.minAge} - {application.vacancy.maxAge} yosh
                          </p>
                        </div>
                      </div>
                      {application.vacancy.company && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-500 mb-1">Kompaniya</p>
                          <p className="text-base font-semibold text-gray-900">
                            {application.vacancy.company.name}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">INN: {application.vacancy.company.inn}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Application Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Topshirish Ma'lumotlari</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                      <p
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {getStatusText(application.status)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Topshirilgan sana</p>
                      <p className="text-base font-semibold text-gray-900">
                        {formatDate(application.createdAt)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Yangilangan sana</p>
                      <p className="text-base font-semibold text-gray-900">
                        {formatDate(application.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {application.notes && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Eslatma</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{application.notes}</p>
                    </div>
                  </div>
                )}

                {/* Status Workflow */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Status Workflow</h4>
                  
                  {/* Workflow Steps */}
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200">
                      <div
                        className="absolute top-0 left-0 w-full bg-blue-600 transition-all duration-500"
                        style={{
                          height: `${Math.min((getCurrentStatusIndex() / Math.max(getStatusWorkflow().length - 1, 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>

                    {/* Steps */}
                    <div className="space-y-6">
                      {getStatusWorkflow().map((step, index) => {
                        const isActive = step.value === application.status;
                        const currentIndex = getCurrentStatusIndex();
                        
                        // For passed/failed, check if we're past interview
                        let isCompleted = false;
                        if (step.value === 'passed' || step.value === 'failed') {
                          const interviewIndex = getStatusWorkflow().findIndex((s) => s.value === 'interview');
                          isCompleted = currentIndex > interviewIndex && !isActive;
                        } else if (step.value === 'accepted' || step.value === 'rejected') {
                          // Accepted/rejected are completed if we're past passed/failed
                          const passedIndex = getStatusWorkflow().findIndex((s) => s.value === 'passed');
                          const failedIndex = getStatusWorkflow().findIndex((s) => s.value === 'failed');
                          isCompleted = (currentIndex > passedIndex || currentIndex > failedIndex) && !isActive;
                        } else {
                          isCompleted = currentIndex > index && !isActive;
                        }
                        
                        const isNext = getNextStatuses().some((s) => s.value === step.value);
                        
                        // Hide steps that are not relevant to current path
                        const shouldShow = 
                          isActive || 
                          isCompleted || 
                          isNext || 
                          index <= currentIndex ||
                          (step.value === 'passed' && application.status === 'accepted') ||
                          (step.value === 'failed' && application.status === 'rejected');

                        if (!shouldShow && !isActive && !isNext && !isCompleted) {
                          return null;
                        }

                        return (
                          <div key={step.value} className="relative flex items-start">
                            {/* Step Circle */}
                            <div
                              className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 transition-all duration-300 ${
                                isActive
                                  ? 'bg-blue-600 border-blue-600 shadow-lg scale-110'
                                  : isCompleted
                                  ? 'bg-green-600 border-green-600'
                                  : isNext
                                  ? 'bg-yellow-100 border-yellow-400'
                                  : 'bg-white border-gray-300'
                              }`}
                            >
                              <span className={`text-2xl ${isActive || isCompleted ? 'text-white' : 'text-gray-500'}`}>
                                {step.icon}
                              </span>
                              {isActive && (
                                <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20" />
                              )}
                            </div>

                            {/* Step Content */}
                            <div className="ml-4 flex-1 pt-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5
                                    className={`text-base font-semibold ${
                                      isActive ? 'text-blue-900' : isCompleted ? 'text-green-900' : isNext ? 'text-yellow-900' : 'text-gray-600'
                                    }`}
                                  >
                                    {step.label}
                                  </h5>
                                  {isActive && (
                                    <p className="text-sm text-blue-600 mt-1">Joriy status</p>
                                  )}
                                  {isCompleted && (
                                    <p className="text-sm text-green-600 mt-1">Tugallangan</p>
                                  )}
                                </div>

                                {/* Quick Action Button */}
                                {isNext && !updatingStatus && (
                                  <button
                                    onClick={() => handleQuickStatusUpdate(step.value)}
                                    className="inline-flex items-center px-4 py-2 rounded-lg bg-yellow-100 text-yellow-800 text-sm font-medium hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors cursor-pointer"
                                  >
                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    O'tkazish
                                  </button>
                                )}
                                {isNext && updatingStatus && (
                                  <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium">
                                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                    Kutilmoqda...
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Next Steps Info */}
                  {getNextStatuses().length > 0 && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h5 className="text-sm font-semibold text-blue-900 mb-1">Keyingi qadamlar</h5>
                          <p className="text-sm text-blue-700">
                            Quyidagi statuslarga o'tkazish mumkin:{' '}
                            {getNextStatuses().map((s) => s.label).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Completed Workflow */}
                  {getNextStatuses().length === 0 && application.status !== 'rejected' && (
                    <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium text-green-900">
                          Workflow tugallandi. Nomzod {getStatusText(application.status)}.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end space-x-3 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default ViewApplicationModal;

