const { body, validationResult } = require('express-validator');
const { validate } = require('./validator');

// Material creation validation
const validateMaterialCreate = [
  body('title')
    .notEmpty()
    .withMessage('Material title is required')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Material title must be at least 3 characters')
    .isLength({ max: 200 })
    .withMessage('Material title cannot exceed 200 characters'),
  body('videoUrl')
    .notEmpty()
    .withMessage('Video URL is required')
    .trim()
    .matches(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/)
    .withMessage('Please provide a valid YouTube URL'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
  body('vacancy')
    .notEmpty()
    .withMessage('Vacancy is required')
    .isMongoId()
    .withMessage('Invalid vacancy ID'),
  body('company')
    .notEmpty()
    .withMessage('Company is required')
    .isMongoId()
    .withMessage('Invalid company ID'),
  body('tests')
    .isArray({ min: 3 })
    .withMessage('At least 3 tests are required')
    .custom((tests) => {
      if (!Array.isArray(tests) || tests.length < 3) {
        throw new Error('At least 3 tests are required');
      }
      return true;
    }),
  body('tests.*.question')
    .notEmpty()
    .withMessage('Test question is required')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Test question must be at least 5 characters')
    .isLength({ max: 500 })
    .withMessage('Test question cannot exceed 500 characters'),
  body('tests.*.options')
    .isArray({ min: 2, max: 10 })
    .withMessage('Test options must be an array with 2-10 items'),
  body('tests.*.correctAnswer')
    .notEmpty()
    .withMessage('Test correct answer is required')
    .trim(),
  validate,
];

// Material update validation
const validateMaterialUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Material title must be at least 3 characters')
    .isLength({ max: 200 })
    .withMessage('Material title cannot exceed 200 characters'),
  body('videoUrl')
    .optional()
    .trim()
    .matches(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/)
    .withMessage('Please provide a valid YouTube URL'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
  body('vacancy')
    .optional()
    .isMongoId()
    .withMessage('Invalid vacancy ID'),
  body('company')
    .optional()
    .isMongoId()
    .withMessage('Invalid company ID'),
  body('tests')
    .optional()
    .isArray({ min: 3 })
    .withMessage('At least 3 tests are required')
    .custom((tests) => {
      if (Array.isArray(tests) && tests.length < 3) {
        throw new Error('At least 3 tests are required');
      }
      return true;
    }),
  body('tests.*.question')
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage('Test question must be at least 5 characters')
    .isLength({ max: 500 })
    .withMessage('Test question cannot exceed 500 characters'),
  body('tests.*.options')
    .optional()
    .isArray({ min: 2, max: 10 })
    .withMessage('Test options must be an array with 2-10 items'),
  body('tests.*.correctAnswer')
    .optional()
    .trim(),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  validate,
];

module.exports = {
  validateMaterialCreate,
  validateMaterialUpdate,
};


