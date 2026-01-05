# Telegram Web App API Documentation

Bu hujjat Telegram Web App va oddiy Web sayt uchun authentication API endpoints va ularning ishlatilishini tushuntiradi.

## Base URL

```
http://localhost:3000/api/web-app
```

## Authentication

Bu endpoint public va JWT token talab qilmaydi. Authentication dan keyin JWT token qaytariladi.

---

## Overview

Bu API Telegram Web App va oddiy web sayt uchun ishlatiladi. Telegram Web App orqali kirilganda, Telegram initData yuboriladi va foydalanuvchi avtomatik autentifikatsiya qilinadi.

---

## Environment Variables

`.env` faylga quyidagilarni qo'shing:

```
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
```

Telegram Bot token ni [@BotFather](https://t.me/botfather) dan olishingiz mumkin.

---

## Endpoints

### 1. Authenticate Web App

Telegram Web App yoki oddiy web sayt orqali autentifikatsiya qilish.

**Endpoint:** `POST /api/web-app/auth`

**Access:** Public (Token talab qilmaydi)

**Request Body (Telegram Web App):**
```json
{
  "initData": "query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%7D&auth_date=1662771648&hash=c501b71e775f74ce10e377dea85a7ea24ecd640b223ea86dfe453e0eaed2e2b2"
}
```

**Request Headers:**
```
Content-Type: application/json
```

**Validation Rules:**
- `initData`: Required, Telegram Web App initData string

**Success Response (200 OK) - Existing User:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "candidate": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+998901234567",
      "telegramId": "123456789",
      "registrationType": "bot"
    },
    "isNewUser": false
  }
}
```

**Success Response (201 Created) - New User:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "candidate": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "",
      "telegramId": "123456789",
      "registrationType": "bot"
    },
    "isNewUser": true
  }
}
```

**Error Responses:**

**400 Bad Request** - Validation error:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "msg": "initData is required",
      "param": "initData",
      "location": "body"
    }
  ]
}
```

**401 Unauthorized** - Invalid initData:
```json
{
  "success": false,
  "message": "Invalid or expired initData"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error"
}
```

**500 Internal Server Error** - Bot token not configured:
```json
{
  "success": false,
  "message": "Server configuration error"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/web-app/auth \
  -H "Content-Type: application/json" \
  -d '{
    "initData": "query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%7D&auth_date=1662771648&hash=c501b71e775f74ce10e377dea85a7ea24ecd640b223ea86dfe453e0eaed2e2b2"
  }'
```

**Example JavaScript (Telegram Web App):**
```javascript
// Get initData from Telegram Web App
const initData = window.Telegram.WebApp.initData;

const response = await fetch('http://localhost:3000/api/web-app/auth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    initData: initData
  })
});

const data = await response.json();
console.log(data);

if (data.success) {
  // Store token
  localStorage.setItem('token', data.data.token);
  
  // Check if new user
  if (data.data.isNewUser) {
    // Show welcome message or onboarding
  }
}
```

---

## Telegram Web App Integration

### Frontend Integration (Telegram Web App)

Telegram Web App'da quyidagicha integratsiya qilinadi:

```javascript
// Check if running in Telegram Web App
if (window.Telegram && window.Telegram.WebApp) {
  const tg = window.Telegram.WebApp;
  
  // Expand Web App to full height
  tg.expand();
  
  // Enable closing confirmation
  tg.enableClosingConfirmation();
  
  // Get initData
  const initData = tg.initData;
  
  // Authenticate user
  authenticateUser(initData);
}

async function authenticateUser(initData) {
  try {
    const response = await fetch('http://localhost:3000/api/web-app/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ initData })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store token
      localStorage.setItem('token', data.data.token);
      
      // Redirect to main app
      window.location.href = '/dashboard';
    } else {
      // Handle error
      console.error('Authentication failed:', data.message);
    }
  } catch (error) {
    console.error('Authentication error:', error);
  }
}
```

### HTML Integration

HTML faylga Telegram Web App script qo'shing:

```html
<!DOCTYPE html>
<html>
<head>
  <title>HR Company Web App</title>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
