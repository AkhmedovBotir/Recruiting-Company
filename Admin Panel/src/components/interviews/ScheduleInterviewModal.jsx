/**
 * Schedule Interview Modal Component
 * Schedules a new interview for a candidate
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ScheduleInterviewModal = ({ isOpen, onClose, onSchedule, candidate, vacancyId }) => {
  const [formData, setFormData] = useState({
    candidateId: '',
    vacancyId: vacancyId || '',
    content: '',
    interviewer: '',
    location: '',
    date: '',
    time: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (candidate) {
        const candidateId = candidate.candidate?.id || candidate.candidate?._id || candidate.id || candidate._id || '';
        setFormData((prev) => ({
          ...prev,
          candidateId: candidateId,
          vacancyId: vacancyId || prev.vacancyId,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          candidateId: '',
          vacancyId: vacancyId || prev.vacancyId,
        }));
      }
      setErrors({});
    }
  }, [isOpen, candidate, vacancyId]);

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.candidateId) {
      newErrors.candidateId = 'Nomzod tanlash majburiy';
    }

    if (!formData.vacancyId) {
      newErrors.vacancyId = 'Vakansiya tanlash majburiy';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Suhbat mazmuni majburiy';
    } else if (formData.content.trim().length < 10) {
      newErrors.content = 'Suhbat mazmuni kamida 10 belgi bo\'lishi kerak';
    } else if (formData.content.trim().length > 5000) {
      newErrors.content = 'Suhbat mazmuni maksimal 5000 belgi bo\'lishi kerak';
    }

    if (!formData.interviewer.trim()) {
      newErrors.interviewer = 'Suhbat o\'tkazuvchi majburiy';
    } else if (formData.interviewer.trim().length < 2) {
      newErrors.interviewer = 'Suhbat o\'tkazuvchi kamida 2 belgi bo\'lishi kerak';
    } else if (formData.interviewer.trim().length > 200) {
      newErrors.interviewer = 'Suhbat o\'tkazuvchi maksimal 200 belgi bo\'lishi kerak';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Suhbat joyi majburiy';
    } else if (formData.location.trim().length < 2) {
      newErrors.location = 'Suhbat joyi kamida 2 belgi bo\'lishi kerak';
    } else if (formData.location.trim().length > 500) {
      newErrors.location = 'Suhbat joyi maksimal 500 belgi bo\'lishi kerak';
    }

    if (!formData.date) {
      newErrors.date = 'Sana majburiy';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Sana bugungi kundan oldin bo\'lishi mumkin emas';
      }
    }

    if (!formData.time) {
      newErrors.time = 'Vaqt majburiy';
    } else if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(formData.time)) {
      newErrors.time = 'Vaqt HH:MM formatida bo\'lishi kerak (masalan: 14:00)';
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
      setLoading(true);
      setSubmitError(null);
      
      // Prepare data for API
      const interviewData = {
        candidateId: formData.candidateId,
        vacancyId: formData.vacancyId,
        content: formData.content.trim(),
        interviewer: formData.interviewer.trim(),
        location: formData.location.trim(),
        date: formData.date, // API expects YYYY-MM-DD format
        time: formData.time, // API expects HH:MM format
      };
      
      await onSchedule(interviewData);
      handleClose();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      const errorMessage = error.message || error.errors?.[0]?.msg || 'Suhbatni rejalashtirishda xatolik yuz berdi';
      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    setFormData({
      candidateId: '',
      vacancyId: vacancyId || '',
      content: '',
      interviewer: '',
      location: '',
      date: '',
      time: '',
    });
    setErrors({});
    setSubmitError(null);
    onClose();
  };

  if (!isOpen) return null;

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
            className="relative w-full max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-xl transition-all max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Suhbat Rejalashtirish</h3>
                <button
                  onClick={handleClose}
                  className="rounded-lg p-1 text-white hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {candidate && (
                <p className="text-sm text-blue-100 mt-1">
                  {candidate.candidate?.firstName} {candidate.candidate?.lastName}
                </p>
              )}
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="bg-white px-6 py-6 space-y-4">
                {/* Candidate Info (if provided) */}
                {candidate && candidate.candidate && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          {candidate.candidate.firstName} {candidate.candidate.lastName}
                        </p>
                        <p className="text-xs text-blue-700">{candidate.candidate.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Suhbat Mazmuni <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, content: e.target.value }));
                      if (errors.content) {
                        setErrors((prev) => ({ ...prev, content: '' }));
                      }
                    }}
                    rows={4}
                    maxLength={5000}
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.content ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Suhbat mazmunini kiriting (masalan: JavaScript va React bo'yicha texnik suhbat)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.content.length} / 5000 belgi
                  </p>
                  {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
                </div>

                {/* Interviewer */}
                <div>
                  <label htmlFor="interviewer" className="block text-sm font-medium text-gray-700 mb-2">
                    Suhbat O'tkazuvchi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="interviewer"
                    value={formData.interviewer}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, interviewer: e.target.value }));
                      if (errors.interviewer) {
                        setErrors((prev) => ({ ...prev, interviewer: '' }));
                      }
                    }}
                    maxLength={200}
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.interviewer ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Suhbat o'tkazuvchi ismi"
                  />
                  {errors.interviewer && <p className="mt-1 text-sm text-red-600">{errors.interviewer}</p>}
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Suhbat Joyi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, location: e.target.value }));
                      if (errors.location) {
                        setErrors((prev) => ({ ...prev, location: '' }));
                      }
                    }}
                    maxLength={500}
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.location ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Zoom: https://zoom.us/j/123456789 yoki manzil"
                  />
                  {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                      Sana <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="date"
                      value={formData.date}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, date: e.target.value }));
                        if (errors.date) {
                          setErrors((prev) => ({ ...prev, date: '' }));
                        }
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.date ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                  </div>

                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                      Vaqt <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      id="time"
                      value={formData.time}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, time: e.target.value }));
                        if (errors.time) {
                          setErrors((prev) => ({ ...prev, time: '' }));
                        }
                      }}
                      className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.time ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
                  </div>
                </div>

                {/* Error Message */}
                {submitError && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700">
                    {submitError}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end space-x-3 flex-shrink-0">
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
                  {loading ? 'Rejalashtirilmoqda...' : 'Rejalashtirish'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default ScheduleInterviewModal;

