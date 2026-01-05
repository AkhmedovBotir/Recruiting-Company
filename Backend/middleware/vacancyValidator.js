const { body, validationResult } = require('express-validator');
const { validate } = require('./validator');

// Vacancy creation validation rules
const validateVacancyCreate = [
  body('company')
    .notEmpty()
    .withMessage('Company is required')
    .isMongoId()
    .withMessage('Invalid company ID'),
  body('title')
    .notEmpty()
    .withMessage('Vacancy title is required')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Vacancy title must be at least 3 characters')
    .isLength({ max: 200 })
    .withMessage('Vacancy title cannot exceed 200 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department name cannot exceed 100 characters'),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Position name cannot exceed 100 characters'),
  body('experience')
    .notEmpty()
    .withMessage('Experience is required')
    .trim(),
  body('workType')
    .notEmpty()
    .withMessage('Work type is required')
    .isIn(['fulltime', 'parttime'])
    .withMessage('Work type must be either "fulltime" or "parttime"'),
  body('minAge')
    .notEmpty()
    .withMessage('Minimum age is required')
    .isInt({ min: 18, max: 100 })
    .withMessage('Minimum age must be between 18 and 100'),
  body('maxAge')
    .notEmpty()
    .withMessage('Maximum age is required')
    .isInt({ min: 18, max: 100 })
    .withMessage('Maximum age must be between 18 and 100'),
  body('salary')
    .notEmpty()
    .withMessage('Salary is required')
    .trim(),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .trim(),
  body('responsibilities')
    .notEmpty()
    .withMessage('Responsibilities is required')
    .trim(),
  body('preferences')
    .notEmpty()
    .withMessage('Preferences is required')
    .trim(),
  body('skills')
    .isArray({ min: 1 })
    .withMessage('At least one skill is required')
    .custom((value) => {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error('Skills must be a non-empty array');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(['active', 'close'])
    .withMessage('Status must be either "active" or "close"'),
  validate,
];

// Vacancy update validation rules
const validateVacancyUpdate = [
  body('company')
    .optional()
    .isMongoId()
    .withMessage('Invalid company ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Vacancy title must be at least 3 characters')
    .isLength({ max: 200 })
    .withMessage('Vacancy title cannot exceed 200 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department name cannot exceed 100 characters'),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Position name cannot exceed 100 characters'),
  body('experience')
    .optional()
    .trim(),
  body('workType')
    .optional()
    .isIn(['fulltime', 'parttime'])
    .withMessage('Work type must be either "fulltime" or "parttime"'),
  body('minAge')
    .optional()
    .isInt({ min: 18, max: 100 })
    .withMessage('Minimum age must be between 18 and 100'),
  body('maxAge')
    .optional()
    .isInt({ min: 18, max: 100 })
    .withMessage('Maximum age must be between 18 and 100'),
  body('salary')
    .optional()
    .trim(),
  body('description')
    .optional()
    .trim(),
  body('responsibilities')
    .optional()
    .trim(),
  body('preferences')
    .optional()
    .trim(),
  body('skills')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one skill is required')
    .custom((value) => {
      if (Array.isArray(value) && value.length === 0) {
        throw new Error('Skills must be a non-empty array');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(['active', 'close'])
    .withMessage('Status must be either "active" or "close"'),
  validate,
];

module.exports = {
  validateVacancyCreate,
  validateVacancyUpdate,
};

