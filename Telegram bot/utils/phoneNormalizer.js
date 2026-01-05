/**
 * Normalize phone number to +998XXXXXXXXX format
 * @param {string} phone - Phone number in various formats
 * @returns {string} - Normalized phone number
 */
function normalizePhone(phone) {
  if (!phone) return phone;
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 998, add +
  if (cleaned.startsWith('998')) {
    return '+' + cleaned;
  }
  
  // If starts with 9 (Uzbekistan mobile), add +998
  if (cleaned.startsWith('9') && cleaned.length === 9) {
    return '+998' + cleaned;
  }
  
  // If already has country code
  if (cleaned.length >= 12) {
    return '+' + cleaned;
  }
  
  return phone; // Return as is if can't normalize
}

module.exports = {
  normalizePhone,
};

