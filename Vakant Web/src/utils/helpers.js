export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 998, add +
  if (cleaned.startsWith('998')) {
    return '+' + cleaned;
  }
  
  // If starts with 9, add +998
  if (cleaned.startsWith('9') && cleaned.length === 9) {
    return '+998' + cleaned;
  }
  
  // If already has country code
  if (cleaned.startsWith('998')) {
    return '+' + cleaned;
  }
  
  return phone;
};

export const formatPhoneDisplay = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Remove 998 prefix if exists
  if (cleaned.startsWith('998')) {
    cleaned = cleaned.substring(3);
  }
  
  // Format as +998 90 123 45 67
  if (cleaned.length >= 9) {
    return `+998 ${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5, 7)} ${cleaned.substring(7, 9)}`;
  } else if (cleaned.length >= 7) {
    return `+998 ${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5, 7)} ${cleaned.substring(7)}`;
  } else if (cleaned.length >= 5) {
    return `+998 ${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5)}`;
  } else if (cleaned.length >= 2) {
    return `+998 ${cleaned.substring(0, 2)} ${cleaned.substring(2)}`;
  } else if (cleaned.length > 0) {
    return `+998 ${cleaned}`;
  }
  
  return '+998 ';
};

export const validatePhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  // Uzbek phone numbers: 998XXXXXXXXX (12 digits)
  return cleaned.length === 12 && cleaned.startsWith('998');
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatCurrency = (amount) => {
  if (!amount) return '';
  // Remove "so'm" if already present
  const cleaned = amount.toString().replace(/\s*so['']?m\s*/gi, '').replace(/\D/g, '');
  if (!cleaned) return amount;
  return new Intl.NumberFormat('uz-UZ').format(cleaned) + ' so\'m';
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

