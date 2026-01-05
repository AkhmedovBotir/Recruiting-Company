const Company = require('../models/Company');

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private (Admin only)
const getCompanies = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { inn: { $regex: search, $options: 'i' } },
        { ownerFullName: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get companies
    const companies = await Company.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Company.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        companies,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Private (Admin only)
const getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        company,
      },
    });
  } catch (error) {
    console.error('Get company error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Create company
// @route   POST /api/companies
// @access  Private (Admin only)
const createCompany = async (req, res) => {
  try {
    const { name, inn, ownerFullName, ownerPhone, companyPhone, status } =
      req.body;

    // Check if company with same INN exists
    const existingCompany = await Company.findOne({ inn });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Company with this INN already exists',
      });
    }

    // Create company
    const company = await Company.create({
      name,
      inn,
      ownerFullName,
      ownerPhone,
      companyPhone,
      status: status || 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: {
        company,
      },
    });
  } catch (error) {
    console.error('Create company error:', error);
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
        message: 'Company with this INN already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private (Admin only)
const updateCompany = async (req, res) => {
  try {
    const { name, inn, ownerFullName, ownerPhone, companyPhone, status } =
      req.body;

    let company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    // Check if INN is being changed and if it already exists
    if (inn && inn !== company.inn) {
      const existingCompany = await Company.findOne({ inn });
      if (existingCompany) {
        return res.status(400).json({
          success: false,
          message: 'Company with this INN already exists',
        });
      }
    }

    // Update company
    company = await Company.findByIdAndUpdate(
      req.params.id,
      {
        name,
        inn,
        ownerFullName,
        ownerPhone,
        companyPhone,
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      data: {
        company,
      },
    });
  } catch (error) {
    console.error('Update company error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
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
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Company with this INN already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private (Admin only)
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    await Company.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Company deleted successfully',
    });
  } catch (error) {
    console.error('Delete company error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
};

