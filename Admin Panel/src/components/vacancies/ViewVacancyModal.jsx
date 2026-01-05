/**
 * View Vacancy Modal Component
 * Displays detailed information about a vacancy
 */

import { motion, AnimatePresence } from 'framer-motion';

const ViewVacancyModal = ({ isOpen, onClose, vacancy }) => {
  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  if (!isOpen || !vacancy) return null;

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
                  <h3 className="text-xl font-bold text-white">{vacancy.title}</h3>
                  <div className="flex items-center space-x-3 mt-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        vacancy.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {vacancy.status === 'active' ? 'Faol' : 'Yopilgan'}
                    </span>
                    <span className="text-sm text-blue-100">
                      {vacancy.company?.name || 'Kompaniya'}
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
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Bo'lim</p>
                    <p className="text-base font-semibold text-gray-900">{vacancy.department || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Lavozim</p>
                    <p className="text-base font-semibold text-gray-900">{vacancy.position || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Ish Turi</p>
                    <p className="text-base font-semibold text-gray-900 capitalize">
                      {vacancy.workType === 'fulltime' ? "To'liq ish kuni" : "Qisman ish kuni"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Oylik</p>
                    <p className="text-base font-semibold text-gray-900">
                      {vacancy.salary || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Tajriba</p>
                    <p className="text-base font-semibold text-gray-900">{vacancy.experience}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Yosh</p>
                    <p className="text-base font-semibold text-gray-900">
                      {vacancy.minAge} - {vacancy.maxAge} yosh
                    </p>
                  </div>
                </div>

                {/* Description */}
                {vacancy.description && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Tavsif</h4>
                    <div
                      className="prose max-w-none text-gray-700 bg-gray-50 rounded-lg p-4"
                      dangerouslySetInnerHTML={{ __html: vacancy.description }}
                    />
                  </div>
                )}

                {/* Responsibilities */}
                {vacancy.responsibilities && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Majburiyatlar</h4>
                    <div
                      className="prose max-w-none text-gray-700 bg-gray-50 rounded-lg p-4"
                      dangerouslySetInnerHTML={{ __html: vacancy.responsibilities }}
                    />
                  </div>
                )}

                {/* Preferences */}
                {vacancy.preferences && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Afzalliklar</h4>
                    <div
                      className="prose max-w-none text-gray-700 bg-gray-50 rounded-lg p-4"
                      dangerouslySetInnerHTML={{ __html: vacancy.preferences }}
                    />
                  </div>
                )}

                {/* Skills */}
                {vacancy.skills && vacancy.skills.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Ko'nikmalar</h4>
                    <div className="flex flex-wrap gap-2">
                      {vacancy.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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

export default ViewVacancyModal;

