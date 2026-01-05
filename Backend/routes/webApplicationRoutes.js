const express = require('express');
const router = express.Router();
const {
  applyToVacancy,
  getMyApplications,
  getApplication,
} = require('../controllers/applicationController');
const { validateApplyToVacancy } = require('../middleware/applicationValidator');
const { protect } = require('../middleware/candidateAuth');

// All routes require candidate authentication
router.use(protect);

// Routes
router.get('/', getMyApplications);
router.get('/:id', getApplication);
router.post('/', validateApplyToVacancy, applyToVacancy);

module.exports = router;

