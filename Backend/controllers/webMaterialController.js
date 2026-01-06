const Material = require('../models/Material');
const TestResult = require('../models/TestResult');
const Application = require('../models/Application');

// @desc    Get materials for candidate (only for accepted/passed candidates)
// @route   GET /api/web/materials
// @access  Private (Candidate token required)
const getMaterials = async (req, res) => {
  try {
    const candidateId = req.candidate._id;

    // Get candidate's applications with accepted or passed status
    const applications = await Application.find({
      candidate: candidateId,
      status: { $in: ['accepted', 'passed'] },
    }).select('vacancy');

    if (applications.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          materials: [],
          message: 'No materials available. You need to be accepted or passed interview.',
        },
      });
    }

    // Get vacancy IDs
    const vacancyIds = applications.map((app) => app.vacancy);

    // Get materials for these vacancies
    const materials = await Material.find({
      vacancy: { $in: vacancyIds },
      isActive: true,
    })
      .populate('vacancy', 'title company')
      .populate('company', 'name inn')
      .select('-tests.correctAnswer') // Hide correct answers
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        materials,
      },
    });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get single material (without correct answers)
// @route   GET /api/web/materials/:id
// @access  Private (Candidate token required)
const getMaterial = async (req, res) => {
  try {
    const candidateId = req.candidate._id;
    const materialId = req.params.id;

    // Check if candidate has access to this material
    const material = await Material.findById(materialId).populate(
      'vacancy',
      'title company'
    );

    if (!material || !material.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Material not found',
      });
    }

    // Check if candidate has application with accepted/passed status for this vacancy
    const application = await Application.findOne({
      candidate: candidateId,
      vacancy: material.vacancy._id,
      status: { $in: ['accepted', 'passed'] },
    });

    if (!application) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this material',
      });
    }

    // Remove correct answers from tests
    const materialData = material.toObject();
    if (materialData.tests) {
      materialData.tests = materialData.tests.map((test) => {
        const { correctAnswer, ...testWithoutAnswer } = test;
        return testWithoutAnswer;
      });
    }

    res.status(200).json({
      success: true,
      data: {
        material: materialData,
      },
    });
  } catch (error) {
    console.error('Get material error:', error);
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

// @desc    Submit test answers
// @route   POST /api/web/materials/:id/submit-test
// @access  Private (Candidate token required)
const submitTest = async (req, res) => {
  try {
    const candidateId = req.candidate._id;
    const materialId = req.params.id;
    const { answers } = req.body;

    // Validate input
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide answers as an array',
      });
    }

    // Get material
    const material = await Material.findById(materialId);

    if (!material || !material.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Material not found',
      });
    }

    // Check if candidate has access
    const application = await Application.findOne({
      candidate: candidateId,
      vacancy: material.vacancy,
      status: { $in: ['accepted', 'passed'] },
    });

    if (!application) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this material',
      });
    }

    // Check if test already submitted
    const existingResult = await TestResult.findOne({
      candidate: candidateId,
      material: materialId,
    });

    if (existingResult) {
      return res.status(400).json({
        success: false,
        message: 'Test already submitted',
      });
    }

    // Validate answers
    if (answers.length !== material.tests.length) {
      return res.status(400).json({
        success: false,
        message: `Please answer all ${material.tests.length} questions`,
      });
    }

    // Check answers and calculate results
    const testAnswers = [];
    let correctCount = 0;
    let incorrectCount = 0;

    material.tests.forEach((test, index) => {
      const userAnswer = answers[index];
      const isCorrect =
        userAnswer &&
        userAnswer.toUpperCase() === test.correctAnswer.toUpperCase();

      testAnswers.push({
        questionIndex: index,
        answer: userAnswer || '',
        isCorrect,
      });

      if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    // Calculate score
    const totalQuestions = material.tests.length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    // Create test result
    const testResult = await TestResult.create({
      candidate: candidateId,
      material: materialId,
      answers: testAnswers,
      correctCount,
      incorrectCount,
      totalQuestions,
      score,
    });

    res.status(201).json({
      success: true,
      message: 'Test submitted successfully',
      data: {
        testResult: {
          id: testResult._id,
          correctCount: testResult.correctCount,
          incorrectCount: testResult.incorrectCount,
          totalQuestions: testResult.totalQuestions,
          score: testResult.score,
          submittedAt: testResult.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Submit test error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid material ID',
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Test already submitted',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get test results
// @route   GET /api/web/materials/:id/results
// @access  Private (Candidate token required)
const getTestResults = async (req, res) => {
  try {
    const candidateId = req.candidate._id;
    const materialId = req.params.id;

    // Get test result
    const testResult = await TestResult.findOne({
      candidate: candidateId,
      material: materialId,
    }).populate('material', 'title');

    if (!testResult) {
      return res.status(404).json({
        success: false,
        message: 'Test result not found. Please submit the test first.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        testResult: {
          id: testResult._id,
          material: testResult.material,
          correctCount: testResult.correctCount,
          incorrectCount: testResult.incorrectCount,
          totalQuestions: testResult.totalQuestions,
          score: testResult.score,
          answers: testResult.answers,
          submittedAt: testResult.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Get test results error:', error);
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
  getMaterials,
  getMaterial,
  submitTest,
  getTestResults,
};


