const { body, validationResult } = require('express-validator');
const { validate } = require('./validator');

// Web app authentication validation
const validateWebAppAuth = [
  body('initData')
    .notEmpty()
    .withMessage('initData is required')
    .isString()
    .withMessage('initData must be a string'),
  validate,
];

module.exports = {
  validateWebAppAuth,
};

