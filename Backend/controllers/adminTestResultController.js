const TestResult = require('../models/TestResult');
const Material = require('../models/Material');
const Candidate = require('../models/Candidate');
const Vacancy = require('../models/Vacancy');
const Application = require('../models/Application');

// @desc    Get all test results
// @route   GET /api/admin/test-results
// @access  Private (Admin only)
const getTestResults = async (req, res) => {
  try {
    const { candidateId, materialId, vacancyId, minScore, maxScore, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};
    if (candidateId) {
      query.candidate = candidateId;
    }
    if (materialId) {
      query.material = materialId;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get test results with populated details
    let testResults = await TestResult.find(query)
      .populate({
        path: 'material',
        populate: {
          path: 'vacancy',
          select: 'title department position company',
          populate: {
            path: 'company',
            select: 'name inn',
          },
        },
        select: 'title description vacancy',
      })
      .populate('candidate', 'firstName lastName phone telegramId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Filter by vacancy if provided
    if (vacancyId) {
      testResults = testResults.filter(
        (result) => result.material?.vacancy?._id?.toString() === vacancyId
      );
    }

    // Filter by score range if provided
    if (minScore !== undefined || maxScore !== undefined) {
      testResults = testResults.filter((result) => {
        const score = result.score;
        if (minScore !== undefined && score < parseInt(minScore)) return false;
        if (maxScore !== undefined && score > parseInt(maxScore)) return false;
        return true;
      });
    }

    // Get total count (before filtering)
    const total = await TestResult.countDocuments(query);

    // Format response
    const formattedResults = testResults.map((result) => ({
      id: result._id,
      material: {
        id: result.material._id,
        title: result.material.title,
        description: result.material.description,
        vacancy: result.material.vacancy,
      },
      candidate: {
        id: result.candidate._id,
        firstName: result.candidate.firstName,
        lastName: result.candidate.lastName,
        phone: result.candidate.phone,
        telegramId: result.candidate.telegramId,
      },
      correctCount: result.correctCount,
      incorrectCount: result.incorrectCount,
      totalQuestions: result.totalQuestions,
      score: result.score,
      submittedAt: result.createdAt,
      updatedAt: result.updatedAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        testResults: formattedResults,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get test results error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get single test result with detailed answers
// @route   GET /api/admin/test-results/:id
// @access  Private (Admin only)
const getTestResult = async (req, res) => {
  try {
    const testResultId = req.params.id;

    // Get test result
    const testResult = await TestResult.findById(testResultId)
      .populate({
        path: 'material',
        populate: {
          path: 'vacancy',
          select: 'title department position company',
          populate: {
            path: 'company',
            select: 'name inn ownerFullName companyPhone',
          },
        },
      })
      .populate('candidate', 'firstName lastName phone telegramId registrationType');

    if (!testResult) {
      return res.status(404).json({
        success: false,
        message: 'Test result not found',
      });
    }

    // Get material with questions for detailed view
    const material = await Material.findById(testResult.material._id);

    // Format answers with question details
    const detailedAnswers = testResult.answers.map((answer) => {
      const question = material.tests[answer.questionIndex];
      return {
        questionIndex: answer.questionIndex,
        question: question ? question.question : 'Question not found',
        options: question ? question.options : [],
        correctAnswer: question ? question.correctAnswer : null,
        userAnswer: answer.answer,
        isCorrect: answer.isCorrect,
      };
    });

    // Get candidate's application for this vacancy if exists
    let application = null;
    if (testResult.material?.vacancy) {
      application = await Application.findOne({
        candidate: testResult.candidate._id,
        vacancy: testResult.material.vacancy._id,
      }).select('status notes');
    }

    res.status(200).json({
      success: true,
      data: {
        testResult: {
          id: testResult._id,
          material: {
            id: testResult.material._id,
            title: testResult.material.title,
            description: testResult.material.description,
            vacancy: testResult.material.vacancy,
          },
          candidate: {
            id: testResult.candidate._id,
            firstName: testResult.candidate.firstName,
            lastName: testResult.candidate.lastName,
            phone: testResult.candidate.phone,
            telegramId: testResult.candidate.telegramId,
            registrationType: testResult.candidate.registrationType,
          },
          correctCount: testResult.correctCount,
          incorrectCount: testResult.incorrectCount,
          totalQuestions: testResult.totalQuestions,
          score: testResult.score,
          answers: detailedAnswers,
          application: application || null,
          submittedAt: testResult.createdAt,
          updatedAt: testResult.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Get test result error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid test result ID',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get test results by candidate
// @route   GET /api/admin/test-results/candidate/:candidateId
// @access  Private (Admin only)
const getTestResultsByCandidate = async (req, res) => {
  try {
    const candidateId = req.params.candidateId;
    const { page = 1, limit = 10 } = req.query;

    // Check if candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found',
      });
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get test results
    const testResults = await TestResult.find({ candidate: candidateId })
      .populate({
        path: 'material',
        populate: {
          path: 'vacancy',
          select: 'title department position company',
          populate: {
            path: 'company',
            select: 'name inn',
          },
        },
        select: 'title description vacancy',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await TestResult.countDocuments({ candidate: candidateId });

    // Format response
    const formattedResults = testResults.map((result) => ({
      id: result._id,
      material: {
        id: result.material._id,
        title: result.material.title,
        description: result.material.description,
        vacancy: result.material.vacancy,
      },
      correctCount: result.correctCount,
      incorrectCount: result.incorrectCount,
      totalQuestions: result.totalQuestions,
      score: result.score,
      submittedAt: result.createdAt,
      updatedAt: result.updatedAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        candidate: {
          id: candidate._id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          phone: candidate.phone,
        },
        testResults: formattedResults,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get test results by candidate error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid candidate ID',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get test results by material
// @route   GET /api/admin/test-results/material/:materialId
// @access  Private (Admin only)
const getTestResultsByMaterial = async (req, res) => {
  try {
    const materialId = req.params.materialId;
    const { page = 1, limit = 10, minScore, maxScore } = req.query;

    // Check if material exists
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found',
      });
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = { material: materialId };
    if (minScore !== undefined || maxScore !== undefined) {
      query.score = {};
      if (minScore !== undefined) query.score.$gte = parseInt(minScore);
      if (maxScore !== undefined) query.score.$lte = parseInt(maxScore);
    }

    // Get test results
    const testResults = await TestResult.find(query)
      .populate('candidate', 'firstName lastName phone telegramId')
      .sort({ score: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await TestResult.countDocuments(query);

    // Format response
    const formattedResults = testResults.map((result) => ({
      id: result._id,
      candidate: {
        id: result.candidate._id,
        firstName: result.candidate.firstName,
        lastName: result.candidate.lastName,
        phone: result.candidate.phone,
        telegramId: result.candidate.telegramId,
      },
      correctCount: result.correctCount,
      incorrectCount: result.incorrectCount,
      totalQuestions: result.totalQuestions,
      score: result.score,
      submittedAt: result.createdAt,
      updatedAt: result.updatedAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        material: {
          id: material._id,
          title: material.title,
          description: material.description,
        },
        testResults: formattedResults,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get test results by material error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid material ID',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get test results by vacancy
// @route   GET /api/admin/test-results/vacancy/:vacancyId
// @access  Private (Admin only)
const getTestResultsByVacancy = async (req, res) => {
  try {
    const vacancyId = req.params.vacancyId;
    const { page = 1, limit = 10 } = req.query;

    // Check if vacancy exists
    const vacancy = await Vacancy.findById(vacancyId);
    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: 'Vacancy not found',
      });
    }

    // Get materials for this vacancy
    const materials = await Material.find({ vacancy: vacancyId }).select('_id');
    const materialIds = materials.map((m) => m._id);

    if (materialIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          vacancy: {
            id: vacancy._id,
            title: vacancy.title,
            department: vacancy.department,
            position: vacancy.position,
          },
          testResults: [],
          pagination: {
            page: 1,
            limit: parseInt(limit),
            total: 0,
            pages: 0,
          },
        },
      });
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get test results
    const testResults = await TestResult.find({ material: { $in: materialIds } })
      .populate({
        path: 'material',
        select: 'title description',
      })
      .populate('candidate', 'firstName lastName phone telegramId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await TestResult.countDocuments({ material: { $in: materialIds } });

    // Format response
    const formattedResults = testResults.map((result) => ({
      id: result._id,
      material: {
        id: result.material._id,
        title: result.material.title,
        description: result.material.description,
      },
      candidate: {
        id: result.candidate._id,
        firstName: result.candidate.firstName,
        lastName: result.candidate.lastName,
        phone: result.candidate.phone,
        telegramId: result.candidate.telegramId,
      },
      correctCount: result.correctCount,
      incorrectCount: result.incorrectCount,
      totalQuestions: result.totalQuestions,
      score: result.score,
      submittedAt: result.createdAt,
      updatedAt: result.updatedAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        vacancy: {
          id: vacancy._id,
          title: vacancy.title,
          department: vacancy.department,
          position: vacancy.position,
        },
        testResults: formattedResults,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get test results by vacancy error:', error);
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

module.exports = {
  getTestResults,
  getTestResult,
  getTestResultsByCandidate,
  getTestResultsByMaterial,
  getTestResultsByVacancy,
};

