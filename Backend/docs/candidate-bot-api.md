# Candidate Bot API Documentation

Bu hujjat Telegram Bot orqali nomzod ro'yxatdan o'tish va bot orqali barcha operatsiyalarni bajarish API endpoints va ularning ishlatilishini tushuntiradi.

## Base URL

```
http://localhost:3000/api/candidates/bot (Ro'yxatdan o'tish)
http://localhost:3000/api/bot (Bot operatsiyalari)
```

## Authentication

Bot endpoints ikki qismga bo'linadi:

1. **Public Endpoints** - Ro'yxatdan o'tish uchun (token talab qilmaydi)
2. **Protected Endpoints** - Bot operatsiyalari uchun (JWT token talab qiladi)

Token `Authorization` header orqali yuboriladi:

```
Authorization: Bearer <your-token>
```

---

## Bot Login/Registration Flow

Telegram bot orqali kirish va ro'yxatdan o'tish uch bosqichdan iborat:

1. **Login Start** - Telefon raqam yuboriladi, SMS kod yuboriladi
2. **Verify** - SMS kod tasdiqlanadi. Agar foydalanuvchi mavjud bo'lsa token qaytariladi, agar yo'q bo'lsa registratsiya talab qilinadi
3. **Register** - Ism, familiya va telegram ID yuboriladi, yangi foydalanuvchi yaratiladi va token qaytariladi

---

## Part 1: Login/Registration Endpoints (Public)

### 1. Login Start

Bot orqali kirishni boshlash. Faqat telefon raqam yuboriladi, SMS kod yuboriladi.

**Endpoint:** `POST /api/candidates/bot/login-start`

**Access:** Public (Token talab qilmaydi)

**Request Body:**
```json
{
  "phone": "+998901234567"
}
```

**Request Headers:**
```
Content-Type: application/json
```

**Validation Rules:**
- `phone`: Required, phone number format

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Verification code sent successfully",
  "data": {
    "phone": "+998901234567",
    "expiresIn": 300
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
      "msg": "Phone number is required",
      "param": "phone",
      "location": "body"
    }
  ]
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to send verification code"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/candidates/bot/login-start \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+998901234567"
  }'
```

---

### 2. Verify

SMS kodni tasdiqlash va foydalanuvchi mavjudligini tekshirish.

**Endpoint:** `POST /api/candidates/bot/verify`

**Access:** Public (Token talab qilmaydi)

**Request Body:**
```json
{
  "phone": "+998901234567",
  "code": "12345"
}
```

**Request Headers:**
```
Content-Type: application/json
```

**Validation Rules:**
- `phone`: Required, phone number format
- `code`: Required, 5-digit numeric code

**Success Response (200 OK) - Candidate Exists:**
Agar foydalanuvchi bazada mavjud bo'lsa, token va foydalanuvchi ma'lumotlari qaytariladi.

```json
{
  "success": true,
  "message": "Login successful",
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
    "exists": true
  }
}
```

**Success Response (200 OK) - Candidate Not Found:**
Agar foydalanuvchi bazada mavjud bo'lmasa, registratsiya talab qilinadi.

```json
{
  "success": true,
  "message": "Candidate not found, registration required",
  "data": {
    "phone": "+998901234567",
    "exists": false
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
      "msg": "Verification code is required",
      "param": "code",
      "location": "body"
    }
  ]
}
```

**400 Bad Request** - Invalid code:
```json
{
  "success": false,
  "message": "Invalid code"
}
```

**400 Bad Request** - Code expired:
```json
{
  "success": false,
  "message": "Code expired"
}
```

**400 Bad Request** - Too many attempts:
```json
{
  "success": false,
  "message": "Too many attempts"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/candidates/bot/verify \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+998901234567",
    "code": "12345"
  }'
