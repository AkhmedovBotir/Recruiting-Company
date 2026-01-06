const express = require('express');
const router = express.Router();
const {
  getMyInterviews,
  getInterview,
} = require('../controllers/webInterviewController');
const { protect } = require('../middleware/candidateAuth');

// All routes require candidate authentication
router.use(protect);

// Routes
router.get('/', getMyInterviews);
router.get('/:id', getInterview);

module.exports = router;

