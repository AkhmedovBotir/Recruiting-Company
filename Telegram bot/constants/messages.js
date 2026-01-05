module.exports = {
  START: (firstName) =>
    `👋 Salom ${firstName}!\n\n` +
    `Kandidat sifatida ro'yxatdan o'tish uchun quyidagi ma'lumotlarni kiriting.\n\n` +
    `Iltimos, ismingizni kiriting:`,

  REGISTER_START:
    `Ro'yxatdan o'tish uchun quyidagi ma'lumotlarni kiriting.\n\n` +
    `Iltimos, ismingizni kiriting:`,

  FIRST_NAME_CONFIRMED: (firstName) =>
    `Ism: ${firstName}\n\nIltimos, familiyangizni kiriting:`,

  LAST_NAME_CONFIRMED: (lastName) =>
    `Familiya: ${lastName}\n\n` +
    `Iltimos, telefon raqamingizni yuboring:\n\n` +
    `📱 Quyidagi tugmani bosing yoki telefon raqamingizni kiriting (masalan: +998901234567)`,

  PHONE_CONFIRMED: (phone) =>
    `📱 Telefon raqam: ${phone}\n\n` +
    `SMS kod yuborilmoqda...`,

  CODE_SENT: (phone, expiresInMinutes) =>
    `✅ SMS kod ${phone} raqamiga yuborildi.\n\n` +
    `Kod ${expiresInMinutes} daqiqada amal qiladi.\n\n` +
    `Iltimos, SMS kodni kiriting (5 raqam):`,

  REGISTRATION_SUCCESS: (candidate) =>
    `✅ Ro'yxatdan o'tish muvaffaqiyatli yakunlandi!\n\n` +
    `👤 Kandidat ma'lumotlari:\n` +
    `• Ism: ${candidate.firstName}\n` +
    `• Familiya: ${candidate.lastName}\n` +
    `• Telefon: ${candidate.phone}\n` +
    `• Telegram ID: ${candidate.telegramId}\n\n` +
    `🎉 Xush kelibsiz!`,

  ERRORS: {
    INVALID_FIRST_NAME: '❌ Ism 2-50 belgi orasida bo\'lishi kerak. Qayta kiriting:',
    INVALID_LAST_NAME: '❌ Familiya 2-50 belgi orasida bo\'lishi kerak. Qayta kiriting:',
    INVALID_CODE: '❌ Kod 5 raqamdan iborat bo\'lishi kerak. Qayta kiriting:',
    CODE_VERIFYING: '⏳ Kod tekshirilmoqda...',
    NEED_START: 'Ro\'yxatdan o\'tishni boshlash uchun /start buyrug\'ini bosing.',
    NEED_START_FOR_CONTACT: 'Telefon raqamni yuborish uchun avval ro\'yxatdan o\'tish jarayonini boshlang (/start)',
    API_ERROR: (message) => `❌ ${message}\n\nIltimos, kodni qayta kiriting:`,
    REGISTER_ERROR: (message, errors) => {
      let errorMsg = `❌ ${message}`;
      if (errors && errors.length > 0) {
        errorMsg += '\n\nXatoliklar:\n' + errors.map(e => `• ${e.msg}`).join('\n');
      }
      return errorMsg + '\n\nRo\'yxatdan o\'tishni qayta boshlash uchun /start buyrug\'ini bosing.';
    },
    BOT_ERROR: '❌ Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.',
  },
};

