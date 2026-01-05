# Vacancy CRUD API Documentation

Bu hujjat Vacancy CRUD API endpoints va ularning ishlatilishini tushuntiradi.

## Base URL

```
http://localhost:3000/api/vacancies
```

## Authentication

Barcha endpointlar JWT token talab qiladi. Token `Authorization` header orqali yuboriladi:

```
Authorization: Bearer <your-token>
```

---

## Vacancy Model

Vacancy quyidagi maydonlarga ega:

- `company` (ObjectId, required) - Kompaniya ID (reference to Company)
- `title` (String, required) - Vakansiya nomi (3-200 belgi)
- `department` (String, optional) - Bo'lim nomi (max 100 belgi)
- `position` (String, optional) - Lavozim nomi (max 100 belgi)
- `experience` (String, required) - Tajriba
- `workType` (String, enum: ['fulltime', 'parttime'], required) - Ish turi
- `minAge` (Number, required) - Minimum yosh (18-100)
- `maxAge` (Number, required) - Maximum yosh (18-100, minAge dan katta bo'lishi kerak)
- `salary` (String, required) - Oylik
- `description` (String, required) - Tavsif
- `responsibilities` (String, required) - Majburiyatlar
- `preferences` (String, required) - Afzalliklar
- `skills` (Array[String], required) - Ko'nikmalar (kamida 1 ta)
- `status` (String, enum: ['active', 'close']) - Status (default: 'active')
- `createdAt` (Date) - Yaratilgan vaqt
- `updatedAt` (Date) - Yangilangan vaqt

---

## Endpoints

### 1. Get All Vacancies

Barcha vakansiyalarni olish (pagination va filter bilan).

**Endpoint:** `GET /api/vacancies`

**Access:** Private (JWT token talab qiladi)

**Query Parameters:**
- `status` (optional) - Filter by status: `active` yoki `close`
- `workType` (optional) - Filter by work type: `fulltime` yoki `parttime`
- `company` (optional) - Filter by company ID
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `search` (optional) - Search in title, department, or position

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Example Request:**
```
GET /api/vacancies?status=active&workType=fulltime&page=1&limit=10&search=developer
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "vacancies": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "company": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Tech Solutions LLC",
          "inn": "123456789"
        },
        "title": "Senior Full Stack Developer",
        "department": "IT",
        "position": "Senior Developer",
        "experience": "3+ years",
        "workType": "fulltime",
        "minAge": 25,
        "maxAge": 45,
        "salary": "5000000",
        "description": "We are looking for an experienced full stack developer...",
        "responsibilities": "Develop and maintain web applications...",
        "preferences": "Experience with Node.js and React...",
        "skills": ["Node.js", "React", "MongoDB", "Express"],
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
curl -X GET "http://localhost:3000/api/vacancies?status=active&page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example JavaScript (fetch):**
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const response = await fetch('http://localhost:3000/api/vacancies?status=active&page=1&limit=10', {
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

### 2. Get Single Vacancy

Bitta vakansiya ma'lumotlarini olish.

**Endpoint:** `GET /api/vacancies/:id`

**Access:** Private (JWT token talab qiladi)

**URL Parameters:**
- `id` - Vacancy ID (MongoDB ObjectId)

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
      "_id": "507f1f77bcf86cd799439011",
      "company": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Tech Solutions LLC",
        "inn": "123456789",
        "ownerFullName": "John Doe",
        "companyPhone": "+998901234568"
      },
      "title": "Senior Full Stack Developer",
      "department": "IT",
      "position": "Senior Developer",
      "experience": "3+ years",
      "workType": "fulltime",
      "minAge": 25,
      "maxAge": 45,
      "salary": "5000000",
      "description": "We are looking for an experienced full stack developer...",
      "responsibilities": "Develop and maintain web applications...",
      "preferences": "Experience with Node.js and React...",
      "skills": ["Node.js", "React", "MongoDB", "Express"],
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
  "message": "Invalid vacancy ID"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Vacancy not found"
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
curl -X GET http://localhost:3000/api/vacancies/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. Create Vacancy

Yangi vakansiya yaratish.

**Endpoint:** `POST /api/vacancies`

**Access:** Private (JWT token talab qiladi)

**Request Body:**
```json
{
  "company": "507f1f77bcf86cd799439012",
  "title": "Senior Full Stack Developer",
  "department": "IT",
  "position": "Senior Developer",
  "experience": "3+ years",
  "workType": "fulltime",
  "minAge": 25,
  "maxAge": 45,
  "salary": 5000000,
  "description": "We are looking for an experienced full stack developer to join our team.",
  "responsibilities": "Develop and maintain web applications, collaborate with team members, write clean code.",
  "preferences": "Experience with Node.js and React, good communication skills.",
  "skills": ["Node.js", "React", "MongoDB", "Express"],
  "status": "active"
}
```

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Validation Rules:**
- `company`: Required, valid MongoDB ObjectId, must exist
- `title`: Required, 3-200 characters
- `department`: Optional, max 100 characters
- `position`: Optional, max 100 characters
- `experience`: Required
- `workType`: Required, must be "fulltime" or "parttime"
- `minAge`: Required, 18-100
- `maxAge`: Required, 18-100, must be greater than minAge
- `salary`: Required, string
- `description`: Required
- `responsibilities`: Required
- `preferences`: Required
- `skills`: Required, array with at least 1 item
- `status`: Optional, must be "active" or "close" (default: "active")

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Vacancy created successfully",
  "data": {
    "vacancy": {
      "_id": "507f1f77bcf86cd799439011",
      "company": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Tech Solutions LLC",
        "inn": "123456789"
      },
      "title": "Senior Full Stack Developer",
      "department": "IT",
      "position": "Senior Developer",
      "experience": "3+ years",
      "workType": "fulltime",
      "minAge": 25,
      "maxAge": 45,
      "salary": "5000000",
      "description": "We are looking for an experienced full stack developer to join our team.",
      "responsibilities": "Develop and maintain web applications, collaborate with team members, write clean code.",
      "preferences": "Experience with Node.js and React, good communication skills.",
      "skills": ["Node.js", "React", "MongoDB", "Express"],
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
    "Vacancy title is required",
    "Maximum age must be greater than minimum age"
  ]
}
```

**404 Not Found** - Company not found:
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
curl -X POST http://localhost:3000/api/vacancies \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "company": "507f1f77bcf86cd799439012",
    "title": "Senior Full Stack Developer",
    "department": "IT",
    "position": "Senior Developer",
    "experience": "3+ years",
    "workType": "fulltime",
    "minAge": 25,
    "maxAge": 45,
    "salary": "5000000",
    "description": "We are looking for an experienced full stack developer.",
    "responsibilities": "Develop and maintain web applications.",
    "preferences": "Experience with Node.js and React.",
    "skills": ["Node.js", "React", "MongoDB"],
    "status": "active"
  }'
