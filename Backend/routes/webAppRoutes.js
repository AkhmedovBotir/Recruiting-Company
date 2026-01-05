const express = require('express');
const router = express.Router();
const { authenticateWebApp } = require('../controllers/webAppController');
const { validateWebAppAuth } = require('../middleware/webAppValidator');

// Public route (no authentication required)
router.post('/auth', validateWebAppAuth, authenticateWebApp);

module.exports = router;

