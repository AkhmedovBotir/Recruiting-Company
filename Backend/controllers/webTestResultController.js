const TestResult = require('../models/TestResult');
const Material = require('../models/Material');
const Candidate = require('../models/Candidate');

// @desc    Get all test results for current candidate
// @route   GET /api/web/test-results
// @access  Private (Candidate token required)
const getMyTestResults = async (req, res) => {
  try {
    const candidateId = req.candidate._id;
    const { materialId, vacancyId, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { candidate: candidateId };
    if (materialId) {
      query.material = materialId;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get test results with material and vacancy details
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
      .populate('candidate', 'firstName lastName phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Filter by vacancy if provided
    if (vacancyId) {
      testResults = testResults.filter(
        (result) => result.material?.vacancy?._id?.toString() === vacancyId
      );
    }

    // Get total count
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
    console.error('Get my test results error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get single test result with detailed answers
// @route   GET /api/web/test-results/:id
// @access  Private (Candidate token required)
const getTestResult = async (req, res) => {
  try {
    const candidateId = req.candidate._id;
    const testResultId = req.params.id;

    // Get test result
    const testResult = await TestResult.findOne({
      _id: testResultId,
      candidate: candidateId,
    })
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
      })
      .populate('candidate', 'firstName lastName phone');

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
          },
          correctCount: testResult.correctCount,
          incorrectCount: testResult.incorrectCount,
          totalQuestions: testResult.totalQuestions,
          score: testResult.score,
          answers: detailedAnswers,
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

// @desc    Get test results by material
// @route   GET /api/web/test-results/material/:materialId
// @access  Private (Candidate token required)
const getTestResultsByMaterial = async (req, res) => {
  try {
    const candidateId = req.candidate._id;
    const materialId = req.params.materialId;

    // Get test result
    const testResult = await TestResult.findOne({
      candidate: candidateId,
      material: materialId,
    })
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
      });

    if (!testResult) {
      return res.status(404).json({
        success: false,
        message: 'Test result not found for this material',
      });
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
          correctCount: testResult.correctCount,
          incorrectCount: testResult.incorrectCount,
          totalQuestions: testResult.totalQuestions,
          score: testResult.score,
          answers: testResult.answers,
          submittedAt: testResult.createdAt,
          updatedAt: testResult.updatedAt,
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

module.exports = {
  getMyTestResults,
  getTestResult,
  getTestResultsByMaterial,
};

