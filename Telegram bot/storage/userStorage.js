/**
 * In-memory storage for user registration data
 * In production, consider using Redis or database
 */
class UserStorage {
  constructor() {
    this.data = new Map();
  }

  /**
   * Get user data by user ID
   * @param {number} userId - Telegram user ID
   * @returns {object|null} - User data or null
   */
  get(userId) {
    return this.data.get(userId) || null;
  }

  /**
   * Set user data
   * @param {number} userId - Telegram user ID
   * @param {object} data - User data
   */
  set(userId, data) {
    this.data.set(userId, data);
  }

  /**
   * Delete user data
   * @param {number} userId - Telegram user ID
   */
  delete(userId) {
    this.data.delete(userId);
  }

  /**
   * Initialize user data for registration
   * @param {number} userId - Telegram user ID
   * @param {string} telegramId - Telegram ID as string
   * @returns {object} - Initialized user data
   */
  initialize(userId, telegramId) {
    const STATES = require('../constants/states');
    const userData = {
      telegramId,
      step: STATES.WAITING_FIRST_NAME,
    };
    this.set(userId, userData);
    return userData;
  }
}

// Singleton instance
module.exports = new UserStorage();

