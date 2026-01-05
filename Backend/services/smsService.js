const axios = require('axios');

class EskizService {
  constructor() {
    this.email = process.env.ESKIZ_EMAIL;
    this.password = process.env.ESKIZ_PASSWORD;
    this.baseURL = 'https://notify.eskiz.uz/api';
    this.token = null;
    this.tokenExpiresAt = null;
  }

  // Get authentication token
  async getToken() {
    try {
      // Check if token is still valid
      if (this.token && this.tokenExpiresAt && new Date() < this.tokenExpiresAt) {
        return this.token;
      }

      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: this.email,
        password: this.password,
      });

      if (response.data && response.data.data && response.data.data.token) {
        this.token = response.data.data.token;
        // Token expires in 30 days, but we'll refresh it after 29 days
        this.tokenExpiresAt = new Date(Date.now() + 29 * 24 * 60 * 60 * 1000);
        return this.token;
      }

      throw new Error('Token olishda xatolik');
    } catch (error) {
      console.error('Error getting Eskiz token:', error.response?.data || error.message);
      throw new Error('SMS xizmatiga ulanishda xatolik yuz berdi');
    }
  }

  // Send SMS
  async sendSMS(phone, message) {
    try {
      const token = await this.getToken();

      // Format phone number (remove + and spaces)
      const formattedPhone = phone.replace(/[+\s-()]/g, '');

      // Ensure phone starts with 998
      const finalPhone = formattedPhone.startsWith('998') 
        ? formattedPhone 
        : `998${formattedPhone}`;

      const response = await axios.post(
        `${this.baseURL}/message/sms/send`,
        {
          mobile_phone: finalPhone,
          message: message,
          from: '4546',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Log response for debugging
      console.log('Eskiz API Response:', JSON.stringify(response.data, null, 2));

      // Check for success
      if (response.data) {
        if (
          response.data.status === 'success' ||
          response.data.status === 'waiting' ||
          response.data.id ||
          (response.data.message && response.data.message.includes('waiting'))
        ) {
          return {
            success: true,
            messageId: response.data.id || null,
            status: response.data.status || 'sent',
          };
        }

        if (response.data.message && response.data.status !== 'success' && response.data.status !== 'waiting') {
          throw new Error(response.data.message);
        }
      }

      return {
        success: true,
        messageId: response.data?.id || null,
        status: 'sent',
      };
    } catch (error) {
      console.error('Error sending SMS:', error.response?.data || error.message);
      
      if (
        error.response?.data?.message?.toLowerCase().includes('waiting') ||
        error.message?.toLowerCase().includes('waiting')
      ) {
        return {
          success: true,
          messageId: error.response?.data?.id || null,
          status: 'waiting',
        };
      }
      
      if (error.response?.status === 401) {
        this.token = null;
        this.tokenExpiresAt = null;
        return await this.sendSMS(phone, message);
      }

      throw new Error('SMS yuborishda xatolik yuz berdi');
    }
  }

  // Generate 5-digit code
  generateCode() {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  // Send verification code for vacancy login
  async sendVacancyLoginCode(phone, code) {
    const message = `${code} - Vakansiya ilovasiga kirish uchun tasdiqlash kodi. Kod 5 daqiqa amal qiladi. Talab va Taklif Agency.`;
    return await this.sendSMS(phone, message);
  }
}

module.exports = new EskizService();

