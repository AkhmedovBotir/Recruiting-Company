const { body, validationResult } = require('express-validator');
const { validate } = require('./validator');

// Schedule interview validation
const validateScheduleInterview = [
  body('candidateId')
    .notEmpty()
    .withMessage('Candidate ID is required')
    .isMongoId()
    .withMessage('Invalid candidate ID'),
  body('vacancyId')
    .notEmpty()
    .withMessage('Vacancy ID is required')
    .isMongoId()
    .withMessage('Invalid vacancy ID'),
  body('content')
    .notEmpty()
    .withMessage('Interview content is required')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters')
    .isLength({ max: 5000 })
    .withMessage('Content cannot exceed 5000 characters'),
  body('interviewer')
    .notEmpty()
    .withMessage('Interviewer name is required')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Interviewer name must be at least 2 characters')
    .isLength({ max: 200 })
    .withMessage('Interviewer name cannot exceed 200 characters'),
  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Location must be at least 2 characters')
    .isLength({ max: 500 })
    .withMessage('Location cannot exceed 500 characters'),
  body('date')
    .notEmpty()
    .withMessage('Interview date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('time')
    .notEmpty()
    .withMessage('Interview time is required')
    .trim()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:MM format'),
  validate,
];

// Update interview validation
const validateUpdateInterview = [
  body('content')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters')
    .isLength({ max: 5000 })
    .withMessage('Content cannot exceed 5000 characters'),
  body('interviewer')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Interviewer name must be at least 2 characters')
    .isLength({ max: 200 })
    .withMessage('Interviewer name cannot exceed 200 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Location must be at least 2 characters')
    .isLength({ max: 500 })
    .withMessage('Location cannot exceed 500 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('time')
    .optional()
    .trim()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:MM format'),
  body('status')
    .optional()
    .isIn(['scheduled', 'completed', 'cancelled'])
    .withMessage('Status must be one of: scheduled, completed, cancelled'),
  validate,
];

// Complete interview validation
const validateCompleteInterview = [
  body('result')
    .notEmpty()
    .withMessage('Result is required')
    .isIn(['passed', 'failed'])
    .withMessage('Result must be either "passed" or "failed"'),
  validate,
];

// Add evaluation validation
const validateAddEvaluation = [
  body('text')
    .notEmpty()
    .withMessage('Evaluation text is required')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Evaluation text must be at least 10 characters')
    .isLength({ max: 2000 })
    .withMessage('Evaluation text cannot exceed 2000 characters'),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 10 })
    .withMessage('Rating must be between 1 and 10'),
  validate,
];

// Update evaluation validation
const validateUpdateEvaluation = [
  body('text')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Evaluation text must be at least 10 characters')
    .isLength({ max: 2000 })
    .withMessage('Evaluation text cannot exceed 2000 characters'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Rating must be between 1 and 10'),
  validate,
];

module.exports = {
  validateScheduleInterview,
  validateUpdateInterview,
  validateCompleteInterview,
  validateAddEvaluation,
  validateUpdateEvaluation,
};

