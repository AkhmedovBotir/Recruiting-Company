/**
 * Complete Interview Modal Component
 * Completes an interview and sets the result
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CompleteInterviewModal = ({ isOpen, onClose, onComplete, interview, loading }) => {
  const [result, setResult] = useState('pending');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (interview) {
      setResult(interview.result || 'pending');
      setErrors({});
    }
  }, [interview]);

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors = {};

    if (!result || result === 'pending') {
      newErrors.result = 'Natija tanlash majburiy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onComplete(interview._id || interview.id, { result });
      handleClose();
    } catch (error) {
      // Error handling will be done in parent component
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    setResult('pending');
    setErrors({});
    onClose();
  };

  if (!isOpen || !interview) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 transition-opacity z-40"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4 relative z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md transform overflow-hidden rounded-xl bg-white shadow-xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Suhbatni Yakunlash</h3>
                <button
                  onClick={handleClose}
                  className="rounded-lg p-1 text-white hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {interview.candidate && (
                <p className="text-sm text-blue-100 mt-1">
                  {interview.candidate.firstName} {interview.candidate.lastName}
                </p>
              )}
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="bg-white px-6 py-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Natija <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setResult('passed');
                        if (errors.result) {
                          setErrors((prev) => ({ ...prev, result: '' }));
                        }
                      }}
                      className={`relative flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
                        result === 'passed'
                          ? 'bg-green-600 border-green-600 text-white shadow-lg'
                          : 'bg-green-50 border-green-300 text-green-800 hover:bg-green-100'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-semibold">O'tdi</span>
                      {result === 'passed' && (
                        <svg className="absolute top-2 right-2 w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setResult('failed');
                        if (errors.result) {
                          setErrors((prev) => ({ ...prev, result: '' }));
                        }
                      }}
                      className={`relative flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
                        result === 'failed'
                          ? 'bg-red-600 border-red-600 text-white shadow-lg'
                          : 'bg-red-50 border-red-300 text-red-800 hover:bg-red-100'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="font-semibold">O'tmadi</span>
                      {result === 'failed' && (
                        <svg className="absolute top-2 right-2 w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.result && <p className="mt-2 text-sm text-red-600">{errors.result}</p>}
                </div>

                {result && result !== 'pending' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-blue-700">
                        {result === 'passed'
                          ? "Nomzod suhbatdan o'tdi. Application statusi avtomatik 'passed' ga o'zgaradi."
                          : "Nomzod suhbatdan o'tmadi. Application statusi avtomatik 'failed' ga o'zgaradi."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={loading || result === 'pending'}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Yakunlanmoqda...' : 'Yakunlash'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default CompleteInterviewModal;


