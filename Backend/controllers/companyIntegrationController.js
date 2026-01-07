const Certificate = require('../models/Certificate');
const Candidate = require('../models/Candidate');
const Vacancy = require('../models/Vacancy');
const Interview = require('../models/Interview');
const Application = require('../models/Application');
const TestResult = require('../models/TestResult');
const Material = require('../models/Material');

// @desc    Get candidate full data by certificate ID (for company integration)
// @route   GET /api/company-integration/certificate/:certificateId
// @access  Public (No authentication required)
const getCandidateByCertificateId = async (req, res) => {
  try {
    const { certificateId } = req.params;

    // Find certificate by ID
    const certificate = await Certificate.findById(certificateId)
      .populate('candidate', 'firstName lastName phone telegramId registrationType')
      .populate({
        path: 'vacancy',
        populate: {
          path: 'company',
          select: 'name inn ownerFullName companyPhone',
        },
        select: 'title department position experience workType minAge maxAge salary description responsibilities preferences skills company',
      })
      .populate({
        path: 'interview',
        populate: {
          path: 'evaluations.admin',
          select: 'username',
        },
        select: 'date time interviewer content location result status evaluations',
      })
      .populate('application', 'status notes createdAt updatedAt')
      .populate('issuedBy', 'username email');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    // Check if certificate is active
    if (certificate.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Certificate is revoked',
      });
    }

    // Get test results for this candidate and vacancy
    const materials = await Material.find({ vacancy: certificate.vacancy._id }).select('_id title');
    const materialIds = materials.map((m) => m._id);
    
    const testResults = await TestResult.find({
      candidate: certificate.candidate._id,
      material: { $in: materialIds },
    })
      .populate('material', 'title')
      .select('material answers correctCount incorrectCount totalQuestions score createdAt')
      .sort({ createdAt: -1 });

    // Calculate average rating from interview evaluations
    const averageRating = certificate.interview.evaluations.length > 0
      ? (certificate.interview.evaluations.reduce((sum, eval) => sum + eval.rating, 0) / certificate.interview.evaluations.length).toFixed(1)
      : null;

    // Calculate average test score
    const averageTestScore = testResults.length > 0
      ? (testResults.reduce((sum, tr) => sum + tr.score, 0) / testResults.length).toFixed(1)
      : null;

    // Format response
    const response = {
      success: true,
      data: {
        certificate: {
          id: certificate._id,
          certificateNumber: certificate.certificateNumber,
          qrCode: certificate.qrCode,
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
          experience: certificate.vacancy.experience,
          workType: certificate.vacancy.workType,
          minAge: certificate.vacancy.minAge,
          maxAge: certificate.vacancy.maxAge,
          salary: certificate.vacancy.salary,
          description: certificate.vacancy.description,
          responsibilities: certificate.vacancy.responsibilities,
          preferences: certificate.vacancy.preferences,
          skills: certificate.vacancy.skills,
          company: certificate.vacancy.company,
        },
        interview: {
          id: certificate.interview._id,
          date: certificate.interview.date,
          time: certificate.interview.time,
          interviewer: certificate.interview.interviewer,
          content: certificate.interview.content,
          location: certificate.interview.location,
          result: certificate.interview.result,
          status: certificate.interview.status,
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
          averageRating: averageRating ? parseFloat(averageRating) : null,
        },
        application: certificate.application ? {
          id: certificate.application._id,
          status: certificate.application.status,
          notes: certificate.application.notes,
          createdAt: certificate.application.createdAt,
          updatedAt: certificate.application.updatedAt,
        } : null,
        testResults: testResults.map((tr) => ({
          id: tr._id,
          material: tr.material ? {
            id: tr.material._id,
            title: tr.material.title,
          } : null,
          answers: tr.answers,
          correctCount: tr.correctCount,
          incorrectCount: tr.incorrectCount,
          totalQuestions: tr.totalQuestions,
          score: tr.score,
          completedAt: tr.createdAt,
        })),
        averageTestScore: averageTestScore ? parseFloat(averageTestScore) : null,
        issuedBy: {
          id: certificate.issuedBy._id,
          username: certificate.issuedBy.username,
          email: certificate.issuedBy.email,
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get candidate by certificate ID error:', error);
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

// @desc    Get candidate full data by certificate number (for company integration)
// @route   GET /api/company-integration/certificate-number/:certificateNumber
// @access  Public (No authentication required)
const getCandidateByCertificateNumber = async (req, res) => {
  try {
    const { certificateNumber } = req.params;

    // Find certificate by certificate number
    const certificate = await Certificate.findOne({ certificateNumber })
      .populate('candidate', 'firstName lastName phone telegramId registrationType')
      .populate({
        path: 'vacancy',
        populate: {
          path: 'company',
          select: 'name inn ownerFullName companyPhone',
        },
        select: 'title department position experience workType minAge maxAge salary description responsibilities preferences skills company',
      })
      .populate({
        path: 'interview',
        populate: {
          path: 'evaluations.admin',
          select: 'username',
        },
        select: 'date time interviewer content location result status evaluations',
      })
      .populate('application', 'status notes createdAt updatedAt')
      .populate('issuedBy', 'username email');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    // Check if certificate is active
    if (certificate.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Certificate is revoked',
      });
    }

    // Get test results for this candidate and vacancy
    const materials = await Material.find({ vacancy: certificate.vacancy._id }).select('_id title');
    const materialIds = materials.map((m) => m._id);
    
    const testResults = await TestResult.find({
      candidate: certificate.candidate._id,
      material: { $in: materialIds },
    })
      .populate('material', 'title')
      .select('material answers correctCount incorrectCount totalQuestions score createdAt')
      .sort({ createdAt: -1 });

    // Calculate average rating from interview evaluations
    const averageRating = certificate.interview.evaluations.length > 0
      ? (certificate.interview.evaluations.reduce((sum, eval) => sum + eval.rating, 0) / certificate.interview.evaluations.length).toFixed(1)
      : null;

    // Calculate average test score
    const averageTestScore = testResults.length > 0
      ? (testResults.reduce((sum, tr) => sum + tr.score, 0) / testResults.length).toFixed(1)
      : null;

    // Format response
    const response = {
      success: true,
      data: {
        certificate: {
          id: certificate._id,
          certificateNumber: certificate.certificateNumber,
          qrCode: certificate.qrCode,
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
          experience: certificate.vacancy.experience,
          workType: certificate.vacancy.workType,
          minAge: certificate.vacancy.minAge,
          maxAge: certificate.vacancy.maxAge,
          salary: certificate.vacancy.salary,
          description: certificate.vacancy.description,
          responsibilities: certificate.vacancy.responsibilities,
          preferences: certificate.vacancy.preferences,
          skills: certificate.vacancy.skills,
          company: certificate.vacancy.company,
        },
        interview: {
          id: certificate.interview._id,
          date: certificate.interview.date,
          time: certificate.interview.time,
          interviewer: certificate.interview.interviewer,
          content: certificate.interview.content,
          location: certificate.interview.location,
          result: certificate.interview.result,
          status: certificate.interview.status,
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
          averageRating: averageRating ? parseFloat(averageRating) : null,
        },
        application: certificate.application ? {
          id: certificate.application._id,
          status: certificate.application.status,
          notes: certificate.application.notes,
          createdAt: certificate.application.createdAt,
          updatedAt: certificate.application.updatedAt,
        } : null,
        testResults: testResults.map((tr) => ({
          id: tr._id,
          material: tr.material ? {
            id: tr.material._id,
            title: tr.material.title,
          } : null,
          answers: tr.answers,
          correctCount: tr.correctCount,
          incorrectCount: tr.incorrectCount,
          totalQuestions: tr.totalQuestions,
          score: tr.score,
          completedAt: tr.createdAt,
        })),
        averageTestScore: averageTestScore ? parseFloat(averageTestScore) : null,
        issuedBy: {
          id: certificate.issuedBy._id,
          username: certificate.issuedBy.username,
          email: certificate.issuedBy.email,
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get candidate by certificate number error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  getCandidateByCertificateId,
  getCandidateByCertificateNumber,
};