</head>
<body>
  <script>
    // Telegram Web App initialization
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Authenticate
      authenticateTelegramUser();
    }
    
    async function authenticateTelegramUser() {
      const initData = window.Telegram.WebApp.initData;
      
      const response = await fetch('http://localhost:3000/api/web-app/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initData })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        // Continue with app logic
      }
    }
  </script>
</body>
</html>
```

---

## Authentication Flow

### Telegram Web App Flow

```
1. User opens Telegram Web App from bot
   ↓
2. Telegram sends initData to frontend
   ↓
3. Frontend sends initData to POST /api/web-app/auth
   ↓
4. Backend validates initData using bot token
   ↓
5a. If candidate exists (by telegramId):
    - Returns token and candidate data
    - isNewUser: false
   ↓
5b. If candidate doesn't exist:
    - Creates new candidate
    - Returns token and candidate data
    - isNewUser: true
   ↓
6. Frontend stores token and uses it for authenticated requests
```

### Regular Web Flow

Oddiy web sayt uchun bu API ishlatilmaydi. Buning o'rniga `POST /api/candidates/web/login-start` va `POST /api/candidates/web/verify` ishlatiladi (candidate-web-api.md ga qarang).

---

## InitData Validation

InitData quyidagi asosda validate qilinadi:

1. **Hash Validation:** InitData hash'i Telegram bot token bilan validate qilinadi
2. **Time Validation:** auth_date 24 soatdan eski bo'lmasligi kerak
3. **User Data:** User ma'lumotlari initData'dan extract qilinadi

InitData format:
```
query_id=...&user={...}&auth_date=...&hash=...
```

---

## Token Usage

Muvaffaqiyatli autentifikatsiyadan keyin JWT token qaytariladi. Bu token keyingi so'rovlarda foydalanish uchun saqlanadi:

```
Authorization: Bearer <token>
```

Token `/api/web/vacancies` va `/api/web/applications` endpointlarida ishlatiladi.

---

## Candidate Model Updates

Telegram Web App orqali kirilgan foydalanuvchilar:

- `telegramId` - Telegram user ID (required)
- `firstName` - Telegram'dan olinadi
- `lastName` - Telegram'dan olinadi (ixtiyoriy)
- `phone` - Bo'sh bo'lishi mumkin (keyinroq to'ldirilishi mumkin)
- `registrationType` - `'bot'` bo'ladi

---

## Error Handling

Barcha error response lar quyidagi formatda:

```json
{
  "success": false,
  "message": "Error message description"
}
```

Validation errorlarida qo'shimcha `errors` array qaytariladi.

---

## Security Notes

1. **InitData Validation:** Barcha initData Telegram bot token bilan validate qilinadi
2. **Time Validation:** InitData 24 soatdan eski bo'lmasligi kerak
3. **Token:** Token xavfsiz joyda saqlanadi (localStorage yoki httpOnly cookie)
4. **HTTPS:** Production da mutlaqo HTTPS ishlatish kerak
5. **Bot Token:** Bot token `.env` faylda saqlanadi va maxfiy tutiladi

---

## Important Notes

1. **Telegram Web App Only:** Bu endpoint Telegram Web App uchun mo'ljallangan
2. **Regular Web:** Oddiy web sayt uchun `/api/candidates/web/*` endpointlarini ishlating
3. **Token Sharing:** Token barcha web endpointlarida ishlatiladi
4. **User Creation:** Agar foydalanuvchi topilmasa, yangi candidate yaratiladi
5. **Phone Number:** Telegram Web App orqali kirilgan foydalanuvchilarning telefon raqami bo'sh bo'lishi mumkin

---

## Testing

### Test with Telegram Web App

1. Telegram bot yarating
2. Web App URL ni sozlang
3. Bot'ga o'ting va Web App'ni oching
4. initData'ni oling va API'ga yuboring

### Test with cURL

InitData'ni Telegram Web App'dan oling va quyidagicha test qiling:

```bash
curl -X POST http://localhost:3000/api/web-app/auth \
  -H "Content-Type: application/json" \
  -d '{
    "initData": "your-init-data-here"
  }'
```