```

---

### 3. Register

Yangi foydalanuvchini ro'yxatdan o'tkazish. Faqat telefon raqam verify qilingandan keyin ishlatiladi.

**Endpoint:** `POST /api/candidates/bot/register`

**Access:** Public (Token talab qilmaydi)

**Request Body:**
```json
{
  "phone": "+998901234567",
  "firstName": "John",
  "lastName": "Doe",
  "telegramId": "123456789"
}
```

**Request Headers:**
```
Content-Type: application/json
```

**Validation Rules:**
- `phone`: Required, phone number format
- `firstName`: Required, 2-50 characters
- `lastName`: Required, 2-50 characters
- `telegramId`: Required, Telegram user ID

**Success Response (201 Created) - New Candidate:**
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
      "phone": "+998901234567",
      "telegramId": "123456789",
      "registrationType": "bot"
    }
  }
}
```

**Success Response (200 OK) - Existing Candidate:**
Agar telefon raqam yoki telegram ID bazada mavjud bo'lsa, mavjud foydalanuvchi ma'lumotlari yangilanadi va token qaytariladi.

```json
{
  "success": true,
  "message": "Candidate already exists",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "candidate": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+998901234567",
      "telegramId": "123456789",
      "registrationType": "bot"
    }
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
      "msg": "First name is required",
      "param": "firstName",
      "location": "body"
    }
  ]
}
```

**400 Bad Request** - Candidate already exists:
```json
{
  "success": false,
  "message": "Candidate with this phone or telegram ID already exists"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/candidates/bot/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+998901234567",
    "firstName": "John",
    "lastName": "Doe",
    "telegramId": "123456789"
  }'
```

---

## Part 2: Bot Operations Endpoints (Protected)

Barcha quyidagi endpointlar JWT token talab qiladi. Token ro'yxatdan o'tgandan keyin qaytariladi va keyingi so'rovlarda ishlatiladi.

### 1. Get Vacancies

Faol vakansiyalarni ko'rish (bot uchun soddalashtirilgan).

**Endpoint:** `GET /api/bot/vacancies`

**Access:** Private (JWT token talab qiladi)

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "vacancies": [
      {
        "id": "507f1f77bcf86cd799439011",
        "title": "Senior Full Stack Developer",
        "department": "IT",
        "position": "Senior Developer",
        "workType": "fulltime",
        "salary": "1500-2000 USD",
        "company": "Tech Solutions LLC",
        "hasApplied": false,
        "createdAt": "2024-01-15T10:00:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439012",
        "title": "Frontend Developer",
        "department": "IT",
        "position": "Middle Developer",
        "workType": "fulltime",
        "salary": "1000-1500 USD",
        "company": "Digital Agency",
        "hasApplied": true,
        "createdAt": "2024-01-14T09:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "pages": 1
    }
  }
}
```

**Bot Flow:**
```
1. User clicks "Vakansiyalar" button in bot
   ↓
2. Bot sends GET /api/bot/vacancies with token
   ↓
3. Bot receives list of vacancies with hasApplied flag
   ↓
4. Bot displays vacancies to user
   - Shows title, company, salary
   - Shows "Topshirilgan" if hasApplied: true
   - Shows "Topshirish" button if hasApplied: false
```

---

### 2. Get Single Vacancy

Bitta vakansiyani batafsil ko'rish.

**Endpoint:** `GET /api/bot/vacancies/:id`

**Access:** Private (JWT token talab qiladi)

**URL Parameters:**
- `id` (required) - Vakansiya ID (MongoDB ObjectId)

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "vacancy": {
      "id": "507f1f77bcf86cd799439011",
      "title": "Senior Full Stack Developer",
      "department": "IT",
      "position": "Senior Developer",
      "experience": "3-5 years",
      "workType": "fulltime",
      "minAge": 25,
      "maxAge": 40,
      "salary": "1500-2000 USD",
      "description": "We are looking for an experienced Full Stack Developer...",
      "company": {
        "name": "Tech Solutions LLC",
        "inn": "123456789"
      },
      "hasApplied": false,
      "applicationStatus": null,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

**Bot Flow:**
```
1. User clicks on a vacancy from list
   ↓
2. Bot sends GET /api/bot/vacancies/:id with token
   ↓
3. Bot receives detailed vacancy information
   ↓
