const Application = require('../models/Application');
const Vacancy = require('../models/Vacancy');
const Candidate = require('../models/Candidate');

// @desc    Get all applications
// @route   GET /api/admin/applications
// @access  Private (Admin only)
const getApplications = async (req, res) => {
  try {
    const { status, vacancy, candidate, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    if (vacancy) {
      query.vacancy = vacancy;
    }
    if (candidate) {
      query.candidate = candidate;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get applications with vacancy, company, and candidate details
    const applications = await Application.find(query)
      .populate({
        path: 'vacancy',
        populate: {
          path: 'company',
          select: 'name inn',
        },
        select: 'title department position workType salary status',
      })
      .populate('candidate', 'firstName lastName phone telegramId')
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
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get single application
// @route   GET /api/admin/applications/:id
// @access  Private (Admin only)
const getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'vacancy',
        populate: {
          path: 'company',
          select: 'name inn ownerFullName companyPhone',
        },
      })
      .populate('candidate', 'firstName lastName phone telegramId registrationType');

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

// @desc    Accept interview (change status to interview)
// @route   PATCH /api/admin/applications/:id/interview
// @access  Private (Admin only)
const acceptInterview = async (req, res) => {
  try {
    const { notes } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Check if already in interview status
    if (application.status === 'interview') {
      return res.status(400).json({
        success: false,
        message: 'Application is already in interview status',
      });
    }

    // Check if already processed
    if (['passed', 'failed', 'accepted', 'rejected'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'Application has already been processed',
      });
    }

    // Update status to interview
    application.status = 'interview';
    if (notes) {
      application.notes = notes;
    }
    await application.save();

    // Populate details
    await application.populate({
      path: 'vacancy',
      populate: {
        path: 'company',
        select: 'name inn',
      },
    });
    await application.populate('candidate', 'firstName lastName phone');

    res.status(200).json({
      success: true,
      message: 'Application accepted for interview',
      data: {
        application,
      },
    });
  } catch (error) {
    console.error('Accept interview error:', error);
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

// @desc    Mark interview as passed
// @route   PATCH /api/admin/applications/:id/passed
// @access  Private (Admin only)
const markInterviewPassed = async (req, res) => {
  try {
    const { notes } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Check if status is interview
    if (application.status !== 'interview') {
      return res.status(400).json({
        success: false,
        message: 'Application is not in interview status',
      });
    }

    // Update status to passed
    application.status = 'passed';
    if (notes) {
      application.notes = notes;
    }
    await application.save();

    // Populate details
    await application.populate({
      path: 'vacancy',
      populate: {
        path: 'company',
        select: 'name inn',
      },
    });
    await application.populate('candidate', 'firstName lastName phone');

    res.status(200).json({
      success: true,
      message: 'Interview marked as passed',
      data: {
        application,
      },
    });
  } catch (error) {
    console.error('Mark interview passed error:', error);
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

// @desc    Mark interview as failed
// @route   PATCH /api/admin/applications/:id/failed
// @access  Private (Admin only)
const markInterviewFailed = async (req, res) => {
  try {
    const { notes } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Check if status is interview
    if (application.status !== 'interview') {
      return res.status(400).json({
        success: false,
        message: 'Application is not in interview status',
      });
    }

    // Update status to failed
    application.status = 'failed';
    if (notes) {
      application.notes = notes;
    }
    await application.save();

    // Populate details
    await application.populate({
      path: 'vacancy',
      populate: {
        path: 'company',
        select: 'name inn',
      },
    });
    await application.populate('candidate', 'firstName lastName phone');

    res.status(200).json({
      success: true,
      message: 'Interview marked as failed',
      data: {
        application,
      },
    });
  } catch (error) {
    console.error('Mark interview failed error:', error);
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

// @desc    Update application status
// @route   PATCH /api/admin/applications/:id/status
// @access  Private (Admin only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status',
      });
    }

    const validStatuses = ['pending', 'reviewed', 'interview', 'passed', 'failed', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Update status
    application.status = status;
    if (notes !== undefined) {
      application.notes = notes;
    }
    await application.save();

    // Populate details
    await application.populate({
      path: 'vacancy',
      populate: {
        path: 'company',
        select: 'name inn',
      },
    });
    await application.populate('candidate', 'firstName lastName phone');

    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: {
        application,
      },
    });
  } catch (error) {
    console.error('Update application status error:', error);
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
  getApplications,
  getApplication,
  acceptInterview,
  markInterviewPassed,
  markInterviewFailed,
  updateApplicationStatus,
};

