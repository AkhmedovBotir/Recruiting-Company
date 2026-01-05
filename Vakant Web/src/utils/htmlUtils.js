// Xavfsiz HTML render qilish uchun helper funksiya
export const sanitizeHTML = (html) => {
  if (!html) return '';
  
  // Ruxsat berilgan taglar
  const allowedTags = ['b', 'strong', 'i', 'em', 'u', 'br', 'p', 'div', 'span', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  
  // HTML stringni xavfsiz qilish (oddiy versiya)
  // Production'da DOMPurify ishlatish tavsiya etiladi
  let sanitized = html;
  
  // Script va boshqa xavfsiz bo'lmagan taglarni o'chirish
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, ''); // Event handlerlarni o'chirish
  sanitized = sanitized.replace(/javascript:/gi, ''); // javascript: linklarni o'chirish
  
  return sanitized;
};

export const renderHTML = (html) => {
  if (!html) return '';
  return { __html: sanitizeHTML(html) };
};

