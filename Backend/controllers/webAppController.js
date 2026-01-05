const Candidate = require('../models/Candidate');
const { validateTelegramWebApp } = require('../utils/telegramWebApp');
const generateToken = require('../utils/generateToken');

// @desc    Authenticate Telegram Web App user
// @route   POST /api/web-app/auth
// @access  Public
const authenticateWebApp = async (req, res) => {
  try {
    const { initData } = req.body;

    // Validate input
    if (!initData) {
      return res.status(400).json({
        success: false,
        message: 'Please provide initData',
      });
    }

    // Get bot token from environment
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN is not set in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
      });
    }

    // Validate Telegram Web App initData
    const userData = validateTelegramWebApp(initData, botToken);

    if (!userData) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired initData',
      });
    }

    // Check if candidate exists by telegramId
    let candidate = await Candidate.findOne({
      telegramId: userData.id,
    });

    if (candidate) {
      // Update candidate info if needed
      if (!candidate.firstName && userData.firstName) {
        candidate.firstName = userData.firstName;
      }
      if (!candidate.lastName && userData.lastName) {
        candidate.lastName = userData.lastName;
      }
      await candidate.save();

      // Generate token
      const token = generateToken(candidate._id);

      return res.status(200).json({
        success: true,
        message: 'Authentication successful',
        data: {
          token,
          candidate: {
            id: candidate._id,
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            phone: candidate.phone,
            telegramId: candidate.telegramId,
            registrationType: candidate.registrationType,
          },
          isNewUser: false,
        },
      });
    }

    // Check if candidate exists by phone (if available)
    // Note: Telegram Web App doesn't always provide phone number
    // In this case, we'll create a new candidate

    // Create new candidate
    candidate = await Candidate.create({
      firstName: userData.firstName || 'User',
      lastName: userData.lastName || '',
      phone: '', // Phone will be empty, user needs to add it later if needed
      telegramId: userData.id,
      registrationType: 'bot', // Telegram Web App is considered as bot registration
    });

    // Generate token
    const token = generateToken(candidate._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        candidate: {
          id: candidate._id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          phone: candidate.phone,
          telegramId: candidate.telegramId,
          registrationType: candidate.registrationType,
        },
        isNewUser: true,
      },
    });
  } catch (error) {
    console.error('Web app authentication error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Candidate with this telegram ID already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  authenticateWebApp,
};

