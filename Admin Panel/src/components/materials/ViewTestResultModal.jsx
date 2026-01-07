/**
 * View Test Result Modal Component
 * Displays detailed information about a test result
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as testResultService from '../../services/testResultService.js';

const ViewTestResultModal = ({ isOpen, onClose, testResult }) => {
  const [detailedResult, setDetailedResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && testResult) {
      loadDetailedResult();
    } else {
      setDetailedResult(null);
    }
  }, [isOpen, testResult]);

  /**
   * Load detailed test result
   */
  const loadDetailedResult = async () => {
    if (!testResult?.id && !testResult?._id) return;

    try {
      setLoading(true);
      const response = await testResultService.getTestResultById(testResult.id || testResult._id);
      if (response && response.success && response.data?.testResult) {
        setDetailedResult(response.data.testResult);
      }
    } catch (error) {
      console.error('Failed to load detailed test result:', error);
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
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  /**
   * Get score color
   */
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  /**
   * Get option label
   */
  const getOptionLabel = (index) => {
    return String.fromCharCode(65 + index); // A, B, C, D...
  };

  if (!isOpen || !testResult) return null;

  const result = detailedResult || testResult;

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
            className="relative w-full max-w-5xl transform overflow-hidden rounded-xl bg-white shadow-xl transition-all max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">Test Natijasi</h3>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className="text-sm text-blue-100">
                      {result.candidate?.firstName} {result.candidate?.lastName}
                    </span>
                    <span className="text-sm text-blue-100">•</span>
                    <span className="text-sm text-blue-100">
                      {result.material?.title || 'Material'}
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
                  {/* Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Jami Savollar</p>
                      <p className="text-2xl font-bold text-gray-900">{result.totalQuestions || 0}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-green-600 mb-1">To'g'ri Javoblar</p>
                      <p className="text-2xl font-bold text-green-700">{result.correctCount || 0}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-red-600 mb-1">Noto'g'ri Javoblar</p>
                      <p className="text-2xl font-bold text-red-700">{result.incorrectCount || 0}</p>
                    </div>
                    <div className={`rounded-lg p-4 ${getScoreColor(result.score || 0)}`}>
                      <p className="text-sm font-medium mb-1">Ball</p>
                      <p className="text-2xl font-bold">{result.score || 0}%</p>
                    </div>
                  </div>

                  {/* Candidate Information */}
                  {result.candidate && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Nomzod Ma'lumotlari</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-500 mb-1">Ism</p>
                          <p className="text-base font-semibold text-gray-900">
                            {result.candidate.firstName} {result.candidate.lastName}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-500 mb-1">Telefon</p>
                          <p className="text-base font-semibold text-gray-900">
                            {result.candidate.phone || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Material Information */}
                  {result.material && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Material Ma'lumotlari</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-base font-semibold text-gray-900 mb-2">{result.material.title}</p>
                        {result.material.vacancy && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              Vakansiya: {result.material.vacancy.title}
                            </p>
                            {result.material.vacancy.company && (
                              <p className="text-sm text-gray-600">
                                Kompaniya: {result.material.vacancy.company.name}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Answers */}
                  {result.answers && result.answers.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Savollar va Javoblar</h4>
                      <div className="space-y-4">
                        {result.answers.map((answer, index) => (
                          <div
                            key={index}
                            className={`border-2 rounded-lg p-4 ${
                              answer.isCorrect
                                ? 'border-green-200 bg-green-50'
                                : 'border-red-200 bg-red-50'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold mr-3">
                                  {index + 1}
                                </span>
                                <h5 className="text-base font-semibold text-gray-900">
                                  {answer.question || `Savol ${index + 1}`}
                                </h5>
                              </div>
                              {answer.isCorrect ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  To'g'ri
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Noto'g'ri
                                </span>
                              )}
                            </div>

                            {answer.options && answer.options.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {answer.options.map((option, optIndex) => {
                                  const optionLabel = getOptionLabel(optIndex);
                                  const isCorrect = optionLabel === answer.correctAnswer;
                                  const isUserAnswer = optionLabel === answer.userAnswer;

                                  return (
                                    <div
                                      key={optIndex}
                                      className={`flex items-center p-2 rounded-lg ${
                                        isCorrect
                                          ? 'bg-green-100 border-2 border-green-300'
                                          : isUserAnswer && !isCorrect
                                          ? 'bg-red-100 border-2 border-red-300'
                                          : 'bg-gray-50 border border-gray-200'
                                      }`}
                                    >
                                      <span
                                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold mr-2 ${
                                          isCorrect
                                            ? 'bg-green-600 text-white'
                                            : isUserAnswer && !isCorrect
                                            ? 'bg-red-600 text-white'
                                            : 'bg-gray-300 text-gray-700'
                                        }`}
                                      >
                                        {optionLabel}
                                      </span>
                                      <span className="text-sm text-gray-900 flex-1">{option}</span>
                                      {isCorrect && (
                                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                      {isUserAnswer && !isCorrect && (
                                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                  To'g'ri javob: <span className="font-semibold text-gray-900">{answer.correctAnswer}</span>
                                </span>
                                <span className="text-gray-600">
                                  Nomzod javobi: <span className={`font-semibold ${
                                    answer.isCorrect ? 'text-green-600' : 'text-red-600'
                                  }`}>{answer.userAnswer || 'N/A'}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Application Information */}
                  {result.application && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Application Ma'lumotlari</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                            <p className="text-base font-semibold text-gray-900 capitalize">
                              {result.application.status || 'N/A'}
                            </p>
                          </div>
                          {result.application.notes && (
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">Eslatma</p>
                              <p className="text-base text-gray-900">{result.application.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submission Date */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Topshirilgan sana</p>
                    <p className="text-base font-semibold text-gray-900">
                      {formatDate(result.submittedAt || result.createdAt)}
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

export default ViewTestResultModal;


