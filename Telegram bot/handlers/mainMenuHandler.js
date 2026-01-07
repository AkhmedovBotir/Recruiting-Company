const { Markup } = require('telegraf');
const userStorage = require('../storage/userStorage');
const apiService = require('../services/apiService');
const MESSAGES = require('../constants/messages');
const authHelper = require('../utils/authHelper');
const config = require('../config/config');

/**
 * Show main menu
 */
async function showMainMenu(ctx) {
  const userId = ctx.from.id;
  const data = userStorage.get(userId);
  
  if (!data || !data.token) {
    await ctx.reply(
      MESSAGES.ERRORS.NOT_AUTHORIZED,
      Markup.removeKeyboard()
    );
    return;
  }
  
  await ctx.reply(
    MESSAGES.MAIN_MENU,
    Markup.keyboard([
      ['📋 Vakansiyalar', '👤 Profilim'],
      ['📝 Topshirishlarim', '🎯 Suhbatlarim'],
      ['🏆 Sertifikatlarim'],
    ]).resize()
  );
}

/**
 * Handle vacancies list
 */
async function handleVacancies(ctx) {
  const userId = ctx.from.id;
  const data = userStorage.get(userId);
  
  if (!data || !data.token) {
    await ctx.reply(MESSAGES.ERRORS.NOT_AUTHORIZED);
    return;
  }
  
  await ctx.reply('⏳ Vakansiyalar yuklanmoqda...');
  
  const result = await apiService.getVacancies(data.token, { page: 1, limit: 10 });
  
  if (await authHelper.checkAndHandle401(result, userId, ctx)) {
    return;
  }
  
  if (result.success) {
    const vacancies = result.data?.data?.vacancies || [];
    const message = MESSAGES.VACANCIES_LIST(vacancies);
    
    if (vacancies.length > 0) {
      // Create inline keyboard with vacancy buttons
      const buttons = vacancies.map((vacancy, index) => [
        Markup.button.callback(
          `${index + 1}. ${vacancy.title}`,
          `vacancy_${vacancy.id}`
        )
      ]);
      
      await ctx.reply(message, Markup.inlineKeyboard(buttons));
    } else {
      await ctx.reply(message);
    }
  } else {
    await ctx.reply(MESSAGES.ERRORS.API_ERROR(result.message || 'Xatolik yuz berdi'));
  }
}

/**
 * Handle single vacancy details
 */
async function handleVacancyDetails(ctx, vacancyId) {
  const userId = ctx.from.id;
  const data = userStorage.get(userId);
  
  if (!data || !data.token) {
    await ctx.answerCbQuery('❌ Ro\'yxatdan o\'tmagansiz', true);
    await ctx.reply(MESSAGES.ERRORS.NOT_AUTHORIZED);
    return;
  }
  
  await ctx.answerCbQuery('⏳ Yuklanmoqda...');
  
  const result = await apiService.getVacancy(data.token, vacancyId);
  
  if (await authHelper.checkAndHandle401(result, userId, ctx)) {
    return;
  }
  
  if (result.success) {
    const vacancy = result.data?.data?.vacancy || result.data?.vacancy;
    if (vacancy) {
      const webAppUrl = config.webApp?.url;
      const message = MESSAGES.VACANCY_DETAILS(vacancy, webAppUrl);
      
      // If vacancy is not applied and webAppUrl exists, add button
      if (!vacancy.hasApplied && webAppUrl) {
        const applicationUrl = `${webAppUrl}/vacancies/${vacancy.id}`;
        await ctx.reply(
          message,
          Markup.inlineKeyboard([
            [Markup.button.url('🌐 Web ilovaga o\'tish', applicationUrl)]
          ])
        );
      } else {
        await ctx.reply(message);
      }
    } else {
      await ctx.answerCbQuery('❌ Ma\'lumot topilmadi', true);
      await ctx.reply(MESSAGES.ERRORS.NO_DATA);
    }
  } else {
    await ctx.answerCbQuery('❌ Xatolik', true);
    await ctx.reply(MESSAGES.ERRORS.API_ERROR(result.message || 'Xatolik yuz berdi'));
  }
}

/**
 * Handle profile
 */
async function handleProfile(ctx) {
  const userId = ctx.from.id;
  const data = userStorage.get(userId);
  
  if (!data || !data.token) {
    await ctx.reply(MESSAGES.ERRORS.NOT_AUTHORIZED);
    return;
  }
  
  await ctx.reply('⏳ Profil ma\'lumotlari yuklanmoqda...');
  
  const result = await apiService.getProfile(data.token);
  
  if (await authHelper.checkAndHandle401(result, userId, ctx)) {
    return;
  }
  
  if (result.success) {
    const responseData = result.data?.data || result.data;
    const candidate = responseData.candidate;
    const statistics = responseData.statistics || {};
    
    // Fix undefined telegramId - use stored value if not in response
    if (!candidate.telegramId && data.telegramId) {
      candidate.telegramId = data.telegramId;
    }
    
    const message = MESSAGES.PROFILE(candidate, statistics);
    await ctx.reply(message);
  } else {
    await ctx.reply(MESSAGES.ERRORS.API_ERROR(result.message || 'Xatolik yuz berdi'));
  }
}

/**
 * Handle applications
 */
