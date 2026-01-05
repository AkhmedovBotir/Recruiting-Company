const express = require('express');
const router = express.Router();
const {
  botRegisterStart,
  botVerify,
  webLoginStart,
  webVerify,
  webRegister,
} = require('../controllers/candidateController');
const {
  validateBotRegisterStart,
  validateBotVerify,
  validateWebLoginStart,
  validateWebVerify,
  validateWebRegister,
} = require('../middleware/candidateValidator');

// Bot routes
router.post('/bot/register-start', validateBotRegisterStart, botRegisterStart);
router.post('/bot/verify', validateBotVerify, botVerify);

// Web routes
router.post('/web/login-start', validateWebLoginStart, webLoginStart);
router.post('/web/verify', validateWebVerify, webVerify);
router.post('/web/register', validateWebRegister, webRegister);

module.exports = router;

