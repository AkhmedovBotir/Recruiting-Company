/**
 * View Interview Modal Component
 * Displays detailed information about an interview
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as interviewService from '../../services/interviewService.js';

const ViewInterviewModal = ({ isOpen, onClose, interview }) => {
  const [detailedInterview, setDetailedInterview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && interview) {
      loadDetailedInterview();
    } else {
      setDetailedInterview(null);
    }
  }, [isOpen, interview]);

  /**
   * Load detailed interview
   */
  const loadDetailedInterview = async () => {
    if (!interview?.id && !interview?._id) return;

    try {
      setLoading(true);
      const response = await interviewService.getInterviewById(interview.id || interview._id);
      if (response && response.success && response.data?.interview) {
        setDetailedInterview(response.data.interview);
      }
    } catch (error) {
      console.error('Failed to load detailed interview:', error);
    } finally {
      setLoading(false);
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
    }).format(date);
  };

  /**
   * Get status badge
   */
  const getStatusBadge = (status) => {
    const statusMap = {
      scheduled: { label: 'Rejalashtirilgan', color: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Yakunlangan', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Bekor qilingan', color: 'bg-red-100 text-red-800' },
    };
    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  /**
   * Get result badge
   */
  const getResultBadge = (result) => {
    const resultMap = {
      passed: { label: "O'tdi", color: 'bg-green-100 text-green-800' },
      failed: { label: "O'tmadi", color: 'bg-red-100 text-red-800' },
      pending: { label: 'Kutilmoqda', color: 'bg-yellow-100 text-yellow-800' },
    };
    const resultInfo = resultMap[result] || { label: result, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${resultInfo.color}`}>
        {resultInfo.label}
      </span>
    );
  };

  if (!isOpen || !interview) return null;

  const interviewData = detailedInterview || interview;

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
                  <h3 className="text-xl font-bold text-white">Suhbat Ma'lumotlari</h3>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className="text-sm text-blue-100">
                      {interviewData.candidate?.firstName} {interviewData.candidate?.lastName}
                    </span>
                    <span className="text-sm text-blue-100">•</span>
                    <span className="text-sm text-blue-100">
                      {interviewData.vacancy?.title || 'Vakansiya'}
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
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white px-6 py-6 space-y-6">
                  {/* Status and Result */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500 mb-2">Status</p>
                      {getStatusBadge(interviewData.status)}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500 mb-2">Natija</p>
                      {getResultBadge(interviewData.result)}
                    </div>
                  </div>

                  {/* Candidate Information */}
                  {interviewData.candidate && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Nomzod Ma'lumotlari</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-500 mb-1">Ism</p>
                          <p className="text-base font-semibold text-gray-900">
                            {interviewData.candidate.firstName} {interviewData.candidate.lastName}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-500 mb-1">Telefon</p>
                          <p className="text-base font-semibold text-gray-900">
                            {interviewData.candidate.phone || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vacancy Information */}
                  {interviewData.vacancy && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Vakansiya Ma'lumotlari</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-base font-semibold text-gray-900 mb-2">{interviewData.vacancy.title}</p>
                        {interviewData.vacancy.company && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              Kompaniya: {interviewData.vacancy.company.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Interview Details */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Suhbat Tafsilotlari</h4>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-500 mb-1">Mazmun</p>
                        <p className="text-base text-gray-900 whitespace-pre-wrap">{interviewData.content}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-500 mb-1">Suhbat O'tkazuvchi</p>
                          <p className="text-base font-semibold text-gray-900">{interviewData.interviewer}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-500 mb-1">Joy</p>
                          <p className="text-base font-semibold text-gray-900">{interviewData.location}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-500 mb-1">Sana</p>
                          <p className="text-base font-semibold text-gray-900">
                            {formatDate(interviewData.date)}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-500 mb-1">Vaqt</p>
                          <p className="text-base font-semibold text-gray-900">{interviewData.time}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Evaluations */}
                  {interviewData.evaluations && interviewData.evaluations.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Baxolashlar</h4>
                      <div className="space-y-4">
                        {interviewData.evaluations.map((evaluation, index) => (
                          <div key={evaluation._id || index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {evaluation.admin?.username || evaluation.admin?.email || 'Admin'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(evaluation.createdAt)}
                                </p>
                              </div>
                              <div className="flex items-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {evaluation.rating}/10
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{evaluation.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Created Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Yaratilgan</p>
                    <p className="text-base font-semibold text-gray-900">
                      {formatDate(interviewData.createdAt)} • {interviewData.createdBy?.username || 'Admin'}
                    </p>
                  </div>
                </div>
              )}
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

export default ViewInterviewModal;