4. Bot displays vacancy details to user
   - Shows all vacancy information
   - Shows "Topshirilgan" if hasApplied: true
   - Shows "Topshirish" button if hasApplied: false
   - Button redirects to web application form
```

---

### 3. Get My Profile

O'z profil ma'lumotlarini ko'rish.

**Endpoint:** `GET /api/bot/profile`

**Access:** Private (JWT token talab qiladi)

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "candidate": {
      "id": "507f1f77bcf86cd799439013",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "phone": "+998901234567",
      "telegramId": "123456789",
      "registrationType": "bot",
      "createdAt": "2024-01-10T12:00:00.000Z"
    },
    "statistics": {
      "applications": 5,
      "interviews": 2,
      "certificates": 1
    }
  }
}
```

**Bot Flow:**
```
1. User clicks "Mening profilim" button in bot
   ↓
2. Bot sends GET /api/bot/profile with token
   ↓
3. Bot receives profile and statistics
   ↓
4. Bot displays profile information
   - Shows name, phone, telegram ID
   - Shows statistics (applications, interviews, certificates)
```

---

### 4. Get My Applications

O'z topshirishlarini ko'rish.

**Endpoint:** `GET /api/bot/applications`

**Access:** Private (JWT token talab qiladi)

**Query Parameters:**
- `status` (optional) - Filter by status: `pending`, `reviewed`, `interview`, `passed`, `failed`, `accepted`, `rejected`
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "507f1f77bcf86cd799439021",
        "vacancy": {
          "id": "507f1f77bcf86cd799439011",
          "title": "Senior Full Stack Developer",
          "department": "IT",
          "position": "Senior Developer",
          "company": "Tech Solutions LLC"
        },
        "status": "pending",
        "createdAt": "2024-01-15T12:00:00.000Z",
        "updatedAt": "2024-01-15T12:00:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439022",
        "vacancy": {
          "id": "507f1f77bcf86cd799439012",
          "title": "Frontend Developer",
          "department": "IT",
          "position": "Middle Developer",
          "company": "Digital Agency"
        },
        "status": "interview",
        "createdAt": "2024-01-14T10:00:00.000Z",
        "updatedAt": "2024-01-16T14:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "pages": 1
    }
  }
}
```

**Bot Flow:**
```
1. User clicks "Mening topshirishlarim" button in bot
   ↓
2. Bot sends GET /api/bot/applications with token
   ↓
3. Bot receives list of applications
   ↓
4. Bot displays applications to user
   - Shows vacancy title, company
   - Shows status (pending, reviewed, interview, etc.)
   - Shows date
   - User can click on application to see details
```

---

### 5. Get My Interviews

O'z suhbatlarini ko'rish.

**Endpoint:** `GET /api/bot/interviews`

**Access:** Private (JWT token talab qiladi)

**Query Parameters:**
- `status` (optional) - Filter by status: `scheduled`, `completed`, `cancelled`
- `result` (optional) - Filter by result: `passed`, `failed`, `pending`
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "interviews": [
      {
        "id": "507f1f77bcf86cd799439061",
        "vacancy": {
          "id": "507f1f77bcf86cd799439011",
          "title": "Senior Full Stack Developer",
          "company": "Tech Solutions LLC"
        },
        "date": "2024-01-20T00:00:00.000Z",
        "time": "14:00",
        "interviewer": "Ahmadjon Karimov",
        "location": "Zoom: https://zoom.us/j/123456789",
        "status": "scheduled",
        "result": "pending",
        "averageRating": null,
        "evaluationsCount": 0,
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439062",
        "vacancy": {
          "id": "507f1f77bcf86cd799439012",
          "title": "Frontend Developer",
          "company": "Digital Agency"
        },
        "date": "2024-01-18T00:00:00.000Z",
        "time": "10:00",
        "interviewer": "Sardor Toshmatov",
        "location": "Office: Toshkent shahar",
        "status": "completed",
        "result": "passed",
        "averageRating": 8.0,
        "evaluationsCount": 2,
        "createdAt": "2024-01-14T09:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "pages": 1
    }
  }
}
```

