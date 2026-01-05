# Company CRUD API Documentation

Bu hujjat Company CRUD API endpoints va ularning ishlatilishini tushuntiradi.

## Base URL

```
http://localhost:3000/api/companies
```

## Authentication

Barcha endpointlar JWT token talab qiladi. Token `Authorization` header orqali yuboriladi:

```
Authorization: Bearer <your-token>
```

---

## Company Model

Company quyidagi maydonlarga ega:

- `name` (String, required) - Kompaniya nomi (2-200 belgi)
- `inn` (String, required, unique) - INN raqami (9 yoki 12 raqam)
- `ownerFullName` (String, required) - Kompaniya egasi ism-familiyasi (3-100 belgi)
- `ownerPhone` (String, required) - Kompaniya egasi telefon raqami
- `companyPhone` (String, required) - Kompaniya telefon raqami
- `status` (String, enum: ['active', 'inactive']) - Status (default: 'active')
- `createdAt` (Date) - Yaratilgan vaqt
- `updatedAt` (Date) - Yangilangan vaqt

---

## Endpoints

### 1. Get All Companies

Barcha kompaniyalarni olish (pagination va filter bilan).

**Endpoint:** `GET /api/companies`

**Access:** Private (JWT token talab qiladi)

**Query Parameters:**
- `status` (optional) - Filter by status: `active` yoki `inactive`
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `search` (optional) - Search in name, INN, or owner full name

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Example Request:**
```
GET /api/companies?status=active&page=1&limit=10&search=tech
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "companies": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Tech Solutions LLC",
        "inn": "123456789",
        "ownerFullName": "John Doe",
        "ownerPhone": "+998901234567",
        "companyPhone": "+998901234568",
        "status": "active",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

**Error Responses:**

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
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
curl -X GET "http://localhost:3000/api/companies?status=active&page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example JavaScript (fetch):**
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const response = await fetch('http://localhost:3000/api/companies?status=active&page=1&limit=10', {
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

### 2. Get Single Company

Bitta kompaniya ma'lumotlarini olish.

**Endpoint:** `GET /api/companies/:id`

**Access:** Private (JWT token talab qiladi)

**URL Parameters:**
- `id` - Company ID (MongoDB ObjectId)

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
    "company": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Tech Solutions LLC",
      "inn": "123456789",
      "ownerFullName": "John Doe",
      "ownerPhone": "+998901234567",
      "companyPhone": "+998901234568",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid ID:
```json
{
  "success": false,
  "message": "Invalid company ID"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Company not found"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Example cURL:**
```bash
curl -X GET http://localhost:3000/api/companies/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. Create Company

Yangi kompaniya yaratish.

**Endpoint:** `POST /api/companies`

**Access:** Private (JWT token talab qiladi)

**Request Body:**
```json
{
  "name": "Tech Solutions LLC",
  "inn": "123456789",
  "ownerFullName": "John Doe",
  "ownerPhone": "+998901234567",
  "companyPhone": "+998901234568",
  "status": "active"
}
```

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Validation Rules:**
- `name`: Required, 2-200 characters
- `inn`: Required, 9 or 12 digits, unique
- `ownerFullName`: Required, 3-100 characters
- `ownerPhone`: Required, valid phone number format
- `companyPhone`: Required, valid phone number format
- `status`: Optional, must be "active" or "inactive" (default: "active")

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Company created successfully",
  "data": {
    "company": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Tech Solutions LLC",
      "inn": "123456789",
      "ownerFullName": "John Doe",
      "ownerPhone": "+998901234567",
      "companyPhone": "+998901234568",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
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
    "Company name is required",
    "INN must be 9 or 12 digits"
  ]
}
```

**400 Bad Request** - Duplicate INN:
```json
{
  "success": false,
  "message": "Company with this INN already exists"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
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
curl -X POST http://localhost:3000/api/companies \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Solutions LLC",
    "inn": "123456789",
    "ownerFullName": "John Doe",
    "ownerPhone": "+998901234567",
    "companyPhone": "+998901234568",
    "status": "active"
  }'
```

**Example JavaScript (fetch):**
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const response = await fetch('http://localhost:3000/api/companies', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Tech Solutions LLC',
    inn: '123456789',
    ownerFullName: 'John Doe',
    ownerPhone: '+998901234567',
    companyPhone: '+998901234568',
    status: 'active'
  })
});

