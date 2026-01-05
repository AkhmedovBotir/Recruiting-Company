const { Telegraf } = require('telegraf');
const config = require('./config/config');
const registrationHandler = require('./handlers/registrationHandler');
const validator = require('./utils/validator');

// Initialize bot
const bot = new Telegraf(config.bot.token);

// Validate bot token
if (!config.bot.token) {
  console.error('❌ BOT_TOKEN environment variable is required!');
  process.exit(1);
}

// Register command handlers
bot.start(registrationHandler.handleStart);
bot.command('register', registrationHandler.handleRegister);

// Handle text messages
bot.on('text', async (ctx) => {
  // Check if it's a phone number pattern (for manual phone input)
  const text = ctx.message.text.trim();
  if (validator.validatePhone(text)) {
    await registrationHandler.handlePhoneText(ctx);
    return;
  }
  
  // Handle other text messages (name, code, etc.)
  await registrationHandler.handleText(ctx);
});

// Handle contact (phone number from button)
bot.on('contact', registrationHandler.handleContact);

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  const MESSAGES = require('./constants/messages');
  ctx.reply(MESSAGES.ERRORS.BOT_ERROR).catch(console.error);
});

// Launch bot
function startBot() {
  console.log('🤖 Bot ishga tushmoqda...');
  
  bot.launch()
    .then(() => {
      console.log('✅ Bot muvaffaqiyatli ishga tushdi!');
    })
    .catch((err) => {
      console.error('❌ Bot ishga tushirishda xatolik:', err);
      process.exit(1);
    });
}

// Graceful stop
function stopBot() {
  bot.stop('SIGTERM');
  console.log('🛑 Bot to\'xtatildi');
}

process.once('SIGINT', () => {
  stopBot();
  process.exit(0);
});

process.once('SIGTERM', () => {
  stopBot();
  process.exit(0);
});

// Start the bot
startBot();

module.exports = bot;
