module.exports = {
  LOGIN_START: (firstName) =>
    `👋 Salom, ${firstName}!\n\n` +
    `Botga kirish uchun telefon raqamingizni yuboring:\n\n` +
    `📱 Quyidagi tugmani bosing yoki telefon raqamingizni kiriting (masalan: +998901234567)`,

  FIRST_NAME_CONFIRMED: (firstName) =>
    `Ism: ${firstName}\n\n` +
    `Iltimos, familiyangizni kiriting:`,

  LAST_NAME_CONFIRMED: (lastName) =>
    `Familiya: ${lastName}\n\n` +
    `Ro'yxatdan o'tkazilmoqda...`,

  REGISTRATION_REQUIRED:
    `✅ SMS kod tasdiqlandi.\n\n` +
    `Siz hali ro'yxatdan o'tmagansiz. Ro'yxatdan o'tish uchun quyidagi ma'lumotlarni kiriting:\n\n` +
    `Iltimos, ismingizni kiriting:`,

  REGISTERING:
    `⏳ Ro'yxatdan o'tkazilmoqda...`,

  LOGIN_SUCCESS: () =>
    `✅ Kirish muvaffaqiyatli!\n\n` +
    `🎉 Xush kelibsiz!`,

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
    `• Ism: ${candidate.firstName} ${candidate.lastName}\n` +
    `• Telefon: ${candidate.phone}\n` +
    `• Telegram ID: ${candidate.telegramId}\n\n` +
    `🎉 Xush kelibsiz!`,

  MAIN_MENU: `🏠 Asosiy menyu\n\nQuyidagi tugmalardan birini tanlang:`,

  VACANCIES_LIST: (vacancies) => {
    if (!vacancies || vacancies.length === 0) {
      return `📋 Vakansiyalar\n\nHozircha vakansiyalar mavjud emas.`;
    }
    
    let message = `📋 Vakansiyalar ro'yxati:\n\n`;
    vacancies.forEach((vacancy, index) => {
      const status = vacancy.hasApplied ? '✅ Topshirilgan' : '📝 Topshirish';
      message += `${index + 1}. ${vacancy.title}\n`;
      message += `   Kompaniya: ${vacancy.company}\n`;
      message += `   Maosh: ${vacancy.salary || 'Kelishiladi'}\n`;
      message += `   ${status}\n\n`;
    });
    return message;
  },

  VACANCY_DETAILS: (vacancy, webAppUrl) => {
    let message = `📄 ${vacancy.title}\n\n`;
    message += `🏢 Kompaniya: ${vacancy.company?.name || vacancy.company}\n`;
    message += `📁 Bo'lim: ${vacancy.department}\n`;
    message += `💼 Lavozim: ${vacancy.position}\n`;
    if (vacancy.experience) message += `📊 Tajriba: ${vacancy.experience}\n`;
    if (vacancy.workType) message += `⏰ Ish turi: ${vacancy.workType}\n`;
    if (vacancy.minAge && vacancy.maxAge) message += `👤 Yosh: ${vacancy.minAge}-${vacancy.maxAge} yosh\n`;
    if (vacancy.salary) message += `💰 Maosh: ${vacancy.salary}\n`;
    if (vacancy.description) {
      message += `\n📝 Tavsif:\n${vacancy.description}\n`;
    }
    
    if (vacancy.hasApplied) {
      message += `\n✅ Siz bu vakansiyaga allaqachon topshirgansiz`;
    } else {
      message += `\n\n⚠️ Eslatma: Vakansiyaga topshirish bot orqali emas, balki web ilovamiz orqali amalga oshiriladi.\n\n`;
      message += `🌐 Topshirish uchun quyidagi havolani oching:\n`;
      if (webAppUrl) {
        message += `${webAppUrl}/vacancies/${vacancy.id}`;
      } else {
        message += `Web ilovamizga kirib, vakansiyani tanlang`;
      }
    }
    return message;
  },

  PROFILE: (candidate, statistics) => {
    let message = `👤 Mening profilim\n\n`;
    message += `📝 Ism: ${candidate.fullName || `${candidate.firstName} ${candidate.lastName}`}\n`;
    message += `📱 Telefon: ${candidate.phone}\n`;
    message += `🆔 Telegram ID: ${candidate.telegramId}\n\n`;
    message += `📊 Statistika:\n`;
    message += `• Topshirishlar: ${statistics.applications || 0}\n`;
    message += `• Suhbatlar: ${statistics.interviews || 0}\n`;
    message += `• Sertifikatlar: ${statistics.certificates || 0}`;
    return message;
  },

  APPLICATIONS_LIST: (applications) => {
    if (!applications || applications.length === 0) {
      return `📝 Mening topshirishlarim\n\nHozircha topshirishlar mavjud emas.`;
    }
    
    const statusMap = {
      pending: '⏳ Kutilyapti',
      reviewed: '👀 Ko\'rib chiqilmoqda',
      interview: '🎯 Intervyuga qabul qilingan',
      passed: '✅ O\'tdi',
      failed: '❌ O\'tmadi',
      accepted: '✅ Qabul qilindi',
      rejected: '❌ Rad etildi',
    };
    
    let message = `📝 Mening topshirishlarim:\n\n`;
    applications.forEach((app, index) => {
      const status = statusMap[app.status] || app.status;
      const date = new Date(app.createdAt).toLocaleDateString('uz-UZ');
      message += `${index + 1}. ${app.vacancy.title}\n`;
      message += `   Kompaniya: ${app.vacancy.company}\n`;
      message += `   Status: ${status}\n`;
      message += `   Sana: ${date}\n\n`;
    });
    return message;
  },

  INTERVIEWS_LIST: (interviews) => {
    if (!interviews || interviews.length === 0) {
      return `🎯 Mening suhbatlarim\n\nHozircha suhbatlar mavjud emas.`;
    }
    
    const statusMap = {
      scheduled: '📅 Rejalashtirilgan',
      completed: '✅ Yakunlangan',
      cancelled: '❌ Bekor qilingan',
    };
    
    const resultMap = {
      passed: '✅ O\'tdi',
      failed: '❌ O\'tmadi',
      pending: '⏳ Kutilmoqda',
    };
    
    let message = `🎯 Mening suhbatlarim:\n\n`;
    interviews.forEach((interview, index) => {
      const date = new Date(interview.date).toLocaleDateString('uz-UZ');
      const status = statusMap[interview.status] || interview.status;
      const result = interview.result ? resultMap[interview.result] || interview.result : '';
      message += `${index + 1}. ${interview.vacancy.title}\n`;
      message += `   Kompaniya: ${interview.vacancy.company}\n`;
      message += `   Sana: ${date}\n`;
      message += `   Vaqt: ${interview.time}\n`;
      message += `   Intervyuer: ${interview.interviewer}\n`;
      message += `   Manzil: ${interview.location}\n`;
      message += `   Status: ${status}\n`;
      if (result) message += `   Natija: ${result}\n`;
      if (interview.averageRating) message += `   Reyting: ${interview.averageRating}/10\n`;
      message += `\n`;
    });
    return message;
  },

  CERTIFICATES_LIST: (certificates) => {
    if (!certificates || certificates.length === 0) {
      return `🏆 Mening sertifikatlarim\n\nHozircha sertifikatlar mavjud emas.`;
    }
    
    let message = `🏆 Mening sertifikatlarim:\n\n`;
    message += `Jami: ${certificates.length} ta sertifikat\n\n`;
    message += `Quyidagi sertifikatlardan birini tanlang:`;
    return message;
  },

  CERTIFICATE_DETAILS: (cert) => {
    const statusMap = {
      active: '✅ Faol',
      revoked: '❌ Bekor qilingan',
    };
    const date = new Date(cert.issuedDate).toLocaleDateString('uz-UZ');
    const status = statusMap[cert.status] || cert.status;
    
    let message = `🏆 Sertifikat\n\n`;
    message += `📌 ${cert.vacancy.title}\n`;
    message += `🏢 ${cert.vacancy.company}\n`;
    message += `🆔 ${cert.certificateNumber}\n`;
    message += `📅 ${date}\n`;
    message += `${status}`;
    return message;
  },

  ERRORS: {
    INVALID_FIRST_NAME: '❌ Ism 2-50 belgi orasida bo\'lishi kerak. Qayta kiriting:',
    INVALID_LAST_NAME: '❌ Familiya 2-50 belgi orasida bo\'lishi kerak. Qayta kiriting:',
    INVALID_CODE: '❌ Kod 5 raqamdan iborat bo\'lishi kerak. Qayta kiriting:',
    CODE_VERIFYING: '⏳ Kod tekshirilmoqda...\n\nIltimos, kuting...',
    NEED_START: 'Kirishni boshlash uchun /start buyrug\'ini bosing.',
    NEED_START_FOR_CONTACT: 'Telefon raqamni yuborish uchun avval kirish jarayonini boshlang (/start)',
    API_ERROR: (message) => `❌ ${message}\n\nIltimos, kodni qayta kiriting:`,
    LOGIN_ERROR: (message, errors) => {
      let errorMsg = `❌ ${message}`;
      if (errors && errors.length > 0) {
        errorMsg += '\n\nXatoliklar:\n' + errors.map(e => `• ${e.msg}`).join('\n');
      }
      return errorMsg + '\n\nKirishni qayta boshlash uchun /start buyrug\'ini bosing.';
    },
    REGISTER_ERROR: (message, errors) => {
      let errorMsg = `❌ ${message}`;
      if (errors && errors.length > 0) {
        errorMsg += '\n\nXatoliklar:\n' + errors.map(e => `• ${e.msg}`).join('\n');
      }
      return errorMsg + '\n\nIltimos, ma\'lumotlarni qayta kiriting.';
    },
    BOT_ERROR: '❌ Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.',
    NOT_AUTHORIZED: `❌ Siz ro'yxatdan o'tmagansiz.\n\nRo'yxatdan o'tish uchun /start buyrug'ini bosing.`,
    API_ERROR: (message) => `❌ ${message}`,
    NO_DATA: 'Ma\'lumot topilmadi.',
  },
};

