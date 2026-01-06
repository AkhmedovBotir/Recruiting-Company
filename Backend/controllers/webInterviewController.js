const Interview = require('../models/Interview');
const Candidate = require('../models/Candidate');

// @desc    Get my interviews
// @route   GET /api/web/interviews
// @access  Private (Candidate token required)
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

    // Get interviews with populated details
    const interviews = await Interview.find(query)
      .populate({
        path: 'vacancy',
        populate: {
          path: 'company',
          select: 'name inn',
        },
        select: 'title department position company',
      })
      .populate('evaluations.admin', 'username')
      .sort({ date: 1, time: 1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Interview.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        interviews,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get my interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get single interview
// @route   GET /api/web/interviews/:id
// @access  Private (Candidate token required)
const getInterview = async (req, res) => {
  try {
    const candidateId = req.candidate._id;
    const interviewId = req.params.id;

    const interview = await Interview.findOne({
      _id: interviewId,
      candidate: candidateId,
    })
      .populate({
        path: 'vacancy',
        populate: {
          path: 'company',
          select: 'name inn ownerFullName companyPhone',
        },
      })
      .populate('evaluations.admin', 'username');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        interview,
      },
    });
  } catch (error) {
    console.error('Get interview error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  getMyInterviews,
  getInterview,
};

