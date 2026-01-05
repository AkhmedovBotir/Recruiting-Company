/**
 * View Application Modal Component
 * Displays detailed information about an application
 */

import { motion, AnimatePresence } from 'framer-motion';

const ViewApplicationModal = ({ isOpen, onClose, application }) => {
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

