import { API_BASE_URL } from '../utils/constants';
import { getToken, removeToken } from '../utils/helpers';

class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = getToken();

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      console.log(`🌐 API so'rovi: ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('❌ JSON bo\'lmagan javob:', text);
        throw new Error(`Server xatolik: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        // Handle 401 unauthorized - clear token
        if (response.status === 401) {
          removeToken();
          window.location.href = '/login';
        }
        console.error(`❌ API xatolik (${response.status}):`, data);
        console.error(`❌ Request URL: ${url}`);
        console.error(`❌ Request method: ${options.method || 'GET'}`);
        if (options.body) {
          try {
            const bodyObj = JSON.parse(options.body);
            console.error(`❌ Request body:`, JSON.stringify(bodyObj, null, 2));
          } catch (e) {
            console.error(`❌ Request body (raw):`, options.body);
          }
        }
        
        // Handle validation errors
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.msg || err.message).join(', ');
          const fullError = errorMessages || data.message || `Request failed: ${response.status}`;
          console.error(`❌ Validation errors:`, data.errors);
          throw new Error(fullError);
        }
        
        // Show full error message from server
        const errorMessage = data.message || `Request failed: ${response.status}`;
        console.error(`❌ Server error message:`, errorMessage);
        throw new Error(errorMessage);
      }

      console.log(`✅ API muvaffaqiyat: ${options.method || 'GET'} ${url}`);
      return data;
    } catch (error) {
      console.error(`❌ Network xatolik: ${url}`, error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Serverga ulanib bo\'lmadi. Server ishlamayapti yoki internet aloqasi yo\'q.');
      }
      throw error;
    }
  }

  // Candidate Auth Endpoints
  async loginStart(phone) {
    return this.request('/candidates/web/login-start', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  async verifyCode(phone, code) {
    return this.request('/candidates/web/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    });
  }

  async register(phone, firstName, lastName) {
    return this.request('/candidates/web/register', {
      method: 'POST',
      body: JSON.stringify({ phone, firstName, lastName }),
    });
  }

  async getCurrentUser() {
    return this.request('/candidates/web/me', { method: 'GET' });
  }

  // Telegram Web App Auth (public endpoint, no token required)
  async authenticateWebApp(initData) {
    const url = `${this.baseURL}/web-app/auth`;
    
    try {
      console.log(`🌐 Telegram Web App auth so'rovi: POST ${url}`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initData }),
      });
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('❌ JSON bo\'lmagan javob:', text);
        throw new Error(`Server xatolik: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        console.error(`❌ API xatolik (${response.status}):`, data);
        throw new Error(data.message || `Request failed: ${response.status}`);
      }

      console.log(`✅ Telegram Web App auth muvaffaqiyat: POST ${url}`);
      return data;
    } catch (error) {
      console.error(`❌ Network xatolik: ${url}`, error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Serverga ulanib bo\'lmadi. Server ishlamayapti yoki internet aloqasi yo\'q.');
      }
      throw error;
    }
  }

  // Vacancy Endpoints
  async getVacancies(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/web/vacancies${queryParams ? `?${queryParams}` : ''}`;
    return this.request(endpoint, { method: 'GET' });
  }

  async getVacancy(id) {
    return this.request(`/web/vacancies/${id}`, { method: 'GET' });
  }

  // Application Endpoints
  async applyToVacancy(vacancyId) {
    // Validate vacancyId
    if (!vacancyId) {
      throw new Error('Vacancy ID is required');
    }
    
    // Ensure vacancyId is a string
    const vacancyIdStr = String(vacancyId).trim();
    if (!vacancyIdStr) {
      throw new Error('Vacancy ID is required');
    }
    
    const body = { vacancyId: vacancyIdStr };
    
    return await this.request('/web/applications', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getMyApplications(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/web/applications${queryParams ? `?${queryParams}` : ''}`;
    return this.request(endpoint, { method: 'GET' });
  }

  async getApplication(id) {
    return this.request(`/web/applications/${id}`, { method: 'GET' });
  }

  // Materials Endpoints
  async getMaterials() {
    return this.request('/web/materials', { method: 'GET' });
  }

  async getMaterial(id) {
    return this.request(`/web/materials/${id}`, { method: 'GET' });
  }

  async submitTest(materialId, answers) {
    return this.request(`/web/materials/${materialId}/submit-test`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  async getTestResults(materialId) {
    return this.request(`/web/materials/${materialId}/results`, { method: 'GET' });
  }

  // Saved Vacancies Endpoints
  async saveVacancy(vacancyId) {
    return this.request('/web/saved-vacancies', {
      method: 'POST',
      body: JSON.stringify({ vacancyId }),
    });
  }

  async unsaveVacancy(vacancyId) {
    return this.request(`/web/saved-vacancies/${vacancyId}`, { method: 'DELETE' });
  }

  async getSavedVacancies(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/web/saved-vacancies${queryParams ? `?${queryParams}` : ''}`;
    return this.request(endpoint, { method: 'GET' });
  }

  async checkSavedVacancy(vacancyId) {
    return this.request(`/web/saved-vacancies/check/${vacancyId}`, { method: 'GET' });
  }

  // Interview Endpoints
  async getMyInterviews(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/web/interviews${queryParams ? `?${queryParams}` : ''}`;
    return this.request(endpoint, { method: 'GET' });
  }

  async getInterview(id) {
    return this.request(`/web/interviews/${id}`, { method: 'GET' });
  }
}

export default new ApiService(API_BASE_URL);

