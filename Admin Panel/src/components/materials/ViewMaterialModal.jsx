/**
 * View Material Modal Component
 * Displays detailed information about a material
 */

import { motion, AnimatePresence } from 'framer-motion';

const ViewMaterialModal = ({ isOpen, onClose, material }) => {
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

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  const getOptionLetter = (index) => {
    return String.fromCharCode(65 + index); // A, B, C, D, ...
  };

  if (!isOpen || !material) return null;

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
                  <h3 className="text-xl font-bold text-white">{material.title}</h3>
                  <div className="flex items-center space-x-3 mt-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        material.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {material.isActive ? 'Faol' : 'Nofaol'}
                    </span>
                    {material.vacancy?.title && (
                      <span className="text-sm text-blue-100">{material.vacancy.title}</span>
                    )}
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
                {/* Video */}
                {material.videoUrl && getYouTubeEmbedUrl(material.videoUrl) && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Videodars</h4>
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <iframe
                        src={getYouTubeEmbedUrl(material.videoUrl)}
                        title={material.title}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {/* Description */}
                {material.description && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Tavsif</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{material.description}</p>
                    </div>
                  </div>
                )}

                {/* Vacancy and Company Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {material.vacancy && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Vakansiya</p>
                      <p className="text-base font-semibold text-gray-900">{material.vacancy.title || 'N/A'}</p>
                    </div>
                  )}
                  {material.company && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Kompaniya</p>
                      <p className="text-base font-semibold text-gray-900">{material.company.name || 'N/A'}</p>
                    </div>
                  )}
                </div>

                {/* Tests */}
                {material.tests && material.tests.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Testlar ({material.tests.length} ta)</h4>
                    <div className="space-y-4">
                      {material.tests.map((test, testIndex) => (
                        <div key={testIndex} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start justify-between mb-3">
                            <p className="text-base font-semibold text-gray-900 flex-1">
                              {testIndex + 1}. {test.question}
                            </p>
                          </div>
                          <div className="space-y-2">
                            {test.options && test.options.map((option, optionIndex) => {
                              const optionLetter = getOptionLetter(optionIndex);
                              const isCorrect = optionLetter === test.correctAnswer;
                              return (
                                <div
                                  key={optionIndex}
                                  className={`flex items-center p-2 rounded ${
                                    isCorrect
                                      ? 'bg-green-50 border border-green-200'
                                      : 'bg-white border border-gray-200'
                                  }`}
                                >
                                  <span
                                    className={`font-semibold mr-3 ${
                                      isCorrect ? 'text-green-600' : 'text-gray-600'
                                    }`}
                                  >
                                    {optionLetter}.
                                  </span>
                                  <span className={isCorrect ? 'text-green-900 font-medium' : 'text-gray-700'}>
                                    {option}
                                  </span>
                                  {isCorrect && (
                                    <svg className="w-5 h-5 text-green-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Yaratilgan sana</p>
                    <p className="text-base font-semibold text-gray-900">{formatDate(material.createdAt)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Yangilangan sana</p>
                    <p className="text-base font-semibold text-gray-900">{formatDate(material.updatedAt)}</p>
                  </div>
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

export default ViewMaterialModal;