**Bot Flow:**
```
1. User clicks "Mening suhbatlarim" button in bot
   ↓
2. Bot sends GET /api/bot/interviews with token
   ↓
3. Bot receives list of interviews
   ↓
4. Bot displays interviews to user
   - Shows vacancy title, company
   - Shows date, time, interviewer, location
   - Shows status (scheduled, completed, cancelled)
   - Shows result (passed, failed, pending)
   - Shows average rating if completed
   - User can click on interview to see details
```

---

### 6. Get My Certificates

O'z sertifikatlarini ko'rish.

**Endpoint:** `GET /api/bot/certificates`

**Access:** Private (JWT token talab qiladi)

**Query Parameters:**
- `status` (optional) - Filter by status: `active`, `revoked`
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "certificates": [
      {
        "id": "507f1f77bcf86cd799439071",
        "certificateNumber": "CERT-20240120-1",
        "qrCode": "c959393d10c6a7404a43d403e020dc084e662b5bb75315e9b45da188010fc679",
        "vacancy": {
          "id": "507f1f77bcf86cd799439011",
          "title": "Senior Full Stack Developer",
          "company": "Tech Solutions LLC"
        },
        "issuedDate": "2024-01-21T10:00:00.000Z",
        "status": "active",
        "createdAt": "2024-01-21T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

**Bot Flow:**
```
1. User clicks "Mening sertifikatlarim" button in bot
   ↓
2. Bot sends GET /api/bot/certificates with token
   ↓
3. Bot receives list of certificates
   ↓
4. Bot displays certificates to user
   - Shows certificate number
   - Shows vacancy title, company
   - Shows issued date
   - Shows status (active, revoked)
   - User can click on certificate to see QR code or download
```

---

## Bot Login/Registration Flow Diagram

### Scenario 1: Existing User (Login)

```
1. User opens bot and clicks "Kirish" (Login)
   ↓
2. Bot asks for phone number
   ↓
3. POST /api/candidates/bot/login-start
   - Validates phone number
   - Generates 5-digit code
   - Sends SMS code
   - Stores code in memory (expires in 5 minutes)
   ↓
4. User receives SMS code
   ↓
5. User enters code in bot
   ↓
6. POST /api/candidates/bot/verify
   - Validates code
   - Checks if candidate exists (by phone)
   - If exists: Generates JWT token and returns candidate data
   - If not exists: Returns exists: false
   ↓
7. Bot receives response with exists: true
   ↓
8. Bot stores token and shows main menu
```

### Scenario 2: New User (Registration)

```
1. User opens bot and clicks "Kirish" (Login)
   ↓
2. Bot asks for phone number
   ↓
3. POST /api/candidates/bot/login-start
   - Validates phone number
   - Generates 5-digit code
   - Sends SMS code
   - Stores code in memory (expires in 5 minutes)
   ↓
4. User receives SMS code
   ↓
5. User enters code in bot
   ↓
6. POST /api/candidates/bot/verify
   - Validates code
   - Checks if candidate exists (by phone)
   - Returns exists: false (candidate not found)
   ↓
7. Bot receives response with exists: false
   ↓
8. Bot asks for firstName, lastName
   ↓
9. POST /api/candidates/bot/register
   - Validates input
   - Creates new candidate
   - Generates JWT token
   - Returns token and candidate data
   ↓
10. Bot stores token and shows main menu
```

---

## Complete Bot Flow Example

### Scenario: User wants to view vacancies and check application status

```
1. User opens bot and clicks "Vakansiyalar"
   ↓
2. Bot: GET /api/bot/vacancies
   Headers: Authorization: Bearer <token>
   ↓
3. Bot receives list of vacancies
   ↓
4. Bot displays:
   "📋 Vakansiyalar ro'yxati:
   
   1. Senior Full Stack Developer
      Kompaniya: Tech Solutions LLC
      Maosh: 1500-2000 USD
      [Topshirish] button
   
   2. Frontend Developer
      Kompaniya: Digital Agency
      Maosh: 1000-1500 USD
      ✅ Topshirilgan"
   ↓
5. User clicks on "Senior Full Stack Developer"
   ↓
6. Bot: GET /api/bot/vacancies/:id
   ↓
7. Bot receives detailed vacancy info
   ↓
8. Bot displays:
   "📄 Senior Full Stack Developer
   
   Kompaniya: Tech Solutions LLC
   Bo'lim: IT
   Lavozim: Senior Developer
   Tajriba: 3-5 years
   Maosh: 1500-2000 USD
   
   Tavsif: We are looking for...
   
   [Topshirish] button (redirects to web)"
   ↓
9. User clicks "Mening topshirishlarim"
   ↓
10. Bot: GET /api/bot/applications
    ↓
11. Bot receives applications list
    ↓
12. Bot displays:
    "📝 Mening topshirishlarim:
    
    1. Senior Full Stack Developer
       Status: ⏳ Kutilyapti
       Sana: 15.01.2024
    
    2. Frontend Developer
       Status: 🎯 Intervyuga qabul qilingan
       Sana: 14.01.2024"
```

---

## Phone Number Format

Telefon raqam quyidagi formatlarda qabul qilinadi:
- `+998901234567`
- `998901234567`
- `901234567`

Server avtomatik ravishda formatni `+998901234567` ko'rinishiga o'zgartiradi.

---

## SMS Code

- SMS kod 5 raqamdan iborat
- Kod 5 daqiqada amal qiladi
- Maksimal 5 marta noto'g'ri urinish mumkin
- Kod tasdiqlangandan keyin o'chiriladi

---

## Token Usage

Muvaffaqiyatli ro'yxatdan o'tgandan keyin JWT token qaytariladi. Bu token keyingi so'rovlarda foydalanish uchun saqlanadi:

```
Authorization: Bearer <token>
```

Token barcha protected endpointlar uchun talab qilinadi.

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

**401 Unauthorized** - Token yo'q yoki noto'g'ri:
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**404 Not Found** - Ma'lumot topilmadi:
```json
{
  "success": false,
  "message": "Vacancy not found"
}
```

---

## Important Notes

1. **Phone Number First:** Avval telefon raqam so'raladi va SMS kod yuboriladi
2. **Code Verification:** SMS kod tasdiqlangandan keyin foydalanuvchi mavjudligi tekshiriladi
3. **Registration Flow:** Agar foydalanuvchi mavjud bo'lmasa, ism va familiya so'raladi va registratsiya qilinadi
4. **Telegram ID:** Registratsiya jarayonida telegramId talab qilinadi
5. **Phone Number Uniqueness:** Telefon raqam unique bo'lishi kerak
6. **Code Expiration:** SMS kodi 5 daqiqada amal qiladi
7. **Registration Type:** Bot orqali ro'yxatdan o'tgan foydalanuvchilar uchun `registrationType: 'bot'` belgilanadi
8. **Existing Users:** Agar telefon raqam bazada mavjud bo'lsa, verify endpoint orqali to'g'ridan-to'g'ri token qaytariladi
9. **Simplified Responses:** Bot uchun barcha response lar soddalashtirilgan va faqat kerakli ma'lumotlar qaytariladi
10. **Application Submission:** Bot orqali vakansiyaga topshirish emas, faqat ko'rish mumkin. Topshirish web sayt orqali amalga oshiriladi.

---

## Integration with Telegram Bot

Telegram bot uchun quyidagi qadamlar ketma-ketligini amalga oshirish kerak:

### Login Flow (Existing User):
1. Foydalanuvchi `/start` yoki "Kirish" tugmasini bosadi
2. Bot telefon raqam so'raydi (Telegram'ning Contact button orqali)
3. Bot `POST /api/candidates/bot/login-start` ga so'rov yuboradi
4. Bot foydalanuvchidan SMS kodni so'raydi
5. Foydalanuvchi SMS kodni yuboradi
6. Bot `POST /api/candidates/bot/verify` ga so'rov yuboradi
7. Agar `exists: true` bo'lsa, bot token ni saqlaydi va asosiy menyuni ko'rsatadi

### Registration Flow (New User):
1. Foydalanuvchi `/start` yoki "Kirish" tugmasini bosadi
2. Bot telefon raqam so'raydi (Telegram'ning Contact button orqali)
3. Bot `POST /api/candidates/bot/login-start` ga so'rov yuboradi
4. Bot foydalanuvchidan SMS kodni so'raydi
5. Foydalanuvchi SMS kodni yuboradi
6. Bot `POST /api/candidates/bot/verify` ga so'rov yuboradi
7. Agar `exists: false` bo'lsa, bot ism va familiya so'raydi
8. Bot `POST /api/candidates/bot/register` ga so'rov yuboradi
9. Bot token ni saqlaydi va asosiy menyuni ko'rsatadi

