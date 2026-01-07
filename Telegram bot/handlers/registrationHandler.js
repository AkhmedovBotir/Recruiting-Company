const { Markup } = require('telegraf');
const userStorage = require('../storage/userStorage');
const apiService = require('../services/apiService');
const phoneNormalizer = require('../utils/phoneNormalizer');
const validator = require('../utils/validator');
const STATES = require('../constants/states');
const MESSAGES = require('../constants/messages');
const mainMenuHandler = require('./mainMenuHandler');

/**
 * Handle /start command
 */
async function handleStart(ctx) {
  const userId = ctx.from.id;
  const telegramId = String(ctx.from.id);
  const data = userStorage.get(userId);
  
  // If user is already registered, show main menu
  if (data && data.token && data.step === STATES.COMPLETED) {
    await mainMenuHandler.showMainMenu(ctx);
    return;
  }
  
  // Otherwise, start login flow
  userStorage.initialize(userId, telegramId);
  
  await ctx.reply(
    MESSAGES.LOGIN_START(ctx.from.first_name || 'Foydalanuvchi'),
    Markup.keyboard([
      [Markup.button.contactRequest('📱 Telefon raqamni yuborish')]
    ]).resize()
  );
}

/**
 * Handle /register command (same as /start)
 */
async function handleRegister(ctx) {
  await handleStart(ctx);
}

/**
 * Handle text messages during registration
 */
async function handleText(ctx) {
  const userId = ctx.from.id;
  const data = userStorage.get(userId);
  
  if (!data) {
    await ctx.reply(MESSAGES.ERRORS.NEED_START);
    return;
  }
  
  const text = ctx.message.text.trim();
  
  switch (data.step) {
    case STATES.WAITING_CODE:
      await handleCode(ctx, data, text);
      break;
      
    case STATES.WAITING_FIRST_NAME:
      await handleFirstName(ctx, data, text);
      break;
      
    case STATES.WAITING_LAST_NAME:
      await handleLastName(ctx, data, text);
      break;
      
    default:
      await ctx.reply(MESSAGES.ERRORS.NEED_START);
  }
}

/**
 * Handle first name input
 */
async function handleFirstName(ctx, data, text) {
  if (!validator.validateName(text)) {
    await ctx.reply(MESSAGES.ERRORS.INVALID_FIRST_NAME);
    return;
  }
  
  data.firstName = text;
  data.step = STATES.WAITING_LAST_NAME;
  userStorage.set(ctx.from.id, data);
  
  await ctx.reply(MESSAGES.FIRST_NAME_CONFIRMED(text));
}

/**
 * Handle last name input
 */
async function handleLastName(ctx, data, text) {
  if (!validator.validateName(text)) {
    await ctx.reply(MESSAGES.ERRORS.INVALID_LAST_NAME);
    return;
  }
  
  data.lastName = text;
  userStorage.set(ctx.from.id, data);
  
  await ctx.reply(MESSAGES.LAST_NAME_CONFIRMED(text));
  await ctx.reply(MESSAGES.REGISTERING);
  
  // Register the user
  const registerResult = await apiService.register(data);
  
  if (registerResult.success) {
    const responseData = registerResult.data.data || registerResult.data;
    const token = responseData.token;
    const candidate = responseData.candidate;
    
    // Store token and candidate ID
    data.token = token;
    data.candidateId = candidate.id;
    data.step = STATES.COMPLETED;
    userStorage.set(ctx.from.id, data);
    
    await ctx.reply(
      MESSAGES.REGISTRATION_SUCCESS(candidate),
      Markup.removeKeyboard()
    );
    
    // Show main menu after successful registration
    await mainMenuHandler.showMainMenu(ctx);
  } else {
    const errorMessage = registerResult.message || 'Xatolik yuz berdi';
    const errors = registerResult.errors;
    
    await ctx.reply(
      MESSAGES.ERRORS.REGISTER_ERROR(errorMessage, errors),
      Markup.removeKeyboard()
    );
    
    // Reset to first name step
    data.step = STATES.WAITING_FIRST_NAME;
    userStorage.set(ctx.from.id, data);
  }
}

