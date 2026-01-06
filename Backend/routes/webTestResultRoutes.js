const express = require('express');
const router = express.Router();
const {
  getMyTestResults,
  getTestResult,
  getTestResultsByMaterial,
} = require('../controllers/webTestResultController');
const { protect } = require('../middleware/candidateAuth');

// All routes require candidate authentication
router.use(protect);

// Routes
router.get('/', getMyTestResults);
router.get('/material/:materialId', getTestResultsByMaterial);
router.get('/:id', getTestResult);

module.exports = router;

