import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import { formatDate } from '../utils/helpers';

const CertificateDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [downloading, setDownloading] = useState(false);
    const [certificateImage, setCertificateImage] = useState(null);
    const [loadingImage, setLoadingImage] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchCertificate();
    }, [id, isAuthenticated]);

    const fetchCertificate = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.getCertificate(id);
            if (response.success) {
                setCertificate(response.data.certificate);
                // If certificate has base64 image, set it
                if (response.data.certificate.certificateBase64) {
                    setCertificateImage(response.data.certificate.certificateBase64);
                } else {
                    // Try to fetch image from download endpoint
                    fetchCertificateImage();
                }
            }
        } catch (err) {
            setError(err.message || 'Sertifikat ma\'lumotlarini yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    const fetchCertificateImage = async () => {
        setLoadingImage(true);
        try {
            const response = await api.downloadCertificate(id);
            if (response.success && response.data.certificateImageBase64) {
                setCertificateImage(response.data.certificateImageBase64);
            }
        } catch (err) {
            // Image not available, that's OK
            console.log('Sertifikat rasmi mavjud emas');
        } finally {
            setLoadingImage(false);
        }
    };

    const handleDownload = async () => {
        if (!certificate) return;

        setDownloading(true);
        setError('');
        try {
            const response = await api.downloadCertificate(id);
            if (response.success && response.data.certificateImageBase64) {
                // Convert base64 to blob and download
                const base64Data = response.data.certificateImageBase64.split(',')[1] || response.data.certificateImageBase64;
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'image/png' });

                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `certificate-${certificate.certificateNumber}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }
        } catch (err) {
            setError(err.message || 'Sertifikatni yuklab olishda xatolik');
        } finally {
            setDownloading(false);
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
                <div className="container mx-auto px-4 py-8">
                    <Loading />
                </div>
            </div>
        );
    }

    if (error && !certificate) {
        return (
            <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
                <div className="container mx-auto px-4 py-8">
                    <Alert message={error} type="error" />
                    <Link
                        to="/certificates"
                        className="mt-4 inline-block text-blue-500 hover:text-blue-600"
                    >
                        ← Sertifikatlarga qaytish
                    </Link>
                </div>
            </div>
        );
    }

    if (!certificate) {
        return null;
    }

    const { vacancy, interview, candidate } = certificate;
    const statusClass = certificate.status === 'active'
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800';
    const statusLabel = certificate.status === 'active' ? 'Faol' : 'Bekor qilingan';

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
            <div className="container mx-auto px-4 py-8 md:py-10 lg:py-12 max-w-7xl">
                <Link
                    to="/certificates"
                    className="text-blue-500 hover:text-blue-600 mb-4 inline-block"
                >
                    ← Sertifikatlarga qaytish
                </Link>

                {error && <Alert message={error} type="error" />}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-md p-4 md:p-8 mb-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">
                            Sertifikat ma'lumotlari
                        </h1>
                        <span
                            className={`px-4 py-2 rounded-full text-sm font-medium ${statusClass}`}
                        >
                            {statusLabel}
                        </span>
                    </div>

                    {/* Certificate Number */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Sertifikat raqami</p>
                        <p className="font-semibold text-lg">{certificate.certificateNumber}</p>
                    </div>

                    {/* Candidate Info */}
                    {candidate && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                            <h3 className="text-lg font-bold text-gray-800 mb-3">Nomzod ma'lumotlari</h3>
                            <div className="space-y-2">
                                <p className="text-gray-700">
                                    <span className="font-semibold">Ism:</span> {candidate.firstName} {candidate.lastName}
                                </p>
                                {candidate.phone && (
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Telefon:</span> {candidate.phone}
                                    </p>
                                )}
                                {candidate.telegramId && (
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Telegram:</span> {candidate.telegramId}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Vacancy Info */}
                    {vacancy && (
                        <div className="mb-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                            <h3 className="text-lg font-bold text-gray-800 mb-3">Vakansiya ma'lumotlari</h3>
                            <div className="space-y-2">
                                <p className="text-gray-700">
                                    <span className="font-semibold">Nomi:</span> {vacancy.title}
                                </p>
                                {vacancy.department && (
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Bo'lim:</span> {vacancy.department}
                                    </p>
                                )}
                                {vacancy.position && (
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Lavozim:</span> {vacancy.position}
                                    </p>
                                )}
                                {vacancy.company && (
                                    <div className="mt-3 pt-3 border-t border-green-200">
                                        <p className="text-gray-700 font-semibold mb-2">Kompaniya:</p>
                                        <p className="text-gray-700">{vacancy.company.name}</p>
                                        {vacancy.company.inn && (
                                            <p className="text-sm text-gray-600">INN: {vacancy.company.inn}</p>
                                        )}
                                        {vacancy.company.ownerFullName && (
                                            <p className="text-sm text-gray-600">Egası: {vacancy.company.ownerFullName}</p>
                                        )}
                                        {vacancy.company.companyPhone && (
                                            <p className="text-sm text-gray-600">Telefon: {vacancy.company.companyPhone}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Interview Info */}
                    {interview && (
                        <div className="mb-6 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                            <h3 className="text-lg font-bold text-gray-800 mb-3">Suhbat ma'lumotlari</h3>
                            <div className="space-y-2">
                                {interview.date && (
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Sana:</span> {formatDate(interview.date)} {interview.time}
                                    </p>
                                )}
                                {interview.interviewer && (
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Suhbat o'tkazuvchi:</span> {interview.interviewer}
                                    </p>
                                )}
                                {interview.result && (
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Natija:</span> {interview.result === 'passed' ? 'O\'tdi' : 'O\'tmadi'}
                                    </p>
                                )}
                                {interview.content && (
                                    <div className="mt-3 pt-3 border-t border-purple-200">
                                        <p className="text-gray-700">
                                            <span className="font-semibold">Mazmun:</span> {interview.content}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Certificate Details */}
                    <div className="mb-6 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                        <h3 className="text-lg font-bold text-gray-800 mb-3">Sertifikat tafsilotlari</h3>
                        <div className="space-y-2">
                            <p className="text-gray-700">
                                <span className="font-semibold">Berilgan sana:</span> {formatDate(certificate.issuedDate)}
                            </p>
                            {certificate.issuedBy && (
                                <p className="text-gray-700">
                                    <span className="font-semibold">Bergan:</span> {certificate.issuedBy.username || certificate.issuedBy.email}
                                </p>
                            )}
                            {certificate.qrCodeUrl && (
                                <div className="mt-3 pt-3 border-t border-yellow-200">
                                    <p className="text-sm text-gray-600 mb-2">QR kod URL:</p>
                                    <a
                                        href={certificate.qrCodeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-700 break-all"
                                    >
                                        {certificate.qrCodeUrl}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Certificate Image */}
                    {loadingImage ? (
                        <div className="mb-6 p-8 bg-gray-50 rounded-lg text-center">
                            <p className="text-gray-600">Sertifikat rasmi yuklanmoqda...</p>
                        </div>
                    ) : certificateImage ? (
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Sertifikat</h3>
                            <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex justify-center">
                                <img
                                    src={certificateImage}
                                    alt={`Sertifikat ${certificate.certificateNumber}`}
                                    className="max-w-full h-auto rounded-lg shadow-lg"
                                    style={{ maxHeight: '800px' }}
                                />
                            </div>
                        </div>
                    ) : null}

                    {/* Download Button */}
                    <div className="mt-6 pt-6 border-t">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleDownload}
                            disabled={downloading}
                            className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {downloading ? 'Yuklanmoqda...' : 'Sertifikatni yuklab olish'}
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CertificateDetailPage;

