const express = require('express');
const router = express.Router();
const { verifyCertificate } = require('../controllers/adminCertificateController');

// Public route for QR code verification
router.get('/verify/:qrCode', verifyCertificate);

module.exports = router;

