const { body, validationResult } = require('express-validator');
const { validate } = require('./validator');

// Apply to vacancy validation
const validateApplyToVacancy = [
  body('vacancyId')
    .notEmpty()
    .withMessage('Vacancy ID is required')
    .isMongoId()
    .withMessage('Invalid vacancy ID'),
  body('answers')
    .optional()
    .isArray()
    .withMessage('Answers must be an array'),
  body('answers.*.questionId')
    .optional()
    .isMongoId()
    .withMessage('Invalid question ID'),
  body('answers.*.answer')
    .optional()
    .custom((value) => value !== undefined)
    .withMessage('Answer is required for provided question'),
  validate,
];

module.exports = {
  validateApplyToVacancy,
};

