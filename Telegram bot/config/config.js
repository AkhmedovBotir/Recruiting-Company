require('dotenv').config();

module.exports = {
  bot: {
    token: process.env.BOT_TOKEN,
  },
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    registrationBaseUrl: process.env.API_REGISTRATION_BASE_URL || 'http://localhost:3000/api/candidates/bot',
    botBaseUrl: process.env.API_BOT_BASE_URL || 'http://localhost:3000/api/bot',
  },
  webApp: {
    url: process.env.WEB_APP_URL || 'http://localhost:3001',
  },
};

