const Certificate = require('../models/Certificate');

// @desc    Get my certificates
// @route   GET /api/web/certificates
// @access  Private (Candidate token required)
const getMyCertificates = async (req, res) => {
  try {
    const candidateId = req.candidate._id;
    const { status, page = 1, limit = 10 } = req.query;

    // Build query - only certificates for this candidate
    const query = { candidate: candidateId };
    if (status) {
      query.status = status;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get certificates with populated details
    const certificates = await Certificate.find(query)
      .populate({
        path: 'vacancy',
        populate: {
          path: 'company',
          select: 'name inn',
        },
        select: 'title department position company',
      })
      .populate('interview', 'date time interviewer result')
      .sort({ issuedDate: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Certificate.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        certificates,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get my certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get single certificate
// @route   GET /api/web/certificates/:id
// @access  Private (Candidate token required)
const getMyCertificate = async (req, res) => {
  try {
    const candidateId = req.candidate._id;
    const certificateId = req.params.id;

    const certificate = await Certificate.findOne({
      _id: certificateId,
      candidate: candidateId,
    })
      .populate('candidate', 'firstName lastName phone telegramId')
      .populate({
        path: 'vacancy',
        populate: {
          path: 'company',
          select: 'name inn ownerFullName companyPhone',
        },
      })
      .populate('interview', 'date time interviewer content result evaluations')
      .populate('issuedBy', 'username email');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    // Generate QR code URL for frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const qrCodeUrl = `${frontendUrl}/certificates/verify/${certificate.qrCode}`;

    res.status(200).json({
      success: true,
      data: {
        certificate: {
          ...certificate.toObject(),
          qrCodeUrl,
        },
      },
    });
  } catch (error) {
    console.error('Get my certificate error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid certificate ID',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Download certificate (get certificate image)
// @route   GET /api/web/certificates/:id/download
// @access  Private (Candidate token required)
const downloadCertificate = async (req, res) => {
  try {
    const candidateId = req.candidate._id;
    const certificateId = req.params.id;

    const certificate = await Certificate.findOne({
      _id: certificateId,
      candidate: candidateId,
    })
      .populate('candidate', 'firstName lastName')
      .populate({
        path: 'vacancy',
        populate: {
          path: 'company',
          select: 'name',
        },
      });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    // Check if certificate has base64 image
    if (!certificate.certificateBase64) {
      return res.status(404).json({
        success: false,
        message: 'Certificate image not available',
      });
    }

    // Return certificate image in base64 format
    res.status(200).json({
      success: true,
      data: {
        certificate: {
          id: certificate._id,
          certificateNumber: certificate.certificateNumber,
          issuedDate: certificate.issuedDate,
          candidate: {
            firstName: certificate.candidate.firstName,
            lastName: certificate.candidate.lastName,
            fullName: `${certificate.candidate.firstName} ${certificate.candidate.lastName}`,
          },
          vacancy: {
            title: certificate.vacancy.title,
            company: certificate.vacancy.company.name,
          },
        },
        certificateImageBase64: certificate.certificateBase64,
      },
    });
  } catch (error) {
    console.error('Download certificate error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid certificate ID',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  getMyCertificates,
  getMyCertificate,
  downloadCertificate,
};

