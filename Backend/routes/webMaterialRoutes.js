const express = require('express');
const router = express.Router();
const {
  getMaterials,
  getMaterial,
  submitTest,
  getTestResults,
} = require('../controllers/webMaterialController');
const { validateSubmitTest } = require('../middleware/webMaterialValidator');
const { protect } = require('../middleware/candidateAuth');

// All routes require candidate authentication
router.use(protect);

// Routes
router.get('/', getMaterials);
router.get('/:id', getMaterial);
router.post('/:id/submit-test', validateSubmitTest, submitTest);
router.get('/:id/results', getTestResults);

module.exports = router;


