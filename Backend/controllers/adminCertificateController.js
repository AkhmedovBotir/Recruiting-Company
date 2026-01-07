const Certificate = require('../models/Certificate');
const Interview = require('../models/Interview');
const Candidate = require('../models/Candidate');
const Vacancy = require('../models/Vacancy');
const Application = require('../models/Application');
const TestResult = require('../models/TestResult');
const Material = require('../models/Material');
const fs = require('fs');
const path = require('path');

// @desc    Get candidates eligible for certificate (passed interview)
// @route   GET /api/admin/certificates/candidates-eligible
// @access  Private (Admin only)
const getCandidatesEligibleForCertificate = async (req, res) => {
  try {
    const { vacancyId, page = 1, limit = 10 } = req.query;

    // Build query for passed interviews
    const interviewQuery = {
      status: 'completed',
      result: 'passed',
    };
    if (vacancyId) {
      interviewQuery.vacancy = vacancyId;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get passed interviews
    const interviews = await Interview.find(interviewQuery)
      .populate('candidate', 'firstName lastName phone telegramId')
      .populate({
        path: 'vacancy',
        populate: {
          path: 'company',
          select: 'name inn',
        },
        select: 'title department position company',
      })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    // Check which candidates already have certificates
    const interviewIds = interviews.map((i) => i._id);
    const existingCertificates = await Certificate.find({
      interview: { $in: interviewIds },
    }).select('interview');

    const existingInterviewIds = new Set(
      existingCertificates.map((c) => c.interview.toString())
    );

    // Format response
    const eligibleCandidates = interviews
      .filter((interview) => !existingInterviewIds.has(interview._id.toString()))
      .map((interview) => ({
        interview: {
          id: interview._id,
          date: interview.date,
          time: interview.time,
          interviewer: interview.interviewer,
          evaluations: interview.evaluations,
        },
        candidate: {
          id: interview.candidate._id,
          firstName: interview.candidate.firstName,
          lastName: interview.candidate.lastName,
          phone: interview.candidate.phone,
          telegramId: interview.candidate.telegramId,
        },
        vacancy: {
          id: interview.vacancy._id,
          title: interview.vacancy.title,
          department: interview.vacancy.department,
          position: interview.vacancy.position,
          company: interview.vacancy.company,
        },
        hasCertificate: false,
      }));

    // Get total count
    const totalInterviews = await Interview.countDocuments(interviewQuery);
    const totalCertificates = await Certificate.countDocuments({
      interview: { $in: interviewIds },
    });
    const total = totalInterviews - totalCertificates;

    res.status(200).json({
      success: true,
      data: {
        candidates: eligibleCandidates,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get candidates eligible for certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Issue certificate
// @route   POST /api/admin/certificates
// @access  Private (Admin only)
const issueCertificate = async (req, res) => {
  try {
    const { interviewId } = req.body;
    const adminId = req.admin._id;

    // Check if interview exists and is passed
    const interview = await Interview.findById(interviewId)
      .populate('candidate', 'firstName lastName phone telegramId')
      .populate({
        path: 'vacancy',
        populate: {
          path: 'company',
          select: 'name inn',
        },
      })
      .populate('application');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    if (interview.status !== 'completed' || interview.result !== 'passed') {
      return res.status(400).json({
        success: false,
        message: 'Certificate can only be issued for passed interviews',
      });
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({ interview: interviewId });
    if (existingCertificate) {
      return res.status(400).json({
        success: false,
        message: 'Certificate already issued for this interview',
      });
    }

    // Create certificate
    const certificate = await Certificate.create({
      candidate: interview.candidate._id,
      vacancy: interview.vacancy._id,
      interview: interviewId,
      application: interview.application ? interview.application._id : null,
      issuedBy: adminId,
    });

    // Populate details
    await certificate.populate('candidate', 'firstName lastName phone telegramId');
    await certificate.populate({
      path: 'vacancy',
      populate: {
        path: 'company',
        select: 'name inn',
      },
    });
    await certificate.populate('interview', 'date time interviewer evaluations');
    await certificate.populate('issuedBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Certificate issued successfully',
      data: {
        certificate,
      },
    });
  } catch (error) {
    console.error('Issue certificate error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Certificate already issued for this interview',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get all certificates
// @route   GET /api/admin/certificates
// @access  Private (Admin only)
const getCertificates = async (req, res) => {
  try {
    const { candidateId, vacancyId, status, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};
    if (candidateId) {
      query.candidate = candidateId;
    }
    if (vacancyId) {
      query.vacancy = vacancyId;
    }
    if (status) {
      query.status = status;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get certificates with populated details
    const certificates = await Certificate.find(query)
      .populate('candidate', 'firstName lastName phone telegramId')
      .populate({
        path: 'vacancy',
        populate: {
          path: 'company',
          select: 'name inn',
        },
        select: 'title department position company',
      })
      .populate('interview', 'date time interviewer result')
      .populate('issuedBy', 'username email')
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
    console.error('Get certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get single certificate
// @route   GET /api/admin/certificates/:id
// @access  Private (Admin only)
const getCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('candidate', 'firstName lastName phone telegramId registrationType')
      .populate({
        path: 'vacancy',
        populate: {
          path: 'company',
          select: 'name inn ownerFullName companyPhone',
        },
      })
      .populate('interview', 'date time interviewer content result evaluations')
      .populate('application', 'status notes answers')
      .populate('issuedBy', 'username email');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        certificate,
      },
    });
  } catch (error) {
    console.error('Get certificate error:', error);
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

// @desc    Revoke certificate
// @route   PATCH /api/admin/certificates/:id/revoke
// @access  Private (Admin only)
const revokeCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    if (certificate.status === 'revoked') {
      return res.status(400).json({
        success: false,
        message: 'Certificate is already revoked',
      });
    }

    certificate.status = 'revoked';
    await certificate.save();

    // Populate details
    await certificate.populate('candidate', 'firstName lastName phone telegramId');
    await certificate.populate({
      path: 'vacancy',
      populate: {
        path: 'company',
        select: 'name inn',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Certificate revoked successfully',
      data: {
        certificate,
      },
    });
  } catch (error) {
    console.error('Revoke certificate error:', error);
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

// @desc    Get certificate by QR code (for verification) - Redirect to frontend
// @route   GET /api/certificates/verify/:qrCode
// @access  Public
const verifyCertificate = async (req, res) => {
  try {
    const { qrCode } = req.params;
    const { format } = req.query; // 'json' for API calls

    // Check if certificate exists
    const certificate = await Certificate.findOne({ qrCode, status: 'active' });

    if (!certificate) {
      // If JSON format requested, return JSON error
      if (format === 'json') {
        return res.status(404).json({
          success: false,
          message: 'Certificate not found or revoked',
        });
      }
      // Otherwise redirect to frontend with error
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/certificates/verify/${qrCode}?error=not-found`);
    }

    // If JSON format requested, return full JSON data
    if (format === 'json') {
      await certificate.populate('candidate', 'firstName lastName phone telegramId registrationType');
      await certificate.populate({
        path: 'vacancy',
        populate: {
          path: 'company',
          select: 'name inn ownerFullName companyPhone',
        },
      });
      await certificate.populate({
        path: 'interview',
        populate: {
          path: 'evaluations.admin',
          select: 'username',
        },
        select: 'date time interviewer content result evaluations',
      });
      await certificate.populate('application', 'status notes answers');

      // Get test results for this candidate and vacancy
      const materials = await Material.find({ vacancy: certificate.vacancy._id }).select('_id');
      const materialIds = materials.map((m) => m._id);
      
      const testResults = await TestResult.find({
        candidate: certificate.candidate._id,
        material: { $in: materialIds },
      })
        .populate('material', 'title')
        .select('material score correctCount totalQuestions createdAt');

      // Calculate average rating
      const averageRating = certificate.interview.evaluations.length > 0
        ? (certificate.interview.evaluations.reduce((sum, eval) => sum + eval.rating, 0) / certificate.interview.evaluations.length).toFixed(1)
        : null;

      // Calculate average test score
      const averageTestScore = testResults.length > 0
        ? (testResults.reduce((sum, tr) => sum + tr.score, 0) / testResults.length).toFixed(1)
        : null;

      return res.status(200).json({
        success: true,
        data: {
          certificate: {
            id: certificate._id,
            certificateNumber: certificate.certificateNumber,
            issuedDate: certificate.issuedDate,
            status: certificate.status,
          },
          candidate: {
            id: certificate.candidate._id,
            firstName: certificate.candidate.firstName,
            lastName: certificate.candidate.lastName,
            fullName: `${certificate.candidate.firstName} ${certificate.candidate.lastName}`,
            phone: certificate.candidate.phone,
            telegramId: certificate.candidate.telegramId,
            registrationType: certificate.candidate.registrationType,
          },
          vacancy: {
            id: certificate.vacancy._id,
            title: certificate.vacancy.title,
            department: certificate.vacancy.department,
            position: certificate.vacancy.position,
            company: certificate.vacancy.company,
          },
          interview: {
            id: certificate.interview._id,
            date: certificate.interview.date,
            time: certificate.interview.time,
            interviewer: certificate.interview.interviewer,
            content: certificate.interview.content,
            result: certificate.interview.result,
            evaluations: certificate.interview.evaluations.map((eval) => ({
              id: eval._id,
              admin: eval.admin ? {
                id: eval.admin._id,
                username: eval.admin.username,
              } : null,
              text: eval.text,
              rating: eval.rating,
              createdAt: eval.createdAt,
            })),
            averageRating: parseFloat(averageRating),
          },
          application: certificate.application ? {
            id: certificate.application._id,
            status: certificate.application.status,
            notes: certificate.application.notes,
            answers: certificate.application.answers,
          } : null,
          testResults: testResults.map((tr) => ({
            id: tr._id,
            material: tr.material ? {
              id: tr.material._id,
              title: tr.material.title,
            } : null,
            score: tr.score,
            correctCount: tr.correctCount,
            incorrectCount: tr.incorrectCount,
            totalQuestions: tr.totalQuestions,
            completedAt: tr.createdAt,
          })),
          averageTestScore: averageTestScore ? parseFloat(averageTestScore) : null,
        },
      });
    }

    // Default: Redirect to frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/certificates/verify/${qrCode}`);
  } catch (error) {
    console.error('Verify certificate error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/certificates/verify/${req.params.qrCode}?error=server-error`);
  }
};

// @desc    Get certificate data for frontend (name, QR code URL, certificate image)
// @route   GET /api/admin/certificates/:id/for-frontend
// @access  Private (Admin only)
const getCertificateForFrontend = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('candidate', 'firstName lastName')
      .populate({
        path: 'vacancy',
        populate: {
          path: 'company',
          select: 'name',
        },
        select: 'title company',
      });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    // Read certificate image and convert to base64
    const imagePath = path.join(__dirname, '../public/sertifikat.png');
    let certificateImageBase64 = null;

    try {
      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        certificateImageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;
      }
    } catch (error) {
      console.error('Error reading certificate image:', error);
    }

    // Generate QR code URL (frontend URL)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const qrCodeUrl = `${frontendUrl}/certificates/verify/${certificate.qrCode}`;

    res.status(200).json({
      success: true,
      data: {
        certificate: {
          id: certificate._id,
          certificateNumber: certificate.certificateNumber,
          issuedDate: certificate.issuedDate,
        },
        candidate: {
          firstName: certificate.candidate.firstName,
          lastName: certificate.candidate.lastName,
          fullName: `${certificate.candidate.firstName} ${certificate.candidate.lastName}`,
        },
        vacancy: {
          title: certificate.vacancy.title,
          company: certificate.vacancy.company.name,
        },
        qrCode: certificate.qrCode,
        qrCodeUrl: qrCodeUrl,
        certificateImageBase64: certificateImageBase64,
      },
    });
  } catch (error) {
    console.error('Get certificate for frontend error:', error);
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

// @desc    Get certificate image in base64
// @route   GET /api/admin/certificates/image
// @access  Private (Admin only)
const getCertificateImage = async (req, res) => {
  try {
    const imagePath = path.join(__dirname, '../public/sertifikat.png');

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        success: false,
        message: 'Certificate image not found',
      });
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;

    res.status(200).json({
      success: true,
      data: {
        imageBase64: imageBase64,
        mimeType: 'image/png',
      },
    });
  } catch (error) {
    console.error('Get certificate image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Save certificate base64 from frontend
// @route   PUT /api/admin/certificates/:id/save-certificate
// @access  Private (Admin only)
const saveCertificateBase64 = async (req, res) => {
  try {
    const { certificateBase64 } = req.body;

    if (!certificateBase64) {
      return res.status(400).json({
        success: false,
        message: 'Certificate base64 is required',
      });
    }

    // Basic validation
    if (!certificateBase64.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid base64 format. Must start with data:image/',
      });
    }

    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    certificate.certificateBase64 = certificateBase64;
    await certificate.save();

    await certificate.populate('candidate', 'firstName lastName phone telegramId');
    await certificate.populate({
      path: 'vacancy',
      populate: { path: 'company', select: 'name inn' },
    });
    await certificate.populate('interview', 'date time interviewer result');
    await certificate.populate('issuedBy', 'username email');

    res.status(200).json({
      success: true,
      message: 'Certificate saved successfully',
      data: {
        certificate: {
          id: certificate._id,
          certificateNumber: certificate.certificateNumber,
          qrCode: certificate.qrCode,
          certificateBase64: certificate.certificateBase64,
          issuedDate: certificate.issuedDate,
          status: certificate.status,
        },
      },
    });
  } catch (error) {
    console.error('Save certificate base64 error:', error);
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
  getCandidatesEligibleForCertificate,
  issueCertificate,
  getCertificates,
  getCertificate,
  revokeCertificate,
  verifyCertificate,
  getCertificateForFrontend,
  getCertificateImage,
  saveCertificateBase64,
};

