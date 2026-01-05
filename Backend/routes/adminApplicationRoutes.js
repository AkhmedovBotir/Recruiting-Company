const express = require('express');
const router = express.Router();
const {
  getApplications,
  getApplication,
  acceptInterview,
  markInterviewPassed,
  markInterviewFailed,
  updateApplicationStatus,
} = require('../controllers/adminApplicationController');
const {
  validateUpdateStatus,
  validateInterviewNotes,
} = require('../middleware/adminApplicationValidator');
const { protect } = require('../middleware/auth');

// All routes require admin authentication
router.use(protect);

// Routes
router.get('/', getApplications);
router.get('/:id', getApplication);
router.patch('/:id/interview', validateInterviewNotes, acceptInterview);
router.patch('/:id/passed', validateInterviewNotes, markInterviewPassed);
router.patch('/:id/failed', validateInterviewNotes, markInterviewFailed);
router.patch('/:id/status', validateUpdateStatus, updateApplicationStatus);

module.exports = router;

