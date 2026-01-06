/**
 * View Certificate Modal Component
 * Displays certificate details and allows PDF download
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as certificateService from '../../services/certificateService.js';

const ViewCertificateModal = ({ isOpen, onClose, certificate }) => {
  const [detailedCertificate, setDetailedCertificate] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && certificate) {
      loadDetailedCertificate();
    } else {
      setDetailedCertificate(null);
    }
  }, [isOpen, certificate]);

  /**
   * Load detailed certificate
   */
  const loadDetailedCertificate = async () => {
    if (!certificate?.id && !certificate?._id) return;

    try {
      setLoading(true);
      const response = await certificateService.getCertificateById(certificate.id || certificate._id);
      if (response && response.success && response.data?.certificate) {
        const certData = response.data.certificate;
        console.log('Loaded certificate:', certData);
        console.log('Certificate base64 exists:', !!certData.certificateBase64);
        setDetailedCertificate(certData);
      }
    } catch (error) {
      console.error('Failed to load detailed certificate:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Download certificate image
   */
  const downloadCertificateImage = () => {
    if (!detailedCertificate?.certificateBase64) {
      alert('Sertifikat rasmi mavjud emas');
      return;
    }

    const link = document.createElement('a');
    link.href = detailedCertificate.certificateBase64;
    link.download = `Sertifikat_${detailedCertificate.candidate?.firstName || ''}_${detailedCertificate.candidate?.lastName || ''}_${detailedCertificate.certificateNumber || 'cert'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  if (!isOpen || !certificate) return null;

  const cert = detailedCertificate || certificate;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 overflow-y-auto" style={{ zIndex: 9999 }}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
          style={{ zIndex: 9998 }}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4 relative" style={{ zIndex: 9999 }}>
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
                  <h3 className="text-xl font-bold text-white">Sertifikat Ma'lumotlari</h3>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className="text-sm text-blue-100">
                      {cert.candidate?.firstName} {cert.candidate?.lastName}
                    </span>
                    <span className="text-sm text-blue-100">•</span>
                    <span className="text-sm text-blue-100">
                      {cert.certificateNumber || 'N/A'}
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
                  {/* Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500 mb-2">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        cert.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {cert.status === 'active' ? 'Faol' : 'Bekor qilingan'}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500 mb-2">Sertifikat Raqami</p>
                      <p className="text-base font-mono font-semibold text-gray-900">{cert.certificateNumber}</p>
                    </div>
                  </div>

                  {/* Candidate Information */}
                  {cert.candidate && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Nomzod Ma'lumotlari</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-500 mb-1">Ism</p>
                          <p className="text-base font-semibold text-gray-900">
                            {cert.candidate.firstName} {cert.candidate.lastName}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-500 mb-1">Telefon</p>
                          <p className="text-base font-semibold text-gray-900">
                            {cert.candidate.phone || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vacancy Information */}
                  {cert.vacancy && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Vakansiya Ma'lumotlari</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-base font-semibold text-gray-900 mb-2">{cert.vacancy.title}</p>
                        {cert.vacancy.company && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              Kompaniya: {cert.vacancy.company.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Certificate Details */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Sertifikat Tafsilotlari</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-500 mb-1">Berilgan Sana</p>
                        <p className="text-base font-semibold text-gray-900">
                          {formatDate(cert.issuedDate)}
                        </p>
                      </div>
                      {cert.issuedBy && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-500 mb-1">Bergan Admin</p>
                          <p className="text-base font-semibold text-gray-900">
                            {cert.issuedBy.username || cert.issuedBy.email || 'N/A'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Certificate Image */}
                  {detailedCertificate?.certificateBase64 ? (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Sertifikat Rasmi</h4>
                      <div className="bg-gray-50 rounded-lg p-4 flex justify-center">
                        <img
                          src={detailedCertificate.certificateBase64}
                          alt="Sertifikat"
                          className="max-w-full h-auto rounded-lg shadow-lg border border-gray-200"
                          style={{ maxHeight: '600px' }}
                          onError={(e) => {
                            console.error('Image load error:', e);
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Sertifikat Rasmi</h4>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                        <svg className="mx-auto h-12 w-12 text-yellow-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-sm font-medium text-yellow-800">Sertifikat rasmi hali saqlanmagan</p>
                        <p className="text-xs text-yellow-600 mt-1">Sertifikat editor orqali to'g'rilab saqlash kerak</p>
                      </div>
                    </div>
                  )}

                  {/* QR Code Info */}
                  {cert.qrCode && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-900 mb-2">QR Kod</p>
                      <p className="text-xs text-blue-700 font-mono break-all">
                        {cert.qrCode}
                      </p>
                      <p className="text-xs text-blue-600 mt-2">
                        QR kod skaner qilganda sertifikat ma'lumotlari ko'rsatiladi
                      </p>
                    </div>
                  )}
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
              {detailedCertificate?.certificateBase64 && (
                <button
                  type="button"
                  onClick={downloadCertificateImage}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <svg className="w-4 h-4 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Yuklab Olish
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default ViewCertificateModal;