const data = await response.json();
console.log(data);
```

---

### 4. Update Company

Kompaniya ma'lumotlarini yangilash.

**Endpoint:** `PUT /api/companies/:id`

**Access:** Private (JWT token talab qiladi)

**URL Parameters:**
- `id` - Company ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "name": "Updated Tech Solutions LLC",
  "inn": "987654321",
  "ownerFullName": "Jane Smith",
  "ownerPhone": "+998901234569",
  "companyPhone": "+998901234570",
  "status": "inactive"
}
```

**Note:** Barcha maydonlar optional. Faqat yuborilgan maydonlar yangilanadi.

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Validation Rules:**
- `name`: Optional, 2-200 characters
- `inn`: Optional, 9 or 12 digits, unique
- `ownerFullName`: Optional, 3-100 characters
- `ownerPhone`: Optional, valid phone number format
- `companyPhone`: Optional, valid phone number format
- `status`: Optional, must be "active" or "inactive"

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Company updated successfully",
  "data": {
    "company": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Updated Tech Solutions LLC",
      "inn": "987654321",
      "ownerFullName": "Jane Smith",
      "ownerPhone": "+998901234569",
      "companyPhone": "+998901234570",
      "status": "inactive",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T11:45:00.000Z"
    }
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid ID:
```json
{
  "success": false,
  "message": "Invalid company ID"
}
```

**400 Bad Request** - Validation error:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "INN must be 9 or 12 digits"
  ]
}
```

**400 Bad Request** - Duplicate INN:
```json
{
  "success": false,
  "message": "Company with this INN already exists"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Company not found"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Example cURL:**
```bash
curl -X PUT http://localhost:3000/api/companies/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Tech Solutions LLC",
    "status": "inactive"
  }'
```

---

### 5. Delete Company

Kompaniyani o'chirish.

**Endpoint:** `DELETE /api/companies/:id`

**Access:** Private (JWT token talab qiladi)

**URL Parameters:**
- `id` - Company ID (MongoDB ObjectId)

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Company deleted successfully"
}
```

**Error Responses:**

**400 Bad Request** - Invalid ID:
```json
{
  "success": false,
  "message": "Invalid company ID"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Company not found"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
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
curl -X DELETE http://localhost:3000/api/companies/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example JavaScript (fetch):**
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const response = await fetch('http://localhost:3000/api/companies/507f1f77bcf86cd799439011', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

const data = await response.json();
console.log(data);
```

---

## Validation Details

### INN Format
- INN 9 yoki 12 raqamdan iborat bo'lishi kerak
- Faqat raqamlar qabul qilinadi
- Har bir kompaniya uchun unique bo'lishi kerak

### Phone Number Format
- Telefon raqami xalqaro formatda bo'lishi kerak
- `+` belgisi bilan boshlanishi mumkin
- Minimal 1, maksimal 15 raqam
- Format: `+998901234567` yoki `998901234567`

### Status Values
- `active` - Faol kompaniya
- `inactive` - Nofaol kompaniya

---

## Error Handling

Barcha error response lar quyidagi formatda:

```json
{
  "success": false,
  "message": "Error message description"
}
```

Validation errorlarida qo'shimcha `errors` array qaytariladi:

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "Error message 1",
    "Error message 2"
  ]
}
```

---

## Pagination

Get All Companies endpointida pagination qo'llab-quvvatlanadi:

- `page` - Joriy sahifa raqami (default: 1)
- `limit` - Har bir sahifadagi elementlar soni (default: 10)
- Response da `pagination` obyekti qaytariladi:
  - `page` - Joriy sahifa
  - `limit` - Limit
  - `total` - Jami elementlar soni
  - `pages` - Jami sahifalar soni

---

## Search Functionality

Get All Companies endpointida search funksiyasi mavjud:

- `search` query parametri orqali kompaniya nomi, INN yoki egasi ism-familiyasida qidirish mumkin
- Search case-insensitive (katta-kichik harf farqi qilmaydi)
- Example: `GET /api/companies?search=tech`

---

## Security Notes

1. **Authentication:** Barcha endpointlar JWT token talab qiladi
2. **Authorization:** Faqat autentifikatsiya qilingan adminlar kompaniyalarni boshqara oladi
3. **Validation:** Barcha input ma'lumotlar validation dan o'tadi
4. **Unique Constraints:** INN har bir kompaniya uchun unique bo'lishi kerak

