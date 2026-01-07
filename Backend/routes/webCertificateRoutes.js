const express = require('express');
const router = express.Router();
const {
  getMyCertificates,
  getMyCertificate,
  downloadCertificate,
} = require('../controllers/webCertificateController');
const { protect } = require('../middleware/candidateAuth');

// All routes require candidate authentication
router.use(protect);

// Routes
router.get('/', getMyCertificates);
router.get('/:id', getMyCertificate);
router.get('/:id/download', downloadCertificate);

module.exports = router;

