require('dotenv').config();

module.exports = {
  bot: {
    token: process.env.BOT_TOKEN,
  },
  api: {
    baseUrl: process.env.API_BASE_URL,
  },
};

