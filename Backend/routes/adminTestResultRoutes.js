const express = require('express');
const router = express.Router();
const {
  getTestResults,
  getTestResult,
  getTestResultsByCandidate,
  getTestResultsByMaterial,
  getTestResultsByVacancy,
} = require('../controllers/adminTestResultController');
const { protect } = require('../middleware/auth');

// All routes require admin authentication
router.use(protect);

// Routes
router.get('/', getTestResults);
router.get('/candidate/:candidateId', getTestResultsByCandidate);
router.get('/material/:materialId', getTestResultsByMaterial);
router.get('/vacancy/:vacancyId', getTestResultsByVacancy);
router.get('/:id', getTestResult);

module.exports = router;

