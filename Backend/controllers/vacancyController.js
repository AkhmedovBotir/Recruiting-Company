const Vacancy = require('../models/Vacancy');
const Company = require('../models/Company');

// @desc    Get all vacancies
// @route   GET /api/vacancies
// @access  Private (Admin only)
const getVacancies = async (req, res) => {
  try {
    const { status, workType, company, page = 1, limit = 10, search } =
      req.query;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    if (workType) {
      query.workType = workType;
    }
    if (company) {
      query.company = company;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get vacancies with company details
    const vacancies = await Vacancy.find(query)
      .populate('company', 'name inn')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Vacancy.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        vacancies,
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

// @desc    Get single vacancy
// @route   GET /api/vacancies/:id
// @access  Private (Admin only)
const getVacancy = async (req, res) => {
  try {
    const vacancy = await Vacancy.findById(req.params.id).populate(
      'company',
      'name inn ownerFullName companyPhone'
    );

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: 'Vacancy not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        vacancy,
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

// @desc    Create vacancy
// @route   POST /api/vacancies
// @access  Private (Admin only)
const createVacancy = async (req, res) => {
  try {
    const {
      company,
      title,
      department,
      position,
      experience,
      workType,
      minAge,
      maxAge,
      salary,
      description,
      responsibilities,
      preferences,
      skills,
      status,
    } = req.body;

    // Check if company exists
    const companyExists = await Company.findById(company);
    if (!companyExists) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    // Validate maxAge > minAge
    if (maxAge <= minAge) {
      return res.status(400).json({
        success: false,
        message: 'Maximum age must be greater than minimum age',
      });
    }

    // Create vacancy
    const vacancy = await Vacancy.create({
      company,
      title,
      department,
      position,
      experience,
      workType,
      minAge,
      maxAge,
      salary,
      description,
      responsibilities,
      preferences,
      skills,
      status: status || 'active',
    });

    // Populate company details
    await vacancy.populate('company', 'name inn');

    res.status(201).json({
      success: true,
      message: 'Vacancy created successfully',
      data: {
        vacancy,
      },
    });
  } catch (error) {
    console.error('Create vacancy error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }
    if (error.message === 'Maximum age must be greater than minimum age') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update vacancy
// @route   PUT /api/vacancies/:id
// @access  Private (Admin only)
const updateVacancy = async (req, res) => {
  try {
    const {
      company,
      title,
      department,
      position,
      experience,
      workType,
      minAge,
      maxAge,
      salary,
      description,
      responsibilities,
      preferences,
      skills,
      status,
    } = req.body;

    let vacancy = await Vacancy.findById(req.params.id);

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: 'Vacancy not found',
      });
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

    // Validate maxAge > minAge
    const finalMinAge = minAge !== undefined ? minAge : vacancy.minAge;
    const finalMaxAge = maxAge !== undefined ? maxAge : vacancy.maxAge;
    if (finalMaxAge <= finalMinAge) {
      return res.status(400).json({
        success: false,
        message: 'Maximum age must be greater than minimum age',
      });
    }

    // Update vacancy
    vacancy = await Vacancy.findByIdAndUpdate(
      req.params.id,
      {
        company,
        title,
        department,
        position,
        experience,
        workType,
        minAge,
        maxAge,
        salary,
        description,
        responsibilities,
        preferences,
        skills,
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate('company', 'name inn');

    res.status(200).json({
      success: true,
      message: 'Vacancy updated successfully',
      data: {
        vacancy,
      },
    });
  } catch (error) {
    console.error('Update vacancy error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid vacancy ID',
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
    if (error.message === 'Maximum age must be greater than minimum age') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Close vacancy
// @route   PATCH /api/vacancies/:id/close
// @access  Private (Admin only)
const closeVacancy = async (req, res) => {
  try {
    const vacancy = await Vacancy.findById(req.params.id);

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: 'Vacancy not found',
      });
    }

    if (vacancy.status === 'close') {
      return res.status(400).json({
        success: false,
        message: 'Vacancy is already closed',
      });
    }

    vacancy.status = 'close';
    await vacancy.save();

    await vacancy.populate('company', 'name inn');

    res.status(200).json({
      success: true,
      message: 'Vacancy closed successfully',
      data: {
        vacancy,
      },
    });
  } catch (error) {
    console.error('Close vacancy error:', error);
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

// @desc    Delete vacancy
// @route   DELETE /api/vacancies/:id
// @access  Private (Admin only)
const deleteVacancy = async (req, res) => {
  try {
    const vacancy = await Vacancy.findById(req.params.id);

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: 'Vacancy not found',
      });
    }

    await Vacancy.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Vacancy deleted successfully',
    });
  } catch (error) {
    console.error('Delete vacancy error:', error);
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
  getVacancies,
  getVacancy,
  createVacancy,
  updateVacancy,
  closeVacancy,
  deleteVacancy,
};

