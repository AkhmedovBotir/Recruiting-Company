const Vacancy = require('../models/Vacancy');

// @desc    Get all vacancies (public, web)
// @route   GET /api/web/vacancies
// @access  Public
const getVacancies = async (req, res) => {
  try {
    const { workType, page = 1, limit = 10, search } = req.query;

    // Build query - only active vacancies
    const query = { status: 'active' };
    if (workType) {
      query.workType = workType;
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
      .select('-description -responsibilities -preferences -skills')
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

// @desc    Get single vacancy (public, web)
// @route   GET /api/web/vacancies/:id
// @access  Public
const getVacancy = async (req, res) => {
  try {
    const vacancy = await Vacancy.findOne({
      _id: req.params.id,
      status: 'active',
    }).populate('company', 'name inn ownerFullName companyPhone');

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

module.exports = {
  getVacancies,
  getVacancy,
};

