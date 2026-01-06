const { body, validationResult } = require('express-validator');
const { validate } = require('./validator');

// Save vacancy validation
const validateSaveVacancy = [
  body('vacancyId')
    .notEmpty()
    .withMessage('Vacancy ID is required')
    .isMongoId()
    .withMessage('Invalid vacancy ID'),
  validate,
];

module.exports = {
  validateSaveVacancy,
};