### Main Menu Flow:
1. Bot asosiy menyuni ko'rsatadi:
   - 📋 Vakansiyalar
   - 👤 Mening profilim
   - 📝 Mening topshirishlarim
   - 🎯 Mening suhbatlarim
   - 🏆 Mening sertifikatlarim

2. Har bir tugma bosilganda tegishli API endpoint ga so'rov yuboriladi

3. Bot natijani foydalanuvchiga chiroyli formatda ko'rsatadi

---

## Example Bot Implementation (Pseudocode)

```javascript
// Bot registration
async function handleRegistration(user) {
  // Step 1: Get user info
  const { firstName, lastName, phone, telegramId } = await getUserInfo(user);
  
  // Step 2: Send register-start request
  const registerResponse = await fetch('/api/candidates/bot/register-start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, phone, telegramId })
  });
  
  if (!registerResponse.ok) {
    return bot.sendMessage('Xatolik yuz berdi');
  }
  
  // Step 3: Ask for SMS code
  const code = await bot.askForCode();
  
  // Step 4: Verify code
  const verifyResponse = await fetch('/api/candidates/bot/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code, firstName, lastName, telegramId })
  });
  
  const { data } = await verifyResponse.json();
  
  // Step 5: Store token
  await storeToken(user.id, data.token);
  
  // Step 6: Show main menu
  showMainMenu(user);
}

// Get vacancies
async function getVacancies(user) {
  const token = await getToken(user.id);
  
  const response = await fetch('/api/bot/vacancies', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const { data } = await response.json();
  
  // Format and send to user
  const message = formatVacancies(data.vacancies);
  bot.sendMessage(user.id, message);
}

// Get profile
async function getProfile(user) {
  const token = await getToken(user.id);
  
  const response = await fetch('/api/bot/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const { data } = await response.json();
  
  const message = `