/**
 * Handle verification code input
 */
async function handleCode(ctx, data, text) {
  if (!validator.validateCode(text)) {
    await ctx.reply(MESSAGES.ERRORS.INVALID_CODE);
    return;
  }
  
  await ctx.reply(MESSAGES.ERRORS.CODE_VERIFYING);
  
  const verifyResult = await apiService.verifyCode(data.phone, text);
  
  if (verifyResult.success) {
    const responseData = verifyResult.data.data || verifyResult.data;
    const exists = responseData.exists;
    
    if (exists && responseData.token) {
      // User exists - login successful
      const token = responseData.token;
      const candidate = responseData.candidate;
      
      // Store token and candidate ID
      data.token = token;
      data.candidateId = candidate.id;
      data.step = STATES.COMPLETED;
      userStorage.set(ctx.from.id, data);
      
      await ctx.reply(
        MESSAGES.LOGIN_SUCCESS(),
        Markup.removeKeyboard()
      );
      
      // Show main menu after successful login
      await mainMenuHandler.showMainMenu(ctx);
    } else {
      // User doesn't exist - need registration
      data.step = STATES.WAITING_FIRST_NAME;
      userStorage.set(ctx.from.id, data);
      
      await ctx.reply(
        MESSAGES.REGISTRATION_REQUIRED,
        Markup.removeKeyboard()
      );
    }
  } else {
    const errorMessage = verifyResult.message || 'Xatolik yuz berdi';
    await ctx.reply(MESSAGES.ERRORS.API_ERROR(errorMessage));
  }
}

/**
 * Handle contact (phone number from Telegram button)
 */
async function handleContact(ctx) {
  const userId = ctx.from.id;
  const data = userStorage.get(userId);
  
  if (!data || data.step !== STATES.WAITING_PHONE) {
    await ctx.reply(MESSAGES.ERRORS.NEED_START_FOR_CONTACT);
    return;
  }
  
  const phone = ctx.message.contact.phone_number;
  await processPhoneNumber(ctx, data, phone);
}

/**
 * Handle phone number as text (manual input)
 */
async function handlePhoneText(ctx) {
  const userId = ctx.from.id;
  const data = userStorage.get(userId);
  
  if (!data || data.step !== STATES.WAITING_PHONE) {
    return; // Let other handlers deal with it
  }
  
  const phone = ctx.message.text.trim();
  await processPhoneNumber(ctx, data, phone);
}

/**
 * Process phone number and send SMS code
 */
async function processPhoneNumber(ctx, data, phone) {
  const normalizedPhone = phoneNormalizer.normalizePhone(phone);
  
  data.phone = normalizedPhone;
  data.step = STATES.WAITING_CODE;
  userStorage.set(ctx.from.id, data);
  
  await ctx.reply(
    MESSAGES.PHONE_CONFIRMED(normalizedPhone),
    Markup.removeKeyboard()
  );
  
  const loginResult = await apiService.loginStart(normalizedPhone);
  
  if (loginResult.success) {
    const responseData = loginResult.data.data || loginResult.data;
    const expiresIn = responseData.expiresIn || 300;
    const expiresInMinutes = Math.floor(expiresIn / 60);
    
    await ctx.reply(MESSAGES.CODE_SENT(normalizedPhone, expiresInMinutes));
  } else {
    const errorMessage = loginResult.message || 'Xatolik yuz berdi';
    const errors = loginResult.errors;
    
    await ctx.reply(
      MESSAGES.ERRORS.LOGIN_ERROR(errorMessage, errors),
      Markup.removeKeyboard()
    );
    
    // Reset to phone step
    data.step = STATES.WAITING_PHONE;
    userStorage.set(ctx.from.id, data);
  }
}

module.exports = {
  handleStart,
  handleRegister,
  handleText,
  handleContact,
  handlePhoneText,
};

