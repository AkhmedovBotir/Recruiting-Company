/**
 * Validate first name or last name
 * @param {string} name - Name to validate
 * @returns {boolean} - True if valid
 */
function validateName(name) {
  return name && name.length >= 2 && name.length <= 50;
}

/**
 * Validate verification code (5 digits)
 * @param {string} code - Code to validate
 * @returns {boolean} - True if valid
 */
function validateCode(code) {
  return /^\d{5}$/.test(code);
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
function validatePhone(phone) {
  return /^[\+]?[0-9]{9,15}$/.test(phone);
}

module.exports = {
  validateName,
  validateCode,
  validatePhone,
};

