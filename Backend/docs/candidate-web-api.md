# Candidate Web API Documentation

Bu hujjat Web sayt orqali nomzod ro'yxatdan o'tish va kirish API endpoints va ularning ishlatilishini tushuntiradi.

## Base URL

```
http://localhost:3000/api/candidates/web
```

## Authentication

Web endpoints lar public va JWT token talab qilmaydi. Faqat ro'yxatdan o'tgandan keyin token qaytariladi.

---

## Web Registration/Login Flow

Web sayt orqali ro'yxatdan o'tish va kirish uch jinsdan iborat:

1. **Login Start** - Telefon raqam yuboriladi, SMS kod yuboriladi
2. **Verify** - SMS kod tasdiqlanadi, foydalanuvchi mavjudligi tekshiriladi
3. **Register** - Agar foydalanuvchi yo'q bo'lsa, ism va familiya bilan ro'yxatdan o'tadi

---

## Endpoints

### 1. Login Start

Web sayt orqali kirishni boshlash. Telefon raqam yuboriladi, SMS kod yuboriladi.

**Endpoint:** `POST /api/candidates/web/login-start`

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
curl -X POST http://localhost:3000/api/candidates/web/login-start \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+998901234567"
  }'
```

**Example JavaScript (fetch):**
```javascript
const response = await fetch('http://localhost:3000/api/candidates/web/login-start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phone: '+998901234567'
  })
});

const data = await response.json();
console.log(data);
```

---

### 2. Verify

SMS kodni tasdiqlash va foydalanuvchi mavjudligini tekshirish.

**Endpoint:** `POST /api/candidates/web/verify`

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
      "registrationType": "bot"
    },
    "exists": true
  }
}
```

**Success Response (200 OK) - Candidate Not Found:**
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

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/candidates/web/verify \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+998901234567",
    "code": "12345"
  }'
```

**Example JavaScript (fetch):**
```javascript
const response = await fetch('http://localhost:3000/api/candidates/web/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phone: '+998901234567',
    code: '12345'
  })
});

const data = await response.json();
console.log(data);

// Check if candidate exists
if (data.success && data.data.exists) {
  // Candidate exists, store token and redirect to dashboard
  localStorage.setItem('token', data.data.token);
  // Redirect...
} else if (data.success && !data.data.exists) {
  // Candidate doesn't exist, show registration form
  // Show firstName and lastName input fields
}
```

---

### 3. Register

Yangi foydalanuvchini ro'yxatdan o'tkazish (faqat foydalanuvchi mavjud emas bo'lsa).

**Endpoint:** `POST /api/candidates/web/register`

**Access:** Public (Token talab qilmaydi)

**Request Body:**
```json
{
  "phone": "+998901234567",
  "firstName": "John",
  "lastName": "Doe"
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
      "registrationType": "web"
    }
  }
}
```

**Success Response (200 OK) - Candidate Already Exists:**
Agar telefon raqam bazada mavjud bo'lsa, foydalanuvchi ma'lumotlari va token qaytariladi.

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
  "message": "Candidate with this phone already exists"
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
curl -X POST http://localhost:3000/api/candidates/web/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+998901234567",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Example JavaScript (fetch):**
```javascript
const response = await fetch('http://localhost:3000/api/candidates/web/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phone: '+998901234567',
    firstName: 'John',
    lastName: 'Doe'
  })
});

const data = await response.json();
console.log(data);

if (data.success) {
  // Store token
  localStorage.setItem('token', data.data.token);
  // Redirect to dashboard
}
```

---

## Web Registration/Login Flow Diagram

```
1. User enters phone number on web site
   ↓
2. POST /api/candidates/web/login-start
   - Validates phone number
   - Generates 5-digit code
   - Sends SMS code
   - Stores code in memory (expires in 5 minutes)
   ↓
3. User receives SMS code
   ↓
4. User enters code
   ↓
5. POST /api/candidates/web/verify
   - Validates code
   - Checks if candidate exists (by phone)
   - If exists: Returns token and candidate data (exists: true)
   - If not exists: Returns phone number (exists: false)
   ↓
6a. If exists: User is logged in, redirect to dashboard
   ↓
6b. If not exists: Show registration form (firstName, lastName)
   ↓
7. User fills firstName and lastName
   ↓
8. POST /api/candidates/web/register
   - Creates new candidate
   - Generates JWT token
   - Returns token and candidate data
   ↓
9. User is registered and logged in, redirect to dashboard
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

Muvaffaqiyatli ro'yxatdan o'tgandan yoki kirgandan keyin JWT token qaytariladi. Bu token keyingi so'rovlarda foydalanish uchun saqlanadi:

```
Authorization: Bearer <token>
```

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

## Important Notes

1. **Phone Number Uniqueness:** Telefon raqam unique bo'lishi kerak
2. **Code Expiration:** SMS kodi 5 daqiqada amal qiladi
3. **Registration Type:** Web orqali ro'yxatdan o'tgan foydalanuvchilar uchun `registrationType: 'web'` belgilanadi
4. **Unified Profile:** Bot va Web orqali ro'yxatdan o'tgan foydalanuvchilar bir xil profilga ega (telefon raqam asosida)
5. **Existing Users:** Agar telefon raqam bazada mavjud bo'lsa (bot orqali ro'yxatdan o'tgan), web orqali ham kirish mumkin

---

## Frontend Integration Example

```javascript
// Step 1: User enters phone number
async function loginStart(phone) {
  const response = await fetch('http://localhost:3000/api/candidates/web/login-start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone })
  });
  
  const data = await response.json();
  if (data.success) {
    // Show code input form
    showCodeInput();
  }
}

// Step 2: User enters code
async function verifyCode(phone, code) {
  const response = await fetch('http://localhost:3000/api/candidates/web/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone, code })
  });
  
  const data = await response.json();
  if (data.success) {
    if (data.data.exists) {
      // User exists, store token and redirect
      localStorage.setItem('token', data.data.token);
      window.location.href = '/dashboard';
    } else {
      // User doesn't exist, show registration form
      showRegistrationForm(phone);
    }
  }
}

// Step 3: User registers (if not exists)
async function register(phone, firstName, lastName) {
  const response = await fetch('http://localhost:3000/api/candidates/web/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone, firstName, lastName })
  });
  
  const data = await response.json();
  if (data.success) {
    // Store token and redirect
    localStorage.setItem('token', data.data.token);
    window.location.href = '/dashboard';
  }
}
```

