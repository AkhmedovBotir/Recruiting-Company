const express = require('express');
const router = express.Router();
const { loginAdmin, getMe } = require('../controllers/adminController');
const { validateAdminLogin } = require('../middleware/validator');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/login', validateAdminLogin, loginAdmin);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;