```

**Example JavaScript (fetch):**
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const response = await fetch('http://localhost:3000/api/vacancies', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    company: '507f1f77bcf86cd799439012',
    title: 'Senior Full Stack Developer',
    department: 'IT',
    position: 'Senior Developer',
    experience: '3+ years',
    workType: 'fulltime',
    minAge: 25,
    maxAge: 45,
    salary: "5000000",
    description: 'We are looking for an experienced full stack developer.',
    responsibilities: 'Develop and maintain web applications.',
    preferences: 'Experience with Node.js and React.',
    skills: ['Node.js', 'React', 'MongoDB'],
    status: 'active'
  })
});

const data = await response.json();
console.log(data);
```

---

### 4. Update Vacancy

Vakansiya ma'lumotlarini yangilash.

**Endpoint:** `PUT /api/vacancies/:id`

**Access:** Private (JWT token talab qiladi)

**URL Parameters:**
- `id` - Vacancy ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "title": "Updated Senior Full Stack Developer",
  "salary": "6000000",
  "status": "active"
}
```

**Note:** Barcha maydonlar optional. Faqat yuborilgan maydonlar yangilanadi.

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Validation Rules:**
- Barcha maydonlar optional, lekin yuborilganda validation dan o'tishi kerak
- `maxAge` har doim `minAge` dan katta bo'lishi kerak

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Vacancy updated successfully",
  "data": {
    "vacancy": {
      "_id": "507f1f77bcf86cd799439011",
      "company": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Tech Solutions LLC",
        "inn": "123456789"
      },
      "title": "Updated Senior Full Stack Developer",
      "department": "IT",
      "position": "Senior Developer",
      "experience": "3+ years",
      "workType": "fulltime",
      "minAge": 25,
      "maxAge": 45,
      "salary": "6000000",
      "description": "We are looking for an experienced full stack developer to join our team.",
      "responsibilities": "Develop and maintain web applications, collaborate with team members, write clean code.",
      "preferences": "Experience with Node.js and React, good communication skills.",
      "skills": ["Node.js", "React", "MongoDB", "Express"],
      "status": "active",
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
  "message": "Invalid vacancy ID"
}
```

