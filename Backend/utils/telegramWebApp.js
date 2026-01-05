const crypto = require('crypto');

/**
 * Validate Telegram Web App initData
 * @param {string} initData - Telegram initData string
 * @param {string} botToken - Telegram bot token
 * @returns {Object|null} - Parsed user data or null if invalid
 */
const validateTelegramWebApp = (initData, botToken) => {
  try {
    // Parse initData
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    
    if (!hash) {
      return null;
    }

    // Remove hash from params
    params.delete('hash');

    // Sort params and create data check string
    const dataCheckArray = Array.from(params.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, value]) => `${key}=${value}`);

    const dataCheckString = dataCheckArray.join('\n');

    // Create secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Compare hashes
    if (calculatedHash !== hash) {
      return null;
    }

    // Check auth_date (should be within 24 hours)
    const authDate = parseInt(params.get('auth_date'));
    if (!authDate) {
      return null;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeDiff = currentTime - authDate;

    // Allow up to 24 hours (86400 seconds)
    if (timeDiff > 86400 || timeDiff < 0) {
      return null;
    }

    // Parse user data
    const userStr = params.get('user');
    if (!userStr) {
      return null;
    }

    const user = JSON.parse(decodeURIComponent(userStr));

    return {
      id: user.id.toString(),
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      username: user.username || null,
      languageCode: user.language_code || null,
      isBot: user.is_bot || false,
      isPremium: user.is_premium || false,
      photoUrl: user.photo_url || null,
    };
  } catch (error) {
    console.error('Telegram Web App validation error:', error);
    return null;
  }
};

module.exports = {
  validateTelegramWebApp,
};