👤 ${data.candidate.fullName}
📱 ${data.candidate.phone}
📊 Statistika:
   - Topshirishlar: ${data.statistics.applications}
   - Suhbatlar: ${data.statistics.interviews}
   - Sertifikatlar: ${data.statistics.certificates}
  `;
  
  bot.sendMessage(user.id, message);
}
```

---

## Response Format Notes

Bot uchun barcha response lar quyidagi xususiyatlarga ega:

1. **Simplified Data:** Faqat kerakli ma'lumotlar qaytariladi
2. **hasApplied Flag:** Vakansiyalar ro'yxatida foydalanuvchi allaqachon topshirganligini ko'rsatadi
3. **Status Information:** Barcha statuslar aniq va tushunarli
4. **Pagination:** Katta ro'yxatlar uchun pagination qo'llab-quvvatlanadi
5. **Error Messages:** Xato xabarlari tushunarli va foydalanuvchiga yo'naltirilgan

---

## Best Practices for Bot Integration

1. **Token Storage:** Token ni xavfsiz saqlang (encrypted storage)
2. **Error Handling:** Barcha xatolarni to'g'ri qayta ishlang va foydalanuvchiga tushunarli xabar bering
3. **User Experience:** Ma'lumotlarni chiroyli va tushunarli formatda ko'rsating
4. **Pagination:** Katta ro'yxatlar uchun pagination qo'llang
5. **Caching:** Kerak bo'lsa, ma'lumotlarni cache qiling (lekin eskirgan ma'lumotlarni yangilang)
6. **Rate Limiting:** Server tomonidan qo'yilgan rate limitlarni hisobga oling