async function handleApplications(ctx) {
  const userId = ctx.from.id;
  const data = userStorage.get(userId);
  
  if (!data || !data.token) {
    await ctx.reply(MESSAGES.ERRORS.NOT_AUTHORIZED);
    return;
  }
  
  await ctx.reply('⏳ Topshirishlar yuklanmoqda...');
  
  const result = await apiService.getApplications(data.token, { page: 1, limit: 10 });
  
  if (await authHelper.checkAndHandle401(result, userId, ctx)) {
    return;
  }
  
  if (result.success) {
    const applications = result.data?.data?.applications || [];
    const message = MESSAGES.APPLICATIONS_LIST(applications);
    await ctx.reply(message);
  } else {
    await ctx.reply(MESSAGES.ERRORS.API_ERROR(result.message || 'Xatolik yuz berdi'));
  }
}

/**
 * Handle interviews
 */
async function handleInterviews(ctx) {
  const userId = ctx.from.id;
  const data = userStorage.get(userId);
  
  if (!data || !data.token) {
    await ctx.reply(MESSAGES.ERRORS.NOT_AUTHORIZED);
    return;
  }
  
  await ctx.reply('⏳ Suhbatlar yuklanmoqda...');
  
  const result = await apiService.getInterviews(data.token, { page: 1, limit: 10 });
  
  if (await authHelper.checkAndHandle401(result, userId, ctx)) {
    return;
  }
  
  if (result.success) {
    const interviews = result.data?.data?.interviews || [];
    const message = MESSAGES.INTERVIEWS_LIST(interviews);
    await ctx.reply(message);
  } else {
    await ctx.reply(MESSAGES.ERRORS.API_ERROR(result.message || 'Xatolik yuz berdi'));
  }
}

/**
 * Handle certificates
 */
async function handleCertificates(ctx) {
  const userId = ctx.from.id;
  const data = userStorage.get(userId);
  
  if (!data || !data.token) {
    await ctx.reply(MESSAGES.ERRORS.NOT_AUTHORIZED);
    return;
  }
  
  await ctx.reply('⏳ Sertifikatlar yuklanmoqda...');
  
  const result = await apiService.getCertificates(data.token, { page: 1, limit: 10 });
  
  if (await authHelper.checkAndHandle401(result, userId, ctx)) {
    return;
  }
  
  if (result.success) {
    const certificates = result.data?.data?.certificates || [];
    
    if (certificates.length > 0) {
      // Create inline buttons for each certificate
      const buttons = certificates.map((cert, index) => [
        Markup.button.callback(
          `${index + 1}. ${cert.vacancy.title}`,
          `cert_${cert.id}`
        )
      ]);
      
      // Send list message with inline buttons
      const message = MESSAGES.CERTIFICATES_LIST(certificates);
      await ctx.reply(
        message,
        Markup.inlineKeyboard(buttons)
      );
    } else {
      await ctx.reply(MESSAGES.CERTIFICATES_LIST([]));
    }
  } else {
    await ctx.reply(MESSAGES.ERRORS.API_ERROR(result.message || 'Xatolik yuz berdi'));
  }
}

/**
 * Handle single certificate details
 */
async function handleCertificateDetails(ctx, certificateId) {
  const userId = ctx.from.id;
  const data = userStorage.get(userId);
  
  if (!data || !data.token) {
    await ctx.answerCbQuery('❌ Ro\'yxatdan o\'tmagansiz', true);
    await ctx.reply(MESSAGES.ERRORS.NOT_AUTHORIZED);
    return;
  }
  
  await ctx.answerCbQuery('⏳ Yuklanmoqda...');
  
  // Get all certificates to find the one we need
  const result = await apiService.getCertificates(data.token, { page: 1, limit: 100 });
  
  if (await authHelper.checkAndHandle401(result, userId, ctx)) {
    return;
  }
  
  if (result.success) {
    const certificates = result.data?.data?.certificates || [];
    const cert = certificates.find(c => c.id === certificateId);
    
    if (cert) {
      const certMessage = MESSAGES.CERTIFICATE_DETAILS(cert);
      
      // Check if certificate has base64 image
      if (cert.image || cert.imageBase64) {
        const imageBase64 = cert.imageBase64 || cert.image;
        
        try {
          // Remove data URL prefix if present (data:image/png;base64,...)
          const base64Data = imageBase64.includes(',') 
            ? imageBase64.split(',')[1] 
            : imageBase64;
          
          // Convert base64 to buffer
          const imageBuffer = Buffer.from(base64Data, 'base64');
          
          // Send photo with caption
          await ctx.replyWithPhoto(
            { source: imageBuffer },
            { caption: certMessage }
          );
        } catch (error) {
          console.error('Error sending certificate image:', error);
          // If image fails, just send text
          await ctx.reply(certMessage);
        }
      } else {
        // No image, just send text
        await ctx.reply(certMessage);
      }
    } else {
      await ctx.answerCbQuery('❌ Sertifikat topilmadi', true);
      await ctx.reply(MESSAGES.ERRORS.NO_DATA);
    }
  } else {
    await ctx.answerCbQuery('❌ Xatolik', true);
    await ctx.reply(MESSAGES.ERRORS.API_ERROR(result.message || 'Xatolik yuz berdi'));
  }
}

module.exports = {
  showMainMenu,
  handleVacancies,
  handleVacancyDetails,
  handleProfile,
  handleApplications,
  handleInterviews,
  handleCertificates,
  handleCertificateDetails,
};

