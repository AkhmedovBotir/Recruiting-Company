const express = require('express');
const router = express.Router();
const {
  getCandidatesReadyForInterview,
  getInterviews,
  getInterview,
  scheduleInterview,
  updateInterview,
  completeInterview,
  addEvaluation,
  updateEvaluation,
  cancelInterview,
} = require('../controllers/adminInterviewController');
const {
  validateScheduleInterview,
  validateUpdateInterview,
  validateCompleteInterview,
  validateAddEvaluation,
  validateUpdateEvaluation,
} = require('../middleware/interviewValidator');
const { protect } = require('../middleware/auth');

// All routes require admin authentication
router.use(protect);

// Routes
router.get('/candidates-ready', getCandidatesReadyForInterview);
router.get('/', getInterviews);
router.get('/:id', getInterview);
router.post('/', validateScheduleInterview, scheduleInterview);
router.put('/:id', validateUpdateInterview, updateInterview);
router.patch('/:id/complete', validateCompleteInterview, completeInterview);
router.patch('/:id/cancel', cancelInterview);
router.post('/:id/evaluations', validateAddEvaluation, addEvaluation);
router.put('/:id/evaluations/:evaluationId', validateUpdateEvaluation, updateEvaluation);

module.exports = router;

