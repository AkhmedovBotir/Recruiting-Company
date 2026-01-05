// In-memory store for verification codes
// In production, consider using Redis or similar
const codeStore = new Map();

// Store verification code
const storeCode = (phone, code, expiresIn = 5 * 60 * 1000) => {
  // Clean expired codes
  const now = Date.now();
  for (const [key, value] of codeStore.entries()) {
    if (value.expiresAt < now) {
      codeStore.delete(key);
    }
  }

  const expiresAt = Date.now() + expiresIn;
  codeStore.set(phone, {
    code,
    expiresAt,
    attempts: 0,
  });

  // Auto delete after expiration
  setTimeout(() => {
    codeStore.delete(phone);
  }, expiresIn);
};

// Verify code
const verifyCode = (phone, code) => {
  const stored = codeStore.get(phone);

  if (!stored) {
    return { valid: false, message: 'Code not found or expired' };
  }

  if (Date.now() > stored.expiresAt) {
    codeStore.delete(phone);
    return { valid: false, message: 'Code expired' };
  }

  if (stored.attempts >= 5) {
    codeStore.delete(phone);
    return { valid: false, message: 'Too many attempts' };
  }

  stored.attempts += 1;

  if (stored.code !== code) {
    return { valid: false, message: 'Invalid code' };
  }

  // Code is valid, delete it
  codeStore.delete(phone);
  return { valid: true };
};

// Get stored code info
const getCodeInfo = (phone) => {
  return codeStore.get(phone);
};

// Delete code
const deleteCode = (phone) => {
  codeStore.delete(phone);
};

module.exports = {
  storeCode,
  verifyCode,
  getCodeInfo,
  deleteCode,
};

