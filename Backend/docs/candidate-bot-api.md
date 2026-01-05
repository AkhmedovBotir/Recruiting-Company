# Candidate Bot API Documentation

Bu hujjat Telegram Bot orqali nomzod ro'yxatdan o'tish API endpoints va ularning ishlatilishini tushuntiradi.

## Base URL

```
http://localhost:3000/api/candidates/bot
```

## Authentication

Bot endpoints lar public va JWT token talab qilmaydi.

---

## Bot Registration Flow

Telegram bot orqali ro'yxatdan o'tish ikki bosqichdan iborat:

1. **Register Start** - Ism, familiya, telefon raqam va telegram ID yuboriladi, SMS kod yuboriladi
2. **Verify** - SMS kod tasdiqlanadi va foydalanuvchi yaratiladi

---

## Endpoints

### 1. Register Start

Bot orqali ro'yxatdan o'tishni boshlash. Ism, familiya, telefon raqam va telegram ID qabul qilinadi, SMS kod yuboriladi.

**Endpoint:** `POST /api/candidates/bot/register-start`

**Access:** Public (Token talab qilmaydi)

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+998901234567",
  "telegramId": "123456789"
}
```

**Request Headers:**
```
Content-Type: application/json
```

**Validation Rules:**
- `firstName`: Required, 2-50 characters
- `lastName`: Required, 2-50 characters
- `phone`: Required, phone number format
- `telegramId`: Required, Telegram user ID

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
  "message": "Failed to send verification code"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/candidates/bot/register-start \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+998901234567",
    "telegramId": "123456789"
  }'
```

**Example JavaScript (fetch):**
```javascript
const response = await fetch('http://localhost:3000/api/candidates/bot/register-start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    phone: '+998901234567',
    telegramId: '123456789'
  })
});

const data = await response.json();
console.log(data);
```

---

### 2. Verify

SMS kodni tasdiqlash va foydalanuvchini yaratish yoki yangilash.

**Endpoint:** `POST /api/candidates/bot/verify`

**Access:** Public (Token talab qilmaydi)

**Request Body:**
```json
{
  "phone": "+998901234567",
  "code": "12345",
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
- `code`: Required, 5-digit numeric code
- `firstName`: Required, 2-50 characters
- `lastName`: Required, 2-50 characters
- `telegramId`: Required, Telegram user ID

**Success Response (200 OK) - New Candidate:**
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
      "telegramId": "123456789"
    }
  }
}
```

**Success Response (200 OK) - Existing Candidate:**
Agar telefon raqam bazada mavjud bo'lsa, foydalanuvchi ma'lumotlari yangilanadi (agar telegramId yo'q bo'lsa) va token qaytariladi.

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
      "telegramId": "123456789"
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
curl -X POST http://localhost:3000/api/candidates/bot/verify \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+998901234567",
    "code": "12345",
    "firstName": "John",
    "lastName": "Doe",
    "telegramId": "123456789"
  }'
```

**Example JavaScript (fetch):**
```javascript
const response = await fetch('http://localhost:3000/api/candidates/bot/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phone: '+998901234567',
    code: '12345',
    firstName: 'John',
    lastName: 'Doe',
    telegramId: '123456789'
  })
});

const data = await response.json();
console.log(data);
```

---

## Bot Registration Flow Diagram

```
1. User starts registration in Telegram Bot
   ↓
2. Bot asks for firstName, lastName, phone (via button), telegramId
   ↓
3. POST /api/candidates/bot/register-start
   - Validates input
   - Checks if candidate exists (phone or telegramId)
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
   - If candidate exists (by phone), updates telegramId if needed
   - If candidate doesn't exist, creates new candidate
   - Generates JWT token
   - Returns token and candidate data
   ↓
7. Bot stores token and uses it for authenticated requests
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

1. **Telegram ID Uniqueness:** Telegram ID unique bo'lishi kerak (agar mavjud bo'lsa)
2. **Phone Number Uniqueness:** Telefon raqam unique bo'lishi kerak
3. **Code Expiration:** SMS kodi 5 daqiqada amal qiladi
4. **Registration Type:** Bot orqali ro'yxatdan o'tgan foydalanuvchilar uchun `registrationType: 'bot'` belgilanadi
5. **Existing Users:** Agar telefon raqam bazada mavjud bo'lsa, faqat telegramId yangilanadi (agar yo'q bo'lsa)

---

## Integration with Telegram Bot

Telegram bot uchun quyidagi qadamlar ketma-ketligini amalga oshirish kerak:

1. Foydalanuvchi `/start` yoki `/register` buyrug'ini yuboradi
2. Bot ism so'raydi
3. Bot familiya so'raydi
4. Bot telefon raqam so'raydi (Telegram'ning Contact button orqali)
5. Bot `/api/candidates/bot/register-start` ga so'rov yuboradi
6. Bot foydalanuvchidan SMS kodni so'raydi
7. Foydalanuvchi SMS kodni yuboradi
8. Bot `/api/candidates/bot/verify` ga so'rov yuboradi
9. Bot token ni saqlaydi va keyingi operatsiyalar uchun ishlatadi

