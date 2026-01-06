/**
 * Certificate Verification Page
 * Public page to verify certificate by QR code
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as certificateService from '../services/certificateService.js';

const CertificateVerify = () => {
  const { qrCode } = useParams();
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (qrCode) {
      verifyCertificate();
    }
  }, [qrCode]);

  /**
   * Verify certificate
   */
  const verifyCertificate = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await certificateService.verifyCertificate(qrCode);
      if (response && response.success) {
        setVerificationData(response.data);
      }
    } catch (err) {
      console.error('Error verifying certificate:', err);
      setError(err.message || 'Sertifikat topilmadi yoki bekor qilingan');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
              <p className="mt-4 text-lg text-gray-600">Tekshirilmoqda...</p>
            </div>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center"
          >
            <div className="rounded-full bg-red-100 p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sertifikat Topilmadi</h2>
            <p className="text-gray-600">{error}</p>
          </motion.div>
        ) : verificationData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Sertifikat Tekshiruvi</h1>
                  <p className="text-blue-100">
                    Sertifikat raqami: <span className="font-mono font-semibold">{verificationData.certificate?.certificateNumber}</span>
                  </p>
                </div>
                <div className="bg-white/20 rounded-lg px-4 py-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    verificationData.certificate?.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {verificationData.certificate?.status === 'active' ? '✓ Faol' : '✗ Bekor qilingan'}
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 space-y-8">
              {/* Candidate Information */}
              {verificationData.candidate && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Nomzod Ma'lumotlari
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                      <p className="text-sm font-medium text-blue-700 mb-2">To'liq Ism</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {verificationData.candidate.fullName || 
                         `${verificationData.candidate.firstName} ${verificationData.candidate.lastName}`}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                      <p className="text-sm font-medium text-blue-700 mb-2">Telefon</p>
                      <p className="text-xl font-semibold text-blue-900">
                        {verificationData.candidate.phone || 'N/A'}
                      </p>
                    </div>
                    {verificationData.candidate.telegramId && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                        <p className="text-sm font-medium text-blue-700 mb-2">Telegram ID</p>
                        <p className="text-xl font-semibold text-blue-900">
                          {verificationData.candidate.telegramId}
                        </p>
                      </div>
                    )}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                      <p className="text-sm font-medium text-blue-700 mb-2">Ro'yxatdan O'tish</p>
                      <p className="text-xl font-semibold text-blue-900 capitalize">
                        {verificationData.candidate.registrationType || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Vacancy Information */}
              {verificationData.vacancy && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Vakansiya Ma'lumotlari
                  </h2>
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
                    <h3 className="text-xl font-bold text-indigo-900 mb-4">{verificationData.vacancy.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-indigo-700 mb-1">Bo'lim</p>
                        <p className="text-base font-semibold text-indigo-900">{verificationData.vacancy.department || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-indigo-700 mb-1">Lavozim</p>
                        <p className="text-base font-semibold text-indigo-900">{verificationData.vacancy.position || 'N/A'}</p>
                      </div>
                      {verificationData.vacancy.company && (
                        <>
                          <div>
                            <p className="text-sm font-medium text-indigo-700 mb-1">Kompaniya</p>
                            <p className="text-base font-semibold text-indigo-900">{verificationData.vacancy.company.name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-indigo-700 mb-1">INN</p>
                            <p className="text-base font-semibold text-indigo-900">{verificationData.vacancy.company.inn}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Interview Information */}
              {verificationData.interview && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Suhbat Ma'lumotlari
                  </h2>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-green-700 mb-1">Sana va Vaqt</p>
                        <p className="text-base font-semibold text-green-900">
                          {formatDate(verificationData.interview.date)} {verificationData.interview.time}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-700 mb-1">Suhbat O'tkazuvchi</p>
                        <p className="text-base font-semibold text-green-900">{verificationData.interview.interviewer}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-700 mb-1">Natija</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          verificationData.interview.result === 'passed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {verificationData.interview.result === 'passed' ? '✓ O\'tdi' : '✗ O\'tmadi'}
                        </span>
                      </div>
                    </div>
                    {verificationData.interview.content && (
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <p className="text-sm font-medium text-green-700 mb-2">Suhbat Mazmuni</p>
                        <p className="text-base text-green-900">{verificationData.interview.content}</p>
                      </div>
                    )}
                    {verificationData.interview.evaluations && verificationData.interview.evaluations.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-medium text-green-700">Baxolashlar</p>
                          {verificationData.interview.averageRating !== undefined && (
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg px-4 py-2">
                              <p className="text-xs text-white font-medium mb-0.5">O'rtacha Baxo</p>
                              <p className="text-xl font-bold text-white">{verificationData.interview.averageRating.toFixed(1)}/10</p>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          {verificationData.interview.evaluations.map((evaluation, index) => (
                            <div key={evaluation.id || evaluation._id || index} className="bg-white rounded-lg p-4 border border-green-200">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {evaluation.admin?.username || 'Admin'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatDate(evaluation.createdAt)}
                                  </p>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {evaluation.rating}/10
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{evaluation.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Test Results */}
              {verificationData.testResults && verificationData.testResults.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Test Natijalari
                    </h2>
                    {verificationData.averageTestScore !== undefined && (
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg px-4 py-2">
                        <p className="text-xs text-white font-medium mb-0.5">O'rtacha Ball</p>
                        <p className="text-xl font-bold text-white">{verificationData.averageTestScore.toFixed(1)}%</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {verificationData.testResults.map((result, index) => (
                      <div key={result.id || result._id || index} className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-purple-900 mb-1">
                              {result.material?.title || `Test ${index + 1}`}
                            </h3>
                            <p className="text-sm text-purple-700">
                              Topshirilgan: {formatDate(result.completedAt)}
                            </p>
                          </div>
                          <div className={`rounded-lg px-4 py-2 ${getScoreColor(result.score)}`}>
                            <p className="text-2xl font-bold">{result.score}%</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-white rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-500 mb-1">Jami Savollar</p>
                            <p className="text-lg font-bold text-gray-900">{result.totalQuestions || 0}</p>
                          </div>
                          <div className="bg-white rounded-lg p-3 text-center">
                            <p className="text-xs text-green-600 mb-1">To'g'ri</p>
                            <p className="text-lg font-bold text-green-700">{result.correctCount || 0}</p>
                          </div>
                          <div className="bg-white rounded-lg p-3 text-center">
                            <p className="text-xs text-red-600 mb-1">Noto'g'ri</p>
                            <p className="text-lg font-bold text-red-700">{result.incorrectCount || 0}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certificate Details */}
              {verificationData.certificate && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Sertifikat Tafsilotlari</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Sertifikat Raqami</p>
                      <p className="text-base font-mono font-semibold text-gray-900">
                        {verificationData.certificate.certificateNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Berilgan Sana</p>
                      <p className="text-base font-semibold text-gray-900">
                        {formatDate(verificationData.certificate.issuedDate)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

export default CertificateVerify;

