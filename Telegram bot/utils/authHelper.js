const userStorage = require('../storage/userStorage');
const STATES = require('../constants/states');
const MESSAGES = require('../constants/messages');
const { Markup } = require('telegraf');

/**
 * Handle 401 Unauthorized error - clear token and request re-login
 * @param {number} userId - Telegram user ID
 * @param {object} ctx - Telegraf context
 * @returns {boolean} - True if handled, false otherwise
 */
async function handle401Error(userId, ctx) {
  const data = userStorage.get(userId);
  if (data) {
    // Clear token and reset state
    delete data.token;
    delete data.candidateId;
    data.step = STATES.WAITING_PHONE;
    userStorage.set(userId, data);
  }
  
  await ctx.reply(
    '🔒 Sizning sessiyangiz muddati tugagan. Qayta kirish talab qilinadi.',
    Markup.removeKeyboard()
  );
  
  // Start login flow
  await ctx.reply(
    MESSAGES.LOGIN_START(ctx.from.first_name || 'Foydalanuvchi'),
    Markup.keyboard([
      [Markup.button.contactRequest('📱 Telefon raqamni yuborish')]
    ]).resize()
  );
  return true;
}

/**
 * Check if result has 401 error and handle it
 * @param {object} result - API result
 * @param {number} userId - Telegram user ID
 * @param {object} ctx - Telegraf context
 * @returns {boolean} - True if 401 was handled, false otherwise
 */
async function checkAndHandle401(result, userId, ctx) {
  if (!result.success && result.status === 401) {
    return await handle401Error(userId, ctx);
  }
  return false;
}

module.exports = {
  handle401Error,
  checkAndHandle401,
};

