const Material = require('../models/Material');
const Vacancy = require('../models/Vacancy');
const Company = require('../models/Company');

// @desc    Get all materials
// @route   GET /api/admin/materials
// @access  Private (Admin only)
const getMaterials = async (req, res) => {
  try {
    const { vacancy, company, isActive, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};
    if (vacancy) {
      query.vacancy = vacancy;
    }
    if (company) {
      query.company = company;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get materials with vacancy and company details
    const materials = await Material.find(query)
      .populate('vacancy', 'title company')
      .populate('company', 'name inn')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Material.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        materials,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
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

// @desc    Get single material
// @route   GET /api/admin/materials/:id
// @access  Private (Admin only)
const getMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('vacancy', 'title department position company')
      .populate('company', 'name inn ownerFullName companyPhone');

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        material,
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

// @desc    Create material
// @route   POST /api/admin/materials
// @access  Private (Admin only)
const createMaterial = async (req, res) => {
  try {
    const { title, videoUrl, description, vacancy, company, tests } = req.body;

    // Check if vacancy exists
    const vacancyExists = await Vacancy.findById(vacancy);
    if (!vacancyExists) {
      return res.status(404).json({
        success: false,
        message: 'Vacancy not found',
      });
    }

    // Check if company exists
    const companyExists = await Company.findById(company);
    if (!companyExists) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    // Validate tests
    if (!tests || !Array.isArray(tests) || tests.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'At least 3 tests are required',
      });
    }

    // Validate each test
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      if (!test.question || !test.options || !test.correctAnswer) {
        return res.status(400).json({
          success: false,
          message: `Test ${i + 1}: question, options, and correctAnswer are required`,
        });
      }

      if (!Array.isArray(test.options) || test.options.length < 2) {
        return res.status(400).json({
          success: false,
          message: `Test ${i + 1}: options must be an array with at least 2 items`,
        });
      }

      // Check if correctAnswer is valid (A, B, C, etc.)
      const optionLetters = test.options.map((_, index) =>
        String.fromCharCode(65 + index)
      );
      if (!optionLetters.includes(test.correctAnswer.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: `Test ${i + 1}: correctAnswer must be one of: ${optionLetters.join(', ')}`,
        });
      }
    }

    // Create material
    const material = await Material.create({
      title,
      videoUrl,
      description,
      vacancy,
      company,
      tests,
    });

    // Populate details
    await material.populate('vacancy', 'title company');
    await material.populate('company', 'name inn');

    res.status(201).json({
      success: true,
      message: 'Material created successfully',
      data: {
        material,
      },
    });
  } catch (error) {
    console.error('Create material error:', error);
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

// @desc    Update material
// @route   PUT /api/admin/materials/:id
// @access  Private (Admin only)
const updateMaterial = async (req, res) => {
  try {
    const { title, videoUrl, description, vacancy, company, tests, isActive } =
      req.body;

    let material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found',
      });
    }

    // Check if vacancy exists (if being updated)
    if (vacancy) {
      const vacancyExists = await Vacancy.findById(vacancy);
      if (!vacancyExists) {
        return res.status(404).json({
          success: false,
          message: 'Vacancy not found',
        });
      }
    }

    // Check if company exists (if being updated)
    if (company) {
      const companyExists = await Company.findById(company);
      if (!companyExists) {
        return res.status(404).json({
          success: false,
          message: 'Company not found',
        });
      }
    }

    // Validate tests if provided
    if (tests) {
      if (!Array.isArray(tests) || tests.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'At least 3 tests are required',
        });
      }

      // Validate each test
      for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        if (!test.question || !test.options || !test.correctAnswer) {
          return res.status(400).json({
            success: false,
            message: `Test ${i + 1}: question, options, and correctAnswer are required`,
          });
        }

        if (!Array.isArray(test.options) || test.options.length < 2) {
          return res.status(400).json({
            success: false,
            message: `Test ${i + 1}: options must be an array with at least 2 items`,
          });
        }

        // Check if correctAnswer is valid
        const optionLetters = test.options.map((_, index) =>
          String.fromCharCode(65 + index)
        );
        if (!optionLetters.includes(test.correctAnswer.toUpperCase())) {
          return res.status(400).json({
            success: false,
            message: `Test ${i + 1}: correctAnswer must be one of: ${optionLetters.join(', ')}`,
          });
        }
      }
    }

    // Update material
    material = await Material.findByIdAndUpdate(
      req.params.id,
      {
        title,
        videoUrl,
        description,
        vacancy,
        company,
        tests,
        isActive,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('vacancy', 'title company')
      .populate('company', 'name inn');

    res.status(200).json({
      success: true,
      message: 'Material updated successfully',
      data: {
        material,
      },
    });
  } catch (error) {
    console.error('Update material error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid material ID',
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

// @desc    Delete material
// @route   DELETE /api/admin/materials/:id
// @access  Private (Admin only)
const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found',
      });
    }

    await Material.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Material deleted successfully',
    });
  } catch (error) {
    console.error('Delete material error:', error);
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
  createMaterial,
  updateMaterial,
  deleteMaterial,
};


