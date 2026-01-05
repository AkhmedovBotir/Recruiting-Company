const express = require('express');
const router = express.Router();
const { getVacancies, getVacancy } = require('../controllers/webVacancyController');

// Public routes (no authentication required)
router.get('/', getVacancies);
router.get('/:id', getVacancy);

module.exports = router;

