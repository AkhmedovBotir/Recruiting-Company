const { Telegraf } = require('telegraf');
const config = require('./config/config');
const registrationHandler = require('./handlers/registrationHandler');
const mainMenuHandler = require('./handlers/mainMenuHandler');
const validator = require('./utils/validator');
const userStorage = require('./storage/userStorage');
const STATES = require('./constants/states');

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
bot.command('menu', mainMenuHandler.showMainMenu);

// Handle callback queries (inline button clicks)
bot.on('callback_query', async (ctx) => {
  try {
    const callbackData = ctx.callbackQuery.data;
    
    // Handle vacancy details
    if (callbackData.startsWith('vacancy_')) {
      const vacancyId = callbackData.replace('vacancy_', '');
      await mainMenuHandler.handleVacancyDetails(ctx, vacancyId);
      return; // answerCbQuery is called inside handleVacancyDetails
    }
    
    // Handle certificate details
    if (callbackData.startsWith('cert_')) {
      const certificateId = callbackData.replace('cert_', '');
      await mainMenuHandler.handleCertificateDetails(ctx, certificateId);
      return; // answerCbQuery is called inside handleCertificateDetails
    }
    
    // Default answer for unknown callbacks
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Callback query error:', error);
    await ctx.answerCbQuery('Xatolik yuz berdi', true).catch(console.error);
  }
});

// Handle text messages
bot.on('text', async (ctx) => {
  const text = ctx.message.text.trim();
  const userId = ctx.from.id;
  const data = userStorage.get(userId);
  
  // Handle main menu commands if user is registered
  if (data && data.token && data.step === STATES.COMPLETED) {
    switch (text) {
      case '📋 Vakansiyalar':
        await mainMenuHandler.handleVacancies(ctx);
        return;
      case '👤 Profilim':
      case '👤 Mening profilim':
        await mainMenuHandler.handleProfile(ctx);
        return;
      case '📝 Topshirishlarim':
      case '📝 Mening topshirishlarim':
        await mainMenuHandler.handleApplications(ctx);
        return;
      case '🎯 Suhbatlarim':
      case '🎯 Mening suhbatlarim':
        await mainMenuHandler.handleInterviews(ctx);
        return;
      case '🏆 Sertifikatlarim':
      case '🏆 Mening sertifikatlarim':
        await mainMenuHandler.handleCertificates(ctx);
        return;
    }
  }
  
  // Check if it's a phone number pattern (for manual phone input)
  if (validator.validatePhone(text)) {
    await registrationHandler.handlePhoneText(ctx);
    return;
  }
  
  // Handle other text messages (name, code, etc.) during registration
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
