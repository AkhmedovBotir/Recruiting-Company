const { body, validationResult } = require('express-validator');
const { validate } = require('./validator');

// Apply to vacancy validation
const validateApplyToVacancy = [
  body('vacancyId')
    .notEmpty()
    .withMessage('Vacancy ID is required')
    .isMongoId()
    .withMessage('Invalid vacancy ID'),
  validate,
];

module.exports = {
  validateApplyToVacancy,
};

