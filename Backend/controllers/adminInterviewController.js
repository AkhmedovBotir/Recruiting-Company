const Interview = require('../models/Interview');
const Candidate = require('../models/Candidate');
const Vacancy = require('../models/Vacancy');
const Application = require('../models/Application');
const Material = require('../models/Material');
const TestResult = require('../models/TestResult');

// @desc    Get candidates who completed materials (ready for interview)
// @route   GET /api/admin/interviews/candidates-ready
// @access  Private (Admin only)
const getCandidatesReadyForInterview = async (req, res) => {
  try {
    const { vacancyId, page = 1, limit = 10 } = req.query;

    // Build query for materials
    const materialQuery = {};
    if (vacancyId) {
      materialQuery.vacancy = vacancyId;
    }

    // Get materials
    const materials = await Material.find(materialQuery).select('_id vacancy');
    const materialIds = materials.map((m) => m._id);

    if (materialIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          candidates: [],
          pagination: {
            page: 1,
            limit: parseInt(limit),
            total: 0,
            pages: 0,
          },
        },
      });
    }

    // Get candidates who completed all materials (have test results for all materials)
    const testResults = await TestResult.find({
      material: { $in: materialIds },
    }).populate('candidate', 'firstName lastName phone telegramId');

    // Group by candidate and check if they completed all materials for each vacancy
    const candidateMap = new Map();
    const vacancyMaterialMap = new Map();

    // Build vacancy -> materials map
    materials.forEach((material) => {
      const vacancyIdStr = material.vacancy.toString();
      if (!vacancyMaterialMap.has(vacancyIdStr)) {
        vacancyMaterialMap.set(vacancyIdStr, []);
      }
      vacancyMaterialMap.get(vacancyIdStr).push(material._id.toString());
    });

    // Process test results
    testResults.forEach((result) => {
      const candidateId = result.candidate._id.toString();
      const materialId = result.material.toString();

      // Find which vacancy this material belongs to
      for (const [vacancyIdStr, materialIds] of vacancyMaterialMap.entries()) {
        if (materialIds.includes(materialId)) {
          const key = `${candidateId}_${vacancyIdStr}`;
          if (!candidateMap.has(key)) {
            candidateMap.set(key, {
              candidate: result.candidate,
              vacancyId: vacancyIdStr,
              completedMaterials: new Set(),
              testResults: [],
            });
          }
          candidateMap.get(key).completedMaterials.add(materialId);
          candidateMap.get(key).testResults.push(result);
        }
      }
    });

    // Filter candidates who completed all materials for their vacancy
    const readyCandidates = [];
    for (const [key, data] of candidateMap.entries()) {
      const requiredMaterials = vacancyMaterialMap.get(data.vacancyId) || [];
      if (data.completedMaterials.size === requiredMaterials.length) {
        // Get application for this candidate and vacancy
        const application = await Application.findOne({
          candidate: data.candidate._id,
          vacancy: data.vacancyId,
        }).select('status');

        // Check if interview already exists
        const existingInterview = await Interview.findOne({
          candidate: data.candidate._id,
          vacancy: data.vacancyId,
          status: { $in: ['scheduled', 'completed'] },
        });

        readyCandidates.push({
          candidate: {
            id: data.candidate._id,
            firstName: data.candidate.firstName,
            lastName: data.candidate.lastName,
            phone: data.candidate.phone,
            telegramId: data.candidate.telegramId,
          },
          vacancyId: data.vacancyId,
          application: application || null,
          hasInterview: !!existingInterview,
          testResultsCount: data.testResults.length,
        });
      }
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const total = readyCandidates.length;
    const paginatedCandidates = readyCandidates.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      data: {
        candidates: paginatedCandidates,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get candidates ready for interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get all interviews
// @route   GET /api/admin/interviews
// @access  Private (Admin only)
const getInterviews = async (req, res) => {
  try {
    const { candidateId, vacancyId, status, result, page = 1, limit = 10 } = req.query;

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
    if (result) {
      query.result = result;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get interviews with populated details
    const interviews = await Interview.find(query)
      .populate('candidate', 'firstName lastName phone telegramId')
      .populate({
        path: 'vacancy',
        populate: {
          path: 'company',
          select: 'name inn',
        },
        select: 'title department position company',
      })
      .populate('application', 'status notes')
      .populate('createdBy', 'username email')
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
    console.error('Get interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get single interview
// @route   GET /api/admin/interviews/:id
// @access  Private (Admin only)
const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('candidate', 'firstName lastName phone telegramId registrationType')
      .populate({
        path: 'vacancy',
        populate: {
          path: 'company',
          select: 'name inn ownerFullName companyPhone',
        },
      })
      .populate('application', 'status notes')
      .populate('createdBy', 'username email')
      .populate('evaluations.admin', 'username email');

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

// @desc    Schedule interview
// @route   POST /api/admin/interviews
// @access  Private (Admin only)
const scheduleInterview = async (req, res) => {
  try {
    const { candidateId, vacancyId, content, interviewer, location, date, time } = req.body;
    const adminId = req.admin._id;

    // Check if candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found',
      });
    }

    // Check if vacancy exists
    const vacancy = await Vacancy.findById(vacancyId);
    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: 'Vacancy not found',
      });
    }

    // Get application if exists
    let application = await Application.findOne({
      candidate: candidateId,
      vacancy: vacancyId,
    });

    // Check if interview already scheduled for same candidate, vacancy, and date
    const existingInterview = await Interview.findOne({
      candidate: candidateId,
      vacancy: vacancyId,
      date: new Date(date),
      status: { $in: ['scheduled', 'completed'] },
    });

    if (existingInterview) {
      return res.status(400).json({
        success: false,
        message: 'Interview already scheduled for this candidate, vacancy, and date',
      });
    }

    // Create interview
    const interview = await Interview.create({
      candidate: candidateId,
      vacancy: vacancyId,
      application: application ? application._id : null,
      content,
      interviewer,
      location,
      date: new Date(date),
      time,
      status: 'scheduled',
      result: 'pending',
      createdBy: adminId,
    });

    // Update application status if exists
    if (application && application.status !== 'interview') {
      application.status = 'interview';
      await application.save();
    }

    // Populate details
    await interview.populate('candidate', 'firstName lastName phone telegramId');
    await interview.populate({
      path: 'vacancy',
      populate: {
        path: 'company',
        select: 'name inn',
      },
    });
    await interview.populate('createdBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      data: {
        interview,
      },
    });
  } catch (error) {
    console.error('Schedule interview error:', error);
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
        message: 'Interview already scheduled for this candidate, vacancy, and date',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update interview
// @route   PUT /api/admin/interviews/:id
// @access  Private (Admin only)
const updateInterview = async (req, res) => {
  try {
    const { content, interviewer, location, date, time, status } = req.body;

    let interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    // Update interview
    interview = await Interview.findByIdAndUpdate(
      req.params.id,
      {
        content,
        interviewer,
        location,
        date: date ? new Date(date) : undefined,
        time,
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('candidate', 'firstName lastName phone telegramId')
      .populate({
        path: 'vacancy',
        populate: {
          path: 'company',
          select: 'name inn',
        },
      })
      .populate('createdBy', 'username email');

    res.status(200).json({
      success: true,
      message: 'Interview updated successfully',
      data: {
        interview,
      },
    });
  } catch (error) {
    console.error('Update interview error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID',
      });
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Complete interview and set result
// @route   PATCH /api/admin/interviews/:id/complete
// @access  Private (Admin only)
const completeInterview = async (req, res) => {
  try {
    const { result } = req.body;

    if (!result || !['passed', 'failed'].includes(result)) {
      return res.status(400).json({
        success: false,
        message: 'Result must be either "passed" or "failed"',
      });
    }

    let interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Interview is already completed',
      });
    }

    // Update interview
    interview.status = 'completed';
    interview.result = result;
    await interview.save();

    // Update application status if exists
    if (interview.application) {
      const application = await Application.findById(interview.application);
      if (application) {
        if (result === 'passed') {
          application.status = 'passed';
        } else {
          application.status = 'failed';
        }
        await application.save();
      }
    }

    // Populate details
    await interview.populate('candidate', 'firstName lastName phone telegramId');
    await interview.populate({
      path: 'vacancy',
      populate: {
        path: 'company',
        select: 'name inn',
      },
    });
    await interview.populate('createdBy', 'username email');

    res.status(200).json({
      success: true,
      message: 'Interview completed successfully',
      data: {
        interview,
      },
    });
  } catch (error) {
    console.error('Complete interview error:', error);
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

// @desc    Add evaluation to interview
// @route   POST /api/admin/interviews/:id/evaluations
// @access  Private (Admin only)
const addEvaluation = async (req, res) => {
  try {
    const { text, rating } = req.body;
    const adminId = req.admin._id;

    if (!text || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Text and rating are required',
      });
    }

    if (rating < 1 || rating > 10) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 10',
      });
    }

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    // Check if admin already evaluated this interview
    const existingEvaluation = interview.evaluations.find(
      (eval) => eval.admin.toString() === adminId.toString()
    );

    if (existingEvaluation) {
      return res.status(400).json({
        success: false,
        message: 'You have already evaluated this interview',
      });
    }

    // Add evaluation
    interview.evaluations.push({
      admin: adminId,
      text,
      rating,
    });

    await interview.save();

    // Populate details
    await interview.populate('candidate', 'firstName lastName phone telegramId');
    await interview.populate({
      path: 'vacancy',
      populate: {
        path: 'company',
        select: 'name inn',
      },
    });
    await interview.populate('evaluations.admin', 'username email');

    res.status(200).json({
      success: true,
      message: 'Evaluation added successfully',
      data: {
        interview,
      },
    });
  } catch (error) {
    console.error('Add evaluation error:', error);
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

// @desc    Update evaluation
// @route   PUT /api/admin/interviews/:id/evaluations/:evaluationId
// @access  Private (Admin only)
const updateEvaluation = async (req, res) => {
  try {
    const { text, rating } = req.body;
    const adminId = req.admin._id;
    const { id, evaluationId } = req.params;

    const interview = await Interview.findById(id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    const evaluation = interview.evaluations.id(evaluationId);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found',
      });
    }

    // Check if admin owns this evaluation
    if (evaluation.admin.toString() !== adminId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own evaluation',
      });
    }

    // Update evaluation
    if (text !== undefined) {
      evaluation.text = text;
    }
    if (rating !== undefined) {
      if (rating < 1 || rating > 10) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 10',
        });
      }
      evaluation.rating = rating;
    }

    await interview.save();

    // Populate details
    await interview.populate('candidate', 'firstName lastName phone telegramId');
    await interview.populate({
      path: 'vacancy',
      populate: {
        path: 'company',
        select: 'name inn',
      },
    });
    await interview.populate('evaluations.admin', 'username email');

    res.status(200).json({
      success: true,
      message: 'Evaluation updated successfully',
      data: {
        interview,
      },
    });
  } catch (error) {
    console.error('Update evaluation error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview or evaluation ID',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Cancel interview
// @route   PATCH /api/admin/interviews/:id/cancel
// @access  Private (Admin only)
const cancelInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    if (interview.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Interview is already cancelled',
      });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed interview',
      });
    }

    interview.status = 'cancelled';
    await interview.save();

    // Populate details
    await interview.populate('candidate', 'firstName lastName phone telegramId');
    await interview.populate({
      path: 'vacancy',
      populate: {
        path: 'company',
        select: 'name inn',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Interview cancelled successfully',
      data: {
        interview,
      },
    });
  } catch (error) {
    console.error('Cancel interview error:', error);
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
  getCandidatesReadyForInterview,
  getInterviews,
  getInterview,
  scheduleInterview,
  updateInterview,
  completeInterview,
  addEvaluation,
  updateEvaluation,
  cancelInterview,
};

