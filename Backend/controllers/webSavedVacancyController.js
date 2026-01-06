const SavedVacancy = require('../models/SavedVacancy');
const Vacancy = require('../models/Vacancy');

// @desc    Save vacancy
// @route   POST /api/web/saved-vacancies
// @access  Private (Candidate token required)
const saveVacancy = async (req, res) => {
  try {
    const { vacancyId } = req.body;
    const candidateId = req.candidate._id;

    // Validate input
    if (!vacancyId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide vacancy ID',
      });
    }

    // Check if vacancy exists and is active
    const vacancy = await Vacancy.findOne({
      _id: vacancyId,
      status: 'active',
    });

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: 'Vacancy not found or not active',
      });
    }

    // Check if already saved
    const existingSaved = await SavedVacancy.findOne({
      candidate: candidateId,
      vacancy: vacancyId,
    });

    if (existingSaved) {
      return res.status(400).json({
        success: false,
        message: 'Vacancy already saved',
      });
    }

    // Save vacancy
    const savedVacancy = await SavedVacancy.create({
      candidate: candidateId,
      vacancy: vacancyId,
    });

    // Populate vacancy details
    await savedVacancy.populate({
      path: 'vacancy',
      populate: {
        path: 'company',
        select: 'name inn',
      },
      select: 'title department position workType salary status',
    });

    res.status(201).json({
      success: true,
      message: 'Vacancy saved successfully',
      data: {
        savedVacancy: {
          id: savedVacancy._id,
          vacancy: savedVacancy.vacancy,
          savedAt: savedVacancy.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Save vacancy error:', error);
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
        message: 'Vacancy already saved',
      });
    }
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

// @desc    Unsave vacancy
// @route   DELETE /api/web/saved-vacancies/:vacancyId
// @access  Private (Candidate token required)
const unsaveVacancy = async (req, res) => {
  try {
    const { vacancyId } = req.params;
    const candidateId = req.candidate._id;

    const savedVacancy = await SavedVacancy.findOne({
      candidate: candidateId,
      vacancy: vacancyId,
    });

    if (!savedVacancy) {
      return res.status(404).json({
        success: false,
        message: 'Saved vacancy not found',
      });
    }

    await SavedVacancy.findByIdAndDelete(savedVacancy._id);

    res.status(200).json({
      success: true,
      message: 'Vacancy unsaved successfully',
    });
  } catch (error) {
    console.error('Unsave vacancy error:', error);
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

// @desc    Get all saved vacancies
// @route   GET /api/web/saved-vacancies
// @access  Private (Candidate token required)
const getSavedVacancies = async (req, res) => {
  try {
    const candidateId = req.candidate._id;
    const { page = 1, limit = 10 } = req.query;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get saved vacancies with vacancy and company details
    const savedVacancies = await SavedVacancy.find({ candidate: candidateId })
      .populate({
        path: 'vacancy',
        populate: {
          path: 'company',
          select: 'name inn',
        },
        select: 'title department position workType salary status',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await SavedVacancy.countDocuments({ candidate: candidateId });

    res.status(200).json({
      success: true,
      data: {
        savedVacancies,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get saved vacancies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Check if vacancy is saved
// @route   GET /api/web/saved-vacancies/check/:vacancyId
// @access  Private (Candidate token required)
const checkSavedVacancy = async (req, res) => {
  try {
    const { vacancyId } = req.params;
    const candidateId = req.candidate._id;

    const savedVacancy = await SavedVacancy.findOne({
      candidate: candidateId,
      vacancy: vacancyId,
    });

    res.status(200).json({
      success: true,
      data: {
        isSaved: !!savedVacancy,
        savedVacancy: savedVacancy
          ? {
              id: savedVacancy._id,
              savedAt: savedVacancy.createdAt,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Check saved vacancy error:', error);
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
  saveVacancy,
  unsaveVacancy,
  getSavedVacancies,
  checkSavedVacancy,
};


