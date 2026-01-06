/**
 * Cancel Interview Modal Component
 * Cancels a scheduled interview
 */

import { motion, AnimatePresence } from 'framer-motion';

const CancelInterviewModal = ({ isOpen, onClose, onCancel, interview, loading }) => {
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
          onClick={onClose}
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
            <div className="border-b border-gray-200 bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Suhbatni Bekor Qilish</h3>
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
            <div className="bg-white px-6 py-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="rounded-full bg-red-100 p-3">
                    <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>

                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Suhbatni bekor qilishni tasdiqlaysizmi?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Bu amalni qaytarib bo'lmaydi. Suhbat statusi "Bekor qilingan" ga o'zgaradi.
                  </p>
                </div>

                {interview.candidate && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Nomzod</p>
                    <p className="text-base font-semibold text-gray-900">
                      {interview.candidate.firstName} {interview.candidate.lastName}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={() => onCancel(interview._id || interview.id)}
                  disabled={loading}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Bekor qilinmoqda...' : 'Bekor Qilish'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default CancelInterviewModal;

