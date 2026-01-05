const Application = require('../models/Application');
const Vacancy = require('../models/Vacancy');
const Candidate = require('../models/Candidate');

// @desc    Apply to vacancy
// @route   POST /api/web/applications
// @access  Private (Candidate token required)
const applyToVacancy = async (req, res) => {
  try {
    const { vacancyId } = req.body;
    const candidateId = req.candidate._id;

    // Validate input
    if (!vacancyId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide vacancy ID',
      });
    }

    // Check if vacancy exists and is active
    const vacancy = await Vacancy.findOne({
      _id: vacancyId,
      status: 'active',
    });

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: 'Vacancy not found or not active',
      });
    }

    // Check if candidate already applied to this vacancy
    const existingApplication = await Application.findOne({
      candidate: candidateId,
      vacancy: vacancyId,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this vacancy',
      });
    }

    // Create application
    const application = await Application.create({
      candidate: candidateId,
      vacancy: vacancyId,
      status: 'pending',
    });

    // Populate vacancy and candidate details
    await application.populate('vacancy', 'title company');
    await application.populate('candidate', 'firstName lastName phone');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        application: {
          id: application._id,
          vacancy: application.vacancy,
          candidate: application.candidate,
          status: application.status,
          createdAt: application.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Apply to vacancy error:', error);
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
        message: 'You have already applied to this vacancy',
      });
    }
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

// @desc    Get all applications for current candidate
// @route   GET /api/web/applications
// @access  Private (Candidate token required)
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

    // Get applications with vacancy and company details
    const applications = await Application.find(query)
      .populate({
        path: 'vacancy',
        populate: {
          path: 'company',
          select: 'name inn',
        },
        select: 'title department position workType salary company status',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        applications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get single application
// @route   GET /api/web/applications/:id
// @access  Private (Candidate token required)
const getApplication = async (req, res) => {
  try {
    const candidateId = req.candidate._id;
    const applicationId = req.params.id;

    const application = await Application.findOne({
      _id: applicationId,
      candidate: candidateId,
    })
      .populate({
        path: 'vacancy',
        populate: {
          path: 'company',
          select: 'name inn ownerFullName companyPhone',
        },
      })
      .populate('candidate', 'firstName lastName phone');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        application,
      },
    });
  } catch (error) {
    console.error('Get application error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  applyToVacancy,
  getMyApplications,
  getApplication,
};

