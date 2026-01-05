const { body, validationResult } = require('express-validator');
const { validate } = require('./validator');

// Company creation validation rules
const validateCompanyCreate = [
  body('name')
    .notEmpty()
    .withMessage('Company name is required')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Company name must be at least 2 characters')
    .isLength({ max: 200 })
    .withMessage('Company name cannot exceed 200 characters'),
  body('inn')
    .notEmpty()
    .withMessage('INN is required')
    .trim()
    .matches(/^\d{9}$|^\d{12}$/)
    .withMessage('INN must be 9 or 12 digits'),
  body('ownerFullName')
    .notEmpty()
    .withMessage('Owner full name is required')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Owner full name must be at least 3 characters')
    .isLength({ max: 100 })
    .withMessage('Owner full name cannot exceed 100 characters'),
  body('ownerPhone')
    .notEmpty()
    .withMessage('Owner phone number is required')
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid owner phone number'),
  body('companyPhone')
    .notEmpty()
    .withMessage('Company phone number is required')
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid company phone number'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either "active" or "inactive"'),
  validate,
];

// Company update validation rules
const validateCompanyUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Company name must be at least 2 characters')
    .isLength({ max: 200 })
    .withMessage('Company name cannot exceed 200 characters'),
  body('inn')
    .optional()
    .trim()
    .matches(/^\d{9}$|^\d{12}$/)
    .withMessage('INN must be 9 or 12 digits'),
  body('ownerFullName')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Owner full name must be at least 3 characters')
    .isLength({ max: 100 })
    .withMessage('Owner full name cannot exceed 100 characters'),
  body('ownerPhone')
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid owner phone number'),
  body('companyPhone')
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid company phone number'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either "active" or "inactive"'),
  validate,
];

module.exports = {
  validateCompanyCreate,
  validateCompanyUpdate,
};

