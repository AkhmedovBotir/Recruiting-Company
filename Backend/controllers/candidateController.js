const Candidate = require('../models/Candidate');
const smsService = require('../services/smsService');
const { storeCode, verifyCode } = require('../utils/codeStore');
const generateToken = require('../utils/generateToken');

// ==================== BOT ENDPOINTS ====================

// @desc    Bot: Start registration (send SMS code)
// @route   POST /api/candidates/bot/register-start
// @access  Public
const botRegisterStart = async (req, res) => {
  try {
    const { firstName, lastName, phone, telegramId } = req.body;

    // Validate input
    if (!firstName || !lastName || !phone || !telegramId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide firstName, lastName, phone, and telegramId',
      });
    }

    // Format phone number
    const formattedPhone = phone.replace(/[+\s-()]/g, '');
    const finalPhone = formattedPhone.startsWith('998')
      ? `+${formattedPhone}`
      : `+998${formattedPhone}`;

    // Check if candidate already exists
    const existingCandidate = await Candidate.findOne({
      $or: [{ phone: finalPhone }, { telegramId }],
    });

    if (existingCandidate) {
      return res.status(400).json({
        success: false,
        message: 'Candidate with this phone or telegram ID already exists',
      });
    }

    // Generate and send verification code
    const code = smsService.generateCode();

    try {
      await smsService.sendVacancyLoginCode(finalPhone, code);
      storeCode(finalPhone, code);

      res.status(200).json({
        success: true,
        message: 'Verification code sent successfully',
        data: {
          phone: finalPhone,
          expiresIn: 300, // 5 minutes in seconds
        },
      });
    } catch (smsError) {
      console.error('SMS error:', smsError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification code',
      });
    }
  } catch (error) {
    console.error('Bot register start error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Bot: Verify code and complete registration
// @route   POST /api/candidates/bot/verify
// @access  Public
const botVerify = async (req, res) => {
  try {
    const { phone, code, firstName, lastName, telegramId } = req.body;

    // Validate input
    if (!phone || !code || !firstName || !lastName || !telegramId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone, code, firstName, lastName, and telegramId',
      });
    }

    // Format phone number
    const formattedPhone = phone.replace(/[+\s-()]/g, '');
    const finalPhone = formattedPhone.startsWith('998')
      ? `+${formattedPhone}`
      : `+998${formattedPhone}`;

    // Verify code
    const codeVerification = verifyCode(finalPhone, code);
    if (!codeVerification.valid) {
      return res.status(400).json({
        success: false,
        message: codeVerification.message,
      });
    }

    // Check if candidate already exists
    let candidate = await Candidate.findOne({ phone: finalPhone });

    if (candidate) {
      // Update telegram ID if not set
      if (!candidate.telegramId) {
        candidate.telegramId = telegramId;
        candidate.registrationType = 'bot';
        await candidate.save();
      }

      // Generate token
      const token = generateToken(candidate._id);

      return res.status(200).json({
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
          },
        },
      });
    }

    // Create new candidate
    candidate = await Candidate.create({
      firstName,
      lastName,
      phone: finalPhone,
      telegramId,
      registrationType: 'bot',
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
        },
      },
    });
  } catch (error) {
    console.error('Bot verify error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Candidate with this phone or telegram ID already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ==================== WEB ENDPOINTS ====================

// @desc    Web: Start login (send SMS code)
// @route   POST /api/candidates/web/login-start
// @access  Public
const webLoginStart = async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate input
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone number',
      });
    }

    // Format phone number
    const formattedPhone = phone.replace(/[+\s-()]/g, '');
    const finalPhone = formattedPhone.startsWith('998')
      ? `+${formattedPhone}`
      : `+998${formattedPhone}`;

    // Generate and send verification code
    const code = smsService.generateCode();

    try {
      await smsService.sendVacancyLoginCode(finalPhone, code);
      storeCode(finalPhone, code);

      res.status(200).json({
        success: true,
        message: 'Verification code sent successfully',
        data: {
          phone: finalPhone,
          expiresIn: 300, // 5 minutes in seconds
        },
      });
    } catch (smsError) {
      console.error('SMS error:', smsError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification code',
      });
    }
  } catch (error) {
    console.error('Web login start error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Web: Verify code and check if candidate exists
// @route   POST /api/candidates/web/verify
// @access  Public
const webVerify = async (req, res) => {
  try {
    const { phone, code } = req.body;

    // Validate input
    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone and code',
      });
    }

    // Format phone number
    const formattedPhone = phone.replace(/[+\s-()]/g, '');
    const finalPhone = formattedPhone.startsWith('998')
      ? `+${formattedPhone}`
      : `+998${formattedPhone}`;

    // Verify code
    const codeVerification = verifyCode(finalPhone, code);
    if (!codeVerification.valid) {
      return res.status(400).json({
        success: false,
        message: codeVerification.message,
      });
    }

    // Check if candidate exists
    const candidate = await Candidate.findOne({ phone: finalPhone });

    if (candidate) {
      // Candidate exists, return token and data
      const token = generateToken(candidate._id);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          candidate: {
            id: candidate._id,
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            phone: candidate.phone,
            registrationType: candidate.registrationType,
          },
          exists: true,
        },
      });
    }

    // Candidate doesn't exist, need registration
    res.status(200).json({
      success: true,
      message: 'Candidate not found, registration required',
      data: {
        phone: finalPhone,
        exists: false,
      },
    });
  } catch (error) {
    console.error('Web verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Web: Register new candidate
// @route   POST /api/candidates/web/register
// @access  Public
const webRegister = async (req, res) => {
  try {
    const { phone, firstName, lastName } = req.body;

    // Validate input
    if (!phone || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone, firstName, and lastName',
      });
    }

    // Format phone number
    const formattedPhone = phone.replace(/[+\s-()]/g, '');
    const finalPhone = formattedPhone.startsWith('998')
      ? `+${formattedPhone}`
      : `+998${formattedPhone}`;

    // Check if candidate already exists
    const existingCandidate = await Candidate.findOne({ phone: finalPhone });

    if (existingCandidate) {
      const token = generateToken(existingCandidate._id);

      return res.status(200).json({
        success: true,
        message: 'Candidate already exists',
        data: {
          token,
          candidate: {
            id: existingCandidate._id,
            firstName: existingCandidate.firstName,
            lastName: existingCandidate.lastName,
            phone: existingCandidate.phone,
            registrationType: existingCandidate.registrationType,
          },
        },
      });
    }

    // Create new candidate
    const candidate = await Candidate.create({
      firstName,
      lastName,
      phone: finalPhone,
      registrationType: 'web',
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
          registrationType: candidate.registrationType,
        },
      },
    });
  } catch (error) {
    console.error('Web register error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Candidate with this phone already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  botRegisterStart,
  botVerify,
  webLoginStart,
  webVerify,
  webRegister,
};