**400 Bad Request** - Validation error:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "Maximum age must be greater than minimum age"
  ]
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Vacancy not found"
}
```

**404 Not Found** - Company not found (if updating company):
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
curl -X PUT http://localhost:3000/api/vacancies/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Senior Full Stack Developer",
    "salary": "6000000"
  }'
```

---

### 5. Close Vacancy

Vakansiyani yopish (status ni 'close' ga o'zgartirish).

**Endpoint:** `PATCH /api/vacancies/:id/close`

**Access:** Private (JWT token talab qiladi)

**URL Parameters:**
- `id` - Vacancy ID (MongoDB ObjectId)

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Vacancy closed successfully",
  "data": {
    "vacancy": {
      "_id": "507f1f77bcf86cd799439011",
      "company": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Tech Solutions LLC",
        "inn": "123456789"
      },
      "title": "Senior Full Stack Developer",
      "status": "close",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T12:00:00.000Z"
    }
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid ID:
```json
{
  "success": false,
  "message": "Invalid vacancy ID"
}
```

**400 Bad Request** - Already closed:
```json
{
  "success": false,
  "message": "Vacancy is already closed"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Vacancy not found"
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
curl -X PATCH http://localhost:3000/api/vacancies/507f1f77bcf86cd799439011/close \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example JavaScript (fetch):**
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const response = await fetch('http://localhost:3000/api/vacancies/507f1f77bcf86cd799439011/close', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

const data = await response.json();
console.log(data);
```

---

### 6. Delete Vacancy

Vakansiyani o'chirish.

**Endpoint:** `DELETE /api/vacancies/:id`

**Access:** Private (JWT token talab qiladi)

**URL Parameters:**
- `id` - Vacancy ID (MongoDB ObjectId)

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Vacancy deleted successfully"
}
```

**Error Responses:**

**400 Bad Request** - Invalid ID:
```json
{
  "success": false,
  "message": "Invalid vacancy ID"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Vacancy not found"
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
curl -X DELETE http://localhost:3000/api/vacancies/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example JavaScript (fetch):**
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const response = await fetch('http://localhost:3000/api/vacancies/507f1f77bcf86cd799439011', {
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

### Work Type Values
- `fulltime` - To'liq ish kuni
- `parttime` - Qisman ish kuni

### Status Values
- `active` - Faol vakansiya
- `close` - Yopilgan vakansiya

### Age Validation
- `minAge` va `maxAge` 18-100 orasida bo'lishi kerak
- `maxAge` har doim `minAge` dan katta bo'lishi kerak

### Skills Array
- Skills array bo'lishi kerak
- Kamida 1 ta skill bo'lishi kerak
- Har bir skill string bo'lishi kerak

### Company Reference
- Company ID valid MongoDB ObjectId bo'lishi kerak
- Company mavjud bo'lishi kerak (database da)

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

Get All Vacancies endpointida pagination qo'llab-quvvatlanadi:

- `page` - Joriy sahifa raqami (default: 1)
- `limit` - Har bir sahifadagi elementlar soni (default: 10)
- Response da `pagination` obyekti qaytariladi:
  - `page` - Joriy sahifa
  - `limit` - Limit
  - `total` - Jami elementlar soni
  - `pages` - Jami sahifalar soni

---

## Search Functionality

Get All Vacancies endpointida search funksiyasi mavjud:

- `search` query parametri orqali vakansiya nomi, bo'lim yoki lavozim nomida qidirish mumkin
- Search case-insensitive (katta-kichik harf farqi qilmaydi)
- Example: `GET /api/vacancies?search=developer`

---

## Filtering

Get All Vacancies endpointida quyidagi filterlar mavjud:

- `status` - Vakansiya statusi bo'yicha filter (active/close)
- `workType` - Ish turi bo'yicha filter (fulltime/parttime)
- `company` - Kompaniya ID bo'yicha filter

Example: `GET /api/vacancies?status=active&workType=fulltime&company=507f1f77bcf86cd799439012`

---

## Security Notes

1. **Authentication:** Barcha endpointlar JWT token talab qiladi
2. **Authorization:** Faqat autentifikatsiya qilingan adminlar vakansiyalarni boshqara oladi
3. **Validation:** Barcha input ma'lumotlar validation dan o'tadi
4. **Company Validation:** Company mavjudligi tekshiriladi
5. **Age Validation:** maxAge > minAge tekshiriladi

---

## Relationship with Company

Har bir vakansiya bitta kompaniyaga tegishli. Company ma'lumotlari populate qilinadi:

- Get All Vacancies: Company nomi va INN ko'rsatiladi
- Get Single Vacancy: Company to'liq ma'lumotlari ko'rsatiladi (nom, INN, egasi ism-familiyasi, telefon)

