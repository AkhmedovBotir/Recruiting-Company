const fs = require('fs');
const path = require('path');

/**
 * Persistent file-based storage for user registration data
 * Data is saved to JSON file and persists across bot restarts
 */
class UserStorage {
  constructor() {
    this.storagePath = path.join(__dirname, 'users.json');
    this.data = new Map();
    this.load();
  }

  /**
   * Load data from file
   */
  load() {
    try {
      if (fs.existsSync(this.storagePath)) {
        const fileData = fs.readFileSync(this.storagePath, 'utf8').trim();
        
        // Check if file is empty or invalid JSON
        if (!fileData || fileData === '') {
          console.log('📝 Storage file is empty, starting fresh');
          this.data = new Map();
          return;
        }
        
        const parsed = JSON.parse(fileData);
        
        // Validate parsed data is an object
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          console.log('⚠️ Invalid storage format, resetting to empty');
          this.data = new Map();
          // Reset file to valid empty JSON
          this.save();
          return;
        }
        
        this.data = new Map(Object.entries(parsed).map(([key, value]) => [parseInt(key), value]));
        console.log(`✅ Loaded ${this.data.size} user(s) from storage`);
      } else {
        console.log('📝 No existing storage file found, starting fresh');
        this.data = new Map();
      }
    } catch (error) {
      console.error('❌ Error loading storage:', error.message);
      console.log('🔄 Resetting storage file...');
      this.data = new Map();
      // Reset file to valid empty JSON
      try {
        fs.writeFileSync(this.storagePath, '{}', 'utf8');
      } catch (writeError) {
        console.error('❌ Error resetting storage file:', writeError.message);
      }
    }
  }

  /**
   * Save data to file
   */
  save() {
    try {
      const dataObj = Object.fromEntries(this.data);
      const jsonData = JSON.stringify(dataObj, null, 2);
      
      // Ensure directory exists
      const dir = path.dirname(this.storagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(this.storagePath, jsonData, 'utf8');
    } catch (error) {
      console.error('❌ Error saving storage:', error.message);
    }
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
    this.save();
  }

  /**
   * Delete user data
   * @param {number} userId - Telegram user ID
   */
  delete(userId) {
    this.data.delete(userId);
    this.save();
  }

  /**
   * Initialize user data for login/registration
   * @param {number} userId - Telegram user ID
   * @param {string} telegramId - Telegram ID as string
   * @returns {object} - Initialized user data
   */
  initialize(userId, telegramId) {
    const STATES = require('../constants/states');
    const userData = {
      telegramId,
      step: STATES.WAITING_PHONE,
    };
    this.set(userId, userData);
    return userData;
  }
}

// Singleton instance
module.exports = new UserStorage();

