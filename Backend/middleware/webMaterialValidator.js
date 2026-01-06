const { body, validationResult } = require('express-validator');
const { validate } = require('./validator');

// Submit test validation
const validateSubmitTest = [
  body('answers')
    .isArray({ min: 1 })
    .withMessage('Answers must be an array')
    .custom((answers) => {
      if (!Array.isArray(answers)) {
        throw new Error('Answers must be an array');
      }
      return true;
    }),
  body('answers.*')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Each answer must be at least 1 character'),
  validate,
];

module.exports = {
  validateSubmitTest,
};


