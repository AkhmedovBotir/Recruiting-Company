const { body, validationResult } = require('express-validator');
const { validate } = require('./validator');

// Update application status validation
const validateUpdateStatus = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'reviewed', 'interview', 'passed', 'failed', 'accepted', 'rejected'])
    .withMessage('Invalid status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  validate,
];

// Interview notes validation
const validateInterviewNotes = [
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  validate,
];

module.exports = {
  validateUpdateStatus,
  validateInterviewNotes,
};

