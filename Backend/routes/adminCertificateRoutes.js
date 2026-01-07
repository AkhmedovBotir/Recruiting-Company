const express = require('express');
const router = express.Router();
const {
  getCandidatesEligibleForCertificate,
  issueCertificate,
  getCertificates,
  getCertificate,
  revokeCertificate,
  getCertificateForFrontend,
  getCertificateImage,
  saveCertificateBase64,
} = require('../controllers/adminCertificateController');
const { protect } = require('../middleware/auth');

// All routes require admin authentication
router.use(protect);

// Routes
router.get('/candidates-eligible', getCandidatesEligibleForCertificate);
router.get('/image', getCertificateImage);
router.get('/:id/for-frontend', getCertificateForFrontend);
router.get('/', getCertificates);
router.get('/:id', getCertificate);
router.post('/', issueCertificate);
router.patch('/:id/revoke', revokeCertificate);
router.put('/:id/save-certificate', saveCertificateBase64);

module.exports = router;

