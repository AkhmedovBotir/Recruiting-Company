# Admin Authentication API Documentation

Bu hujjat Admin Authentication API endpoints va ularning ishlatilishini tushuntiradi.

## Base URL

```
http://localhost:3000/api/admin
```

## Authentication

Ba'zi endpointlar JWT token talab qiladi. Token `Authorization` header orqali yuboriladi:

```
Authorization: Bearer <your-token>
```

---

## Endpoints

### 1. Admin Login

Admin tizimga kirish uchun login endpoint.

**Endpoint:** `POST /api/admin/login`

**Access:** Public (Token talab qilmaydi)

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Request Headers:**
```
Content-Type: application/json
```

**Validation Rules:**
- `username`: Required, minimum 3 characters, maximum 30 characters
- `password`: Required, minimum 6 characters

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "507f1f77bcf86cd799439011",
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin"
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
      "msg": "Username is required",
      "param": "username",
      "location": "body"
    }
  ]
}
```

**401 Unauthorized** - Invalid credentials:
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**401 Unauthorized** - Account deactivated:
```json
{
  "success": false,
  "message": "Admin account is deactivated"
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
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'
```

**Example JavaScript (fetch):**
```javascript
const response = await fetch('http://localhost:3000/api/admin/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'password123'
  })
});

const data = await response.json();
console.log(data);
```

---

### 2. Get Current Admin

Joriy autentifikatsiya qilingan admin ma'lumotlarini olish.

**Endpoint:** `GET /api/admin/me`

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
    "admin": {
      "id": "507f1f77bcf86cd799439011",
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**

**401 Unauthorized** - Token yo'q yoki noto'g'ri:
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**401 Unauthorized** - Admin topilmadi:
```json
{
  "success": false,
  "message": "Admin not found"
}
```

**401 Unauthorized** - Account deaktivatsiya qilingan:
```json
{
  "success": false,
  "message": "Admin account is deactivated"
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
curl -X GET http://localhost:3000/api/admin/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example JavaScript (fetch):**
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const response = await fetch('http://localhost:3000/api/admin/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

const data = await response.json();
console.log(data);
```

---

## Authentication Flow

1. **Login:** Admin `POST /api/admin/login` endpoint orqali username va password yuboradi
2. **Get Token:** Muvaffaqiyatli login bo'lsa, server JWT token qaytaradi
3. **Use Token:** Keyingi so'rovlarda token `Authorization: Bearer <token>` header orqali yuboriladi
4. **Token Validation:** Server har bir protected endpoint da token ni tekshiradi

## Token Structure

JWT token quyidagi ma'lumotlarni o'z ichiga oladi:

```json
{
  "id": "507f1f77bcf86cd799439011",
  "iat": 1705312800,
  "exp": 1705917600
}
```

- `id`: Admin ID
- `iat`: Token yaratilgan vaqt (timestamp)
- `exp`: Token muddati (timestamp)

## Token Expiration

Token muddati `.env` faylidagi `JWT_EXPIRE` o'zgaruvchisi bilan belgilanadi. Default: `7d` (7 kun).

Token muddati tugagach, yangi login qilish kerak.

## Error Handling

Barcha error response lar quyidagi formatda:

```json
{
  "success": false,
  "message": "Error message description"
}
```

Validation errorlarida qo'shimcha `errors` array qaytariladi.

## Security Notes

1. **Password:** Passwordlar bcryptjs orqali hash qilinadi va database da saqlanmaydi
2. **Token:** Token ni xavfsiz joyda saqlang (localStorage, httpOnly cookie, yoki secure storage)
3. **HTTPS:** Production da mutlaqo HTTPS ishlatish kerak
4. **Secret Key:** `JWT_SECRET` ni kuchli va maxfiy saqlang
5. **Token Expiration:** Token muddatini qisqa tutish tavsiya etiladi

## Admin Roles

Hozirda quyidagi rollar mavjud:

- `admin` - Oddiy admin
- `super_admin` - Super admin

Role `createAdmin` script orqali yoki to'g'ridan-to'g'ri database da belgilanadi.

