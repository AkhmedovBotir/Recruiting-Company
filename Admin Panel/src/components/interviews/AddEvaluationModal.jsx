/**
 * Add Evaluation Modal Component
 * Adds an evaluation to an interview
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';

const AddEvaluationModal = ({ isOpen, onClose, onAdd, onUpdate, interview, loading }) => {
  const { admin } = useAuth();
  const [formData, setFormData] = useState({
    text: '',
    rating: 5,
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  /**
   * Check if current admin has already added an evaluation
   */
  const hasExistingEvaluation = () => {
    if (!admin || !interview?.evaluations) return false;
    const adminId = admin._id || admin.id;
    return interview.evaluations.some(
      (evaluation) => (evaluation.admin?._id || evaluation.admin?.id || evaluation.admin) === adminId
    );
  };

  /**
   * Get existing evaluation by current admin
   */
  const getExistingEvaluation = () => {
    if (!admin || !interview?.evaluations) return null;
    const adminId = admin._id || admin.id;
    return interview.evaluations.find(
      (evaluation) => (evaluation.admin?._id || evaluation.admin?.id || evaluation.admin) === adminId
    );
  };

  useEffect(() => {
    if (isOpen) {
      const existingEvaluation = getExistingEvaluation();
      if (existingEvaluation) {
        // Load existing evaluation data
        setFormData({
          text: existingEvaluation.text || '',
          rating: existingEvaluation.rating || 5,
        });
      } else {
        // Reset form for new evaluation
        setFormData({ text: '', rating: 5 });
      }
      setErrors({});
      setSubmitError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, interview]);

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.text.trim()) {
      newErrors.text = 'Baxolash matni majburiy';
    } else if (formData.text.trim().length < 10) {
      newErrors.text = 'Baxolash matni kamida 10 belgi bo\'lishi kerak';
    } else if (formData.text.trim().length > 2000) {
      newErrors.text = 'Baxolash matni maksimal 2000 belgi bo\'lishi kerak';
    }

    if (!formData.rating || formData.rating < 1 || formData.rating > 10) {
      newErrors.rating = 'Baxo 1-10 orasida bo\'lishi kerak';
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
      setSubmitError(null);
      const existingEvaluation = getExistingEvaluation();
      
      if (existingEvaluation && onUpdate) {
        // Update existing evaluation
        await onUpdate(
          interview._id || interview.id,
          existingEvaluation._id || existingEvaluation.id,
          formData
        );
      } else if (onAdd) {
        // Add new evaluation
        await onAdd(interview._id || interview.id, formData);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving evaluation:', error);
      const errorMessage = error.message || error.errors?.[0]?.msg || 'Baxolashni saqlashda xatolik yuz berdi';
      setSubmitError(errorMessage);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    setFormData({ text: '', rating: 5 });
    setErrors({});
    setSubmitError(null);
    onClose();
  };

  if (!isOpen || !interview) return null;

  const existingEvaluation = getExistingEvaluation();
  const hasEvaluation = hasExistingEvaluation();

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
            className="relative w-full max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {hasEvaluation ? 'Baxolashni Yangilash' : 'Baxolash Qo\'shish'}
                </h3>
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
                {/* Info if evaluation exists */}
                {hasEvaluation && existingEvaluation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-800 mb-1">
                          Mavjud baxolashni yangilayapsiz
                        </p>
                        <p className="text-xs text-blue-700">
                          Siz bu suhbatga allaqachon baxolash qo'shgansiz. Quyidagi maydonlarni o'zgartirib, baxolashni yangilashingiz mumkin.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-red-700">{submitError}</p>
                    </div>
                  </div>
                )}
                {/* Rating */}
                <div>
                  <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
                    Baxo (1-10) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      id="rating"
                      min="1"
                      max="10"
                      value={formData.rating}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, rating: parseInt(e.target.value) }));
                        if (errors.rating) {
                          setErrors((prev) => ({ ...prev, rating: '' }));
                        }
                      }}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="w-16 text-center">
                      <span className="text-2xl font-bold text-blue-600">{formData.rating}</span>
                      <span className="text-sm text-gray-500">/10</span>
                    </div>
                  </div>
                  {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating}</p>}
                </div>

                {/* Text */}
                <div>
                  <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                    Baxolash Matni <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="text"
                    value={formData.text}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, text: e.target.value }));
                      if (errors.text) {
                        setErrors((prev) => ({ ...prev, text: '' }));
                      }
                    }}
                    rows={6}
                    maxLength={2000}
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.text ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Baxolash matnini kiriting (masalan: Yaxshi bilimga ega, muammolarni hal qilish qobiliyati yuqori...)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.text.length} / 2000 belgi
                  </p>
                  {errors.text && <p className="mt-1 text-sm text-red-600">{errors.text}</p>}
                </div>
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
                  disabled={loading}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading 
                    ? (hasEvaluation ? "Yangilanmoqda..." : "Qo'shilmoqda...") 
                    : (hasEvaluation ? "Yangilash" : "Qo'shish")
                  }
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default AddEvaluationModal;

