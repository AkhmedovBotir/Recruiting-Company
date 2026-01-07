const express = require('express');
const router = express.Router();
const {
  botLoginStart,
  botVerify,
  botRegister,
  webLoginStart,
  webVerify,
  webRegister,
} = require('../controllers/candidateController');
const {
  validateBotLoginStart,
  validateBotVerify,
  validateBotRegister,
  validateWebLoginStart,
  validateWebVerify,
  validateWebRegister,
} = require('../middleware/candidateValidator');

// Bot routes
router.post('/bot/login-start', validateBotLoginStart, botLoginStart);
router.post('/bot/verify', validateBotVerify, botVerify);
router.post('/bot/register', validateBotRegister, botRegister);

// Web routes
router.post('/web/login-start', validateWebLoginStart, webLoginStart);
router.post('/web/verify', validateWebVerify, webVerify);
router.post('/web/register', validateWebRegister, webRegister);

module.exports = router;

