/**
 * Update Status Modal Component
 * Updates application status with notes
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const UpdateStatusModal = ({ isOpen, onClose, onUpdate, application, loading }) => {
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (application) {
      setStatus(application.status || '');
      setNotes(application.notes || '');
      setErrors({});
    }
  }, [application]);

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors = {};

    if (!status.trim()) {
      newErrors.status = 'Status tanlash majburiy';
    }

    if (notes && notes.trim().length > 1000) {
      newErrors.notes = 'Eslatma maksimal 1000 belgi bo\'lishi kerak';
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
      await onUpdate(application._id, status, notes.trim() || null);
      handleClose();
    } catch (error) {
      // Error handling will be done in parent component
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    setStatus('');
    setNotes('');
    setErrors({});
    onClose();
  };

  /**
   * Get available statuses based on current status
   */
  const getAvailableStatuses = () => {
    const currentStatus = application?.status || 'pending';
    const allStatuses = [
      { value: 'pending', label: 'Kutilmoqda' },
      { value: 'reviewed', label: "Ko'rib chiqilgan" },
      { value: 'interview', label: 'Intervyu' },
      { value: 'passed', label: "O'tgan" },
      { value: 'failed', label: "O'tmagan" },
      { value: 'accepted', label: 'Qabul qilingan' },
      { value: 'rejected', label: 'Rad etilgan' },
    ];

    // Allow all statuses for admin flexibility
    return allStatuses;
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
                <h3 className="text-lg font-semibold text-white">Status O'zgartirish</h3>
                <button
                  onClick={handleClose}
                  className="rounded-lg p-1 text-white hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-blue-100 mt-1">
                {application.candidate?.firstName} {application.candidate?.lastName}
              </p>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="bg-white px-6 py-6 space-y-6">
                {/* Current Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Joriy Status
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-base font-semibold text-gray-900">{application.status}</p>
                  </div>
                </div>

                {/* Status Selection */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Yangi Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      if (errors.status) {
                        setErrors((prev) => ({ ...prev, status: '' }));
                      }
                    }}
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.status ? 'border-red-300' : 'border-gray-300'
                    } cursor-pointer`}
                  >
                    <option value="">Status tanlang</option>
                    {getAvailableStatuses().map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Eslatma (ixtiyoriy)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      if (errors.notes) {
                        setErrors((prev) => ({ ...prev, notes: '' }));
                      }
                    }}
                    rows={5}
                    maxLength={1000}
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.notes ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Eslatma kiriting (maksimal 1000 belgi)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {notes.length} / 1000 belgi
                  </p>
                  {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                </div>
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
                  {loading ? 'Saqlanayapti...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default UpdateStatusModal;

