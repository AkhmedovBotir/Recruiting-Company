const Vacancy = require('../models/Vacancy');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Certificate = require('../models/Certificate');
const Candidate = require('../models/Candidate');

// @desc    Get vacancies (simplified for bot)
// @route   GET /api/bot/vacancies
// @access  Private (Bot token required)
const getVacancies = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const candidateId = req.candidate._id;

    // Build query - only active vacancies
    const query = { status: 'active' };

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get vacancies with company details (simplified)
    const vacancies = await Vacancy.find(query)
      .populate('company', 'name')
      .select('title department position workType salary company createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Check which vacancies user has already applied to
    const vacancyIds = vacancies.map((v) => v._id);
    const applications = await Application.find({
      candidate: candidateId,
      vacancy: { $in: vacancyIds },
    }).select('vacancy status');

    const appliedVacancyIds = new Set(
      applications.map((app) => app.vacancy.toString())
    );

    // Format response for bot (simplified)
    const formattedVacancies = vacancies.map((vacancy) => ({
      id: vacancy._id,
      title: vacancy.title,
      department: vacancy.department || null,
      position: vacancy.position || null,
      workType: vacancy.workType,
      salary: vacancy.salary,
      company: vacancy.company ? vacancy.company.name : null,
      hasApplied: appliedVacancyIds.has(vacancy._id.toString()),
      createdAt: vacancy.createdAt,
    }));

    // Get total count
    const total = await Vacancy.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        vacancies: formattedVacancies,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get vacancies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get single vacancy (simplified for bot)
// @route   GET /api/bot/vacancies/:id
// @access  Private (Bot token required)
const getVacancy = async (req, res) => {
  try {
    const vacancyId = req.params.id;
    const candidateId = req.candidate._id;

    const vacancy = await Vacancy.findById(vacancyId)
      .populate('company', 'name inn')
      .select('-responsibilities -preferences -skills');

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: 'Vacancy not found',
      });
    }

    // Check if user has applied
    const application = await Application.findOne({
      candidate: candidateId,
      vacancy: vacancyId,
    }).select('status createdAt');

    // Format response for bot (simplified)
    const response = {
      id: vacancy._id,
      title: vacancy.title,
      department: vacancy.department || null,
      position: vacancy.position || null,
      experience: vacancy.experience,
      workType: vacancy.workType,
      minAge: vacancy.minAge,
      maxAge: vacancy.maxAge,
      salary: vacancy.salary,
      description: vacancy.description || null,
      company: vacancy.company
        ? {
            name: vacancy.company.name,
            inn: vacancy.company.inn,
          }
        : null,
      hasApplied: !!application,
      applicationStatus: application ? application.status : null,
      createdAt: vacancy.createdAt,
    };

    res.status(200).json({
      success: true,
      data: {
        vacancy: response,
      },
    });
  } catch (error) {
    console.error('Get vacancy error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid vacancy ID',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get my profile
// @route   GET /api/bot/profile
// @access  Private (Bot token required)
const getMyProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.candidate._id).select(
      'firstName lastName phone telegramId registrationType createdAt'
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found',
      });
    }

    // Get statistics
    const applicationsCount = await Application.countDocuments({
      candidate: candidate._id,
    });
    const interviewsCount = await Interview.countDocuments({
      candidate: candidate._id,
    });
    const certificatesCount = await Certificate.countDocuments({
      candidate: candidate._id,
      status: 'active',
    });

    res.status(200).json({
      success: true,
      data: {
        candidate: {
          id: candidate._id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          fullName: `${candidate.firstName} ${candidate.lastName}`,
          phone: candidate.phone,
          telegramId: candidate.telegramId,
          registrationType: candidate.registrationType,
          createdAt: candidate.createdAt,
        },
        statistics: {
          applications: applicationsCount,
          interviews: interviewsCount,
          certificates: certificatesCount,
        },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get my applications (simplified for bot)
// @route   GET /api/bot/applications
// @access  Private (Bot token required)
const getMyApplications = async (req, res) => {
  try {
    const candidateId = req.candidate._id;
    const { status, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { candidate: candidateId };
    if (status) {
      query.status = status;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get applications with simplified vacancy info
    const applications = await Application.find(query)
      .populate({
        path: 'vacancy',
        select: 'title department position company',
        populate: {
          path: 'company',
          select: 'name',
        },
      })
      .select('status createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Format response for bot
    const formattedApplications = applications.map((app) => ({
      id: app._id,
      vacancy: {
        id: app.vacancy._id,
        title: app.vacancy.title,
        department: app.vacancy.department || null,
        position: app.vacancy.position || null,
        company: app.vacancy.company ? app.vacancy.company.name : null,
      },
      status: app.status,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    }));

    // Get total count
    const total = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        applications: formattedApplications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get my interviews (simplified for bot)
// @route   GET /api/bot/interviews
// @access  Private (Bot token required)
const getMyInterviews = async (req, res) => {
  try {
    const candidateId = req.candidate._id;
    const { status, result, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { candidate: candidateId };
    if (status) {
      query.status = status;
    }
    if (result) {
      query.result = result;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get interviews with simplified info
    const interviews = await Interview.find(query)
      .populate({
        path: 'vacancy',
        select: 'title company',
        populate: {
          path: 'company',
          select: 'name',
        },
      })
      .select('date time interviewer location status result evaluations createdAt')
      .sort({ date: 1, time: 1 })
      .skip(skip)
      .limit(limitNum);

    // Format response for bot
    const formattedInterviews = interviews.map((interview) => {
      // Calculate average rating
      const averageRating =
        interview.evaluations.length > 0
          ? (
              interview.evaluations.reduce((sum, eval) => sum + eval.rating, 0) /
              interview.evaluations.length
            ).toFixed(1)
          : null;

      return {
        id: interview._id,
        vacancy: {
          id: interview.vacancy._id,
          title: interview.vacancy.title,
          company: interview.vacancy.company
            ? interview.vacancy.company.name
            : null,
        },
        date: interview.date,
        time: interview.time,
        interviewer: interview.interviewer,
        location: interview.location,
        status: interview.status,
        result: interview.result,
        averageRating: averageRating ? parseFloat(averageRating) : null,
        evaluationsCount: interview.evaluations.length,
        createdAt: interview.createdAt,
      };
    });

    // Get total count
    const total = await Interview.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        interviews: formattedInterviews,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get my certificates (simplified for bot)
// @route   GET /api/bot/certificates
// @access  Private (Bot token required)
const getMyCertificates = async (req, res) => {
  try {
    const candidateId = req.candidate._id;
    const { status, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { candidate: candidateId };
    if (status) {
      query.status = status;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get certificates with simplified info
    const certificates = await Certificate.find(query)
      .populate({
        path: 'vacancy',
        select: 'title company',
        populate: {
          path: 'company',
          select: 'name',
        },
      })
      .select('certificateNumber qrCode issuedDate status createdAt')
      .sort({ issuedDate: -1 })
      .skip(skip)
      .limit(limitNum);

    // Format response for bot
    const formattedCertificates = certificates.map((cert) => ({
      id: cert._id,
      certificateNumber: cert.certificateNumber,
      qrCode: cert.qrCode,
      vacancy: {
        id: cert.vacancy._id,
        title: cert.vacancy.title,
        company: cert.vacancy.company ? cert.vacancy.company.name : null,
      },
      issuedDate: cert.issuedDate,
      status: cert.status,
      createdAt: cert.createdAt,
    }));

    // Get total count
    const total = await Certificate.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        certificates: formattedCertificates,
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

module.exports = {
  getVacancies,
  getVacancy,
  getMyProfile,
  getMyApplications,
  getMyInterviews,
  getMyCertificates,
};

