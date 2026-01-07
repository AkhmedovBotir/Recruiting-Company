const { body, validationResult } = require('express-validator');
const { validate } = require('./validator');

// Bot login start validation
const validateBotLoginStart = [
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim(),
  validate,
];

// Bot verify validation
const validateBotVerify = [
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim(),
  body('code')
    .notEmpty()
    .withMessage('Verification code is required')
    .trim()
    .isLength({ min: 5, max: 5 })
    .withMessage('Verification code must be 5 digits')
    .isNumeric()
    .withMessage('Verification code must be numeric'),
  validate,
];

// Bot register validation
const validateBotRegister = [
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim(),
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .trim()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('telegramId')
    .notEmpty()
    .withMessage('Telegram ID is required')
    .trim(),
  validate,
];

// Web login start validation
const validateWebLoginStart = [
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim(),
  validate,
];

// Web verify validation
const validateWebVerify = [
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim(),
  body('code')
    .notEmpty()
    .withMessage('Verification code is required')
    .trim()
    .isLength({ min: 5, max: 5 })
    .withMessage('Verification code must be 5 digits')
    .isNumeric()
    .withMessage('Verification code must be numeric'),
  validate,
];

// Web register validation
const validateWebRegister = [
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim(),
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .trim()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  validate,
];

module.exports = {
  validateBotLoginStart,
  validateBotVerify,
  validateBotRegister,
  validateWebLoginStart,
  validateWebVerify,
  validateWebRegister,
};

