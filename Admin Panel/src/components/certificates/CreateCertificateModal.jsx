/**
 * Create Certificate Modal Component
 * Creates a certificate with image editor interface
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as certificateService from '../../services/certificateService.js';
import QRCode from 'qrcode';

const CreateCertificateModal = ({ isOpen, onClose, onIssue, candidate, loading }) => {
  const [submitError, setSubmitError] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [certificateImage, setCertificateImage] = useState(null);
  const [qrCodeImage, setQrCodeImage] = useState(null);
  
  // Editor state
  const [namePosition, setNamePosition] = useState({ x: 50, y: 50 }); // Percentage
  const [qrPosition, setQrPosition] = useState({ x: 80, y: 80 }); // Percentage
  const [nameFontSize, setNameFontSize] = useState(48);
  const [qrSize, setQrSize] = useState(150);
  const [isDraggingName, setIsDraggingName] = useState(false);
  const [isDraggingQr, setIsDraggingQr] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (isOpen && candidate?.interview) {
      loadCertificateData();
    }
  }, [isOpen, candidate]);

  /**
   * Load certificate data for editing
   */
  const loadCertificateData = async () => {
    try {
      setLoadingData(true);
      setSubmitError(null);

      // First, issue the certificate
    const interviewId = candidate.interview.id || candidate.interview._id;
    if (!interviewId) {
        throw new Error('Suhbat ID topilmadi');
    }

      // Issue certificate first
      const issueResponse = await certificateService.issueCertificate({ interviewId });
      
      if (!issueResponse || !issueResponse.success || !issueResponse.data?.certificate) {
        throw new Error('Sertifikat yaratishda xatolik yuz berdi');
      }

      const certificate = issueResponse.data.certificate;
      setCertificateData(certificate);
      
      // Get certificate data for frontend
      const frontendResponse = await certificateService.getCertificateForFrontend(certificate._id || certificate.id);
      
      if (!frontendResponse || !frontendResponse.success || !frontendResponse.data) {
        throw new Error('Sertifikat ma\'lumotlarini yuklashda xatolik');
      }

      const data = frontendResponse.data;
      
      // Load certificate image
      if (data.certificateImageBase64) {
        // Ensure it's a valid data URL
        let imageData = data.certificateImageBase64;
        if (!imageData.startsWith('data:')) {
          imageData = `data:image/png;base64,${imageData}`;
        }
        setCertificateImage(imageData);
      } else {
        throw new Error('Sertifikat rasmi topilmadi');
      }

      // Generate QR code
      if (data.qrCodeUrl) {
        try {
          const qrDataUrl = await QRCode.toDataURL(data.qrCodeUrl, {
            width: 300,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          });
          setQrCodeImage(qrDataUrl);
        } catch (qrError) {
          console.error('QR code generation error:', qrError);
          throw new Error('QR kod yaratishda xatolik');
        }
      } else {
        throw new Error('QR kod URL topilmadi');
      }

      // Set default positions based on image dimensions
      // These will be adjusted when image loads
      setNamePosition({ x: 50, y: 40 });
      setQrPosition({ x: 85, y: 85 });
      
    } catch (error) {
      console.error('Error loading certificate data:', error);
      setSubmitError(error.message || 'Ma\'lumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoadingData(false);
    }
  };

  /**
   * Update canvas size based on container
   */
  useEffect(() => {
    if (containerRef.current && certificateImage) {
      const container = containerRef.current;
      const img = new Image();
      img.src = certificateImage;
      img.onload = () => {
        // Maintain aspect ratio, max width 800px
        const maxWidth = 800;
        const aspectRatio = img.height / img.width;
        const width = Math.min(maxWidth, img.width);
        const height = width * aspectRatio;
        setCanvasSize({ width, height });
      };
    }
  }, [certificateImage]);

  /**
   * Draw certificate on canvas
   */
  const drawCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas || !certificateImage) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw certificate image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Draw name
      if (certificateData && candidate?.candidate) {
        const fullName = `${candidate.candidate.firstName} ${candidate.candidate.lastName}`;
        ctx.save();
        ctx.font = `bold ${nameFontSize}px Arial`;
        ctx.fillStyle = '#1e3c72'; // Dark blue color matching certificate
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const nameX = (namePosition.x / 100) * canvas.width;
        const nameY = (namePosition.y / 100) * canvas.height;
        
        // Add text shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillText(fullName, nameX, nameY);
        ctx.restore();
      }
      
      // Draw QR code
      if (qrCodeImage) {
        const qrImg = new Image();
        qrImg.crossOrigin = 'anonymous';
        qrImg.onload = () => {
          const qrX = (qrPosition.x / 100) * canvas.width - qrSize / 2;
          const qrY = (qrPosition.y / 100) * canvas.height - qrSize / 2;
          
          // Draw white background for QR code for better visibility
          ctx.fillStyle = 'white';
          ctx.fillRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10);
          
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
        };
        qrImg.src = qrCodeImage;
      }
    };
    
    img.onerror = () => {
      console.error('Failed to load certificate image');
      setSubmitError('Sertifikat rasmini yuklashda xatolik');
    };
    
    img.src = certificateImage;
  };

  useEffect(() => {
    if (canvasSize.width > 0 && canvasSize.height > 0) {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;
        drawCertificate();
      }
    }
  }, [canvasSize, certificateImage, qrCodeImage, namePosition, qrPosition, nameFontSize, qrSize, certificateData, candidate]);

  /**
   * Handle mouse down on canvas
   */
  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Check if click is near name position (within 10% of canvas)
    const nameX = namePosition.x;
    const nameY = namePosition.y;
    const nameDist = Math.sqrt(Math.pow(x - nameX, 2) + Math.pow(y - nameY, 2));
    
    // Check if click is near QR position
    const qrX = qrPosition.x;
    const qrY = qrPosition.y;
    const qrDist = Math.sqrt(Math.pow(x - qrX, 2) + Math.pow(y - qrY, 2));
    
    // Determine which element to drag (prioritize name if both are close)
    if (nameDist < 8 || (nameDist < qrDist && nameDist < 15)) {
      e.preventDefault();
      setIsDraggingName(true);
      setDragOffset({ x: x - namePosition.x, y: y - namePosition.y });
    } else if (qrDist < 10) {
      e.preventDefault();
      setIsDraggingQr(true);
      setDragOffset({ x: x - qrPosition.x, y: y - qrPosition.y });
    }
  };

  /**
   * Handle mouse move
   */
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingName && !isDraggingQr) return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      if (isDraggingName) {
        setNamePosition({
          x: Math.max(0, Math.min(100, x - dragOffset.x)),
          y: Math.max(0, Math.min(100, y - dragOffset.y)),
        });
      } else if (isDraggingQr) {
        setQrPosition({
          x: Math.max(0, Math.min(100, x - dragOffset.x)),
          y: Math.max(0, Math.min(100, y - dragOffset.y)),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingName(false);
      setIsDraggingQr(false);
    };

    if (isDraggingName || isDraggingQr) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingName, isDraggingQr, dragOffset]);

  /**
   * Download certificate image
   */
  const downloadCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Sertifikat_${candidate?.candidate?.firstName}_${candidate?.candidate?.lastName}_${certificateData?.certificateNumber || 'cert'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  /**
   * Save certificate to backend
   */
  const saveCertificateToBackend = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !certificateData) {
      throw new Error('Canvas yoki sertifikat ma\'lumotlari topilmadi');
    }

    try {
      // Convert canvas directly to base64 data URL (format: data:image/png;base64,...)
      const certificateBase64 = canvas.toDataURL('image/png');
      
      // Validate format
      if (!certificateBase64 || !certificateBase64.startsWith('data:image/')) {
        throw new Error('Sertifikat rasmi to\'g\'ri formatda emas');
      }

      const certificateId = certificateData._id || certificateData.id;
      if (!certificateId) {
        throw new Error('Sertifikat ID topilmadi');
      }

      const response = await certificateService.saveCertificate(certificateId, certificateBase64);
      
      if (!response || !response.success) {
        throw new Error(response?.message || 'Sertifikatni saqlashda xatolik yuz berdi');
      }

      return response;
    } catch (error) {
      console.error('Error saving certificate to backend:', error);
      throw error;
    }
  };

  /**
   * Handle finalize and close
   */
  const handleFinalize = async () => {
    try {
      setLoadingData(true);
      setSubmitError(null);
      
      // Save certificate to backend (base64 format)
      const saveResponse = await saveCertificateToBackend();
      
      if (!saveResponse || !saveResponse.success) {
        throw new Error(saveResponse?.message || 'Sertifikatni saqlashda xatolik yuz berdi');
      }
      
      // Download certificate
      downloadCertificate();
      
      // Close modal
      onClose();
      
      // Refresh the list
      if (onIssue && certificateData) {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      console.error('Error saving certificate:', error);
      setSubmitError(error.message || 'Sertifikatni saqlashda xatolik yuz berdi');
      setLoadingData(false);
    }
  };

  if (!isOpen || !candidate) return null;

  const fullName = candidate.candidate ? `${candidate.candidate.firstName} ${candidate.candidate.lastName}` : '';

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
            className="relative w-full max-w-6xl transform overflow-hidden rounded-xl bg-white shadow-xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Sertifikat Editor</h3>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1 text-white hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {fullName && (
                <p className="text-sm text-blue-100 mt-1">{fullName}</p>
              )}
            </div>

            {/* Body */}
            <div className="bg-white px-6 py-6">
              {loadingData ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Sertifikat yaratilmoqda...</p>
                      </div>
                    </div>
              ) : submitError ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-red-700">{submitError}</p>
                    </div>
                  </div>
              ) : certificateImage ? (
                <div className="space-y-4">
                  {/* Editor Controls */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Editor Sozlamalari</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name Controls */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ism-Familiya O'lchami
                        </label>
                        <input
                          type="range"
                          min="24"
                          max="72"
                          value={nameFontSize}
                          onChange={(e) => setNameFontSize(Number(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-xs text-gray-500 mt-1">{nameFontSize}px</div>
                      </div>
                      
                      {/* QR Size Controls */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          QR Kod O'lchami
                        </label>
                        <input
                          type="range"
                          min="100"
                          max="250"
                          value={qrSize}
                          onChange={(e) => setQrSize(Number(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-xs text-gray-500 mt-1">{qrSize}px</div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-600">
                      <p>💡 Ism-familiya va QR kodni surib joylashtiring</p>
                    </div>
              </div>

                  {/* Canvas Container */}
                  <div 
                    ref={containerRef}
                    className="flex justify-center bg-gray-100 rounded-lg p-4 overflow-auto"
                    style={{ maxHeight: '70vh' }}
                  >
                    <div className="relative" style={{ position: 'relative' }}>
                      <canvas
                        ref={canvasRef}
                        className="border border-gray-300 rounded-lg shadow-lg"
                        style={{ cursor: isDraggingName || isDraggingQr ? 'grabbing' : 'grab' }}
                        onMouseDown={handleCanvasMouseDown}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Sertifikat yuklanmoqda...</p>
                </div>
              )}

              {/* Footer */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  Bekor qilish
                </button>
                {certificateImage && (
                  <>
                    <button
                      type="button"
                      onClick={downloadCertificate}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                    >
                      Yuklab Olish
                </button>
                <button
                  type="button"
                      onClick={handleFinalize}
                      disabled={loadingData}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                      {loadingData ? 'Saqlanmoqda...' : 'Saqlash va Tugatish'}
                </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default CreateCertificateModal;
