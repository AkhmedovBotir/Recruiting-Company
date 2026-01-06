# Admin Test Result API Documentation

Bu hujjat Admin uchun test natijalarini ko'rish va boshqarish API endpoints va ularning ishlatilishini tushuntiradi.

## Base URL

```
http://localhost:3000/api/admin/test-results
```

## Authentication

Barcha endpointlar JWT token talab qiladi. Token `Authorization` header orqali yuboriladi:

```
Authorization: Bearer <your-token>
```

Token admin login orqali olinadi (admin-auth.md ga qarang).

---

## Test Result Model

Test Result quyidagi maydonlarga ega:

- `candidate` (ObjectId, required) - Nomzod ID (reference to Candidate)
- `material` (ObjectId, required) - Material ID (reference to Material)
- `answers` (Array, required) - Javoblar
  - `questionIndex` (Number, required) - Savol indeksi
  - `answer` (String, required) - Foydalanuvchi javobi
  - `isCorrect` (Boolean, required) - To'g'ri yoki noto'g'ri
- `correctCount` (Number, required) - To'g'ri javoblar soni
- `incorrectCount` (Number, required) - Noto'g'ri javoblar soni
- `totalQuestions` (Number, required) - Jami savollar soni
- `score` (Number, required) - Ball (0-100)
- `createdAt` (Date) - Topshirilgan vaqt
- `updatedAt` (Date) - Yangilangan vaqt

---

## Endpoints

### 1. Get All Test Results

Barcha test natijalarini olish (pagination va filter bilan).

**Endpoint:** `GET /api/admin/test-results`

**Access:** Private (Admin JWT token talab qiladi)

**Query Parameters:**
- `candidateId` (optional) - Filter by candidate ID
- `materialId` (optional) - Filter by material ID
- `vacancyId` (optional) - Filter by vacancy ID
- `minScore` (optional) - Minimum score filter
- `maxScore` (optional) - Maximum score filter
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
    "testResults": [
      {
        "id": "507f1f77bcf86cd799439051",
        "material": {
          "id": "507f1f77bcf86cd799439031",
          "title": "JavaScript Asoslari",
          "description": "JavaScript dasturlash tilining asosiy tushunchalari",
          "vacancy": {
            "_id": "507f1f77bcf86cd799439011",
            "title": "Senior Full Stack Developer",
            "department": "IT",
            "position": "Senior Developer",
            "company": {
              "_id": "507f1f77bcf86cd799439012",
              "name": "Tech Solutions LLC",
              "inn": "123456789"
            }
          }
        },
        "candidate": {
          "id": "507f1f77bcf86cd799439013",
          "firstName": "John",
          "lastName": "Doe",
          "phone": "+998901234567",
          "telegramId": "123456789"
        },
        "correctCount": 8,
        "incorrectCount": 2,
        "totalQuestions": 10,
        "score": 80,
        "submittedAt": "2024-01-15T14:30:00.000Z",
        "updatedAt": "2024-01-15T14:30:00.000Z"
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
curl -X GET "http://localhost:3000/api/admin/test-results?candidateId=507f1f77bcf86cd799439013&page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 2. Get Single Test Result

Bitta test natijasini batafsil ko'rish (savollar, javoblar va application ma'lumotlari bilan).

**Endpoint:** `GET /api/admin/test-results/:id`

**Access:** Private (Admin JWT token talab qiladi)

**URL Parameters:**
- `id` - Test Result ID (MongoDB ObjectId)

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
    "testResult": {
      "id": "507f1f77bcf86cd799439051",
      "material": {
        "id": "507f1f77bcf86cd799439031",
        "title": "JavaScript Asoslari",
        "description": "JavaScript dasturlash tilining asosiy tushunchalari",
        "vacancy": {
          "_id": "507f1f77bcf86cd799439011",
          "title": "Senior Full Stack Developer",
          "department": "IT",
          "position": "Senior Developer",
          "company": {
            "_id": "507f1f77bcf86cd799439012",
            "name": "Tech Solutions LLC",
            "inn": "123456789",
            "ownerFullName": "John Doe",
            "companyPhone": "+998901234568"
          }
        }
      },
      "candidate": {
        "id": "507f1f77bcf86cd799439013",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+998901234567",
        "telegramId": "123456789",
        "registrationType": "web"
      },
      "correctCount": 8,
      "incorrectCount": 2,
      "totalQuestions": 10,
      "score": 80,
      "answers": [
        {
          "questionIndex": 0,
          "question": "JavaScript da qanday o'zgaruvchi e'lon qilinadi?",
          "options": ["var, let, const", "variable", "var", "let"],
          "correctAnswer": "A",
          "userAnswer": "A",
          "isCorrect": true
        },
        {
          "questionIndex": 1,
          "question": "Array metodlari qaysilar?",
          "options": ["map, filter, reduce", "for, while", "if, else", "function"],
          "correctAnswer": "A",
          "userAnswer": "B",
          "isCorrect": false
        }
      ],
      "application": {
        "_id": "507f1f77bcf86cd799439021",
        "status": "passed",
        "notes": "Good performance"
      },
      "submittedAt": "2024-01-15T14:30:00.000Z",
      "updatedAt": "2024-01-15T14:30:00.000Z"
    }
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid ID:
```json
{
  "success": false,
  "message": "Invalid test result ID"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Test result not found"
}
```

**Example cURL:**
```bash
curl -X GET http://localhost:3000/api/admin/test-results/507f1f77bcf86cd799439051 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. Get Test Results by Candidate

Muayyan nomzodning barcha test natijalarini olish.

**Endpoint:** `GET /api/admin/test-results/candidate/:candidateId`

**Access:** Private (Admin JWT token talab qiladi)

**URL Parameters:**
- `candidateId` - Candidate ID (MongoDB ObjectId)

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
    "candidate": {
      "id": "507f1f77bcf86cd799439013",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+998901234567"
    },
    "testResults": [
      {
        "id": "507f1f77bcf86cd799439051",
        "material": {
          "id": "507f1f77bcf86cd799439031",
          "title": "JavaScript Asoslari",
          "description": "JavaScript dasturlash tilining asosiy tushunchalari",
          "vacancy": {
            "_id": "507f1f77bcf86cd799439011",
            "title": "Senior Full Stack Developer",
            "department": "IT",
            "position": "Senior Developer",
            "company": {
              "_id": "507f1f77bcf86cd799439012",
              "name": "Tech Solutions LLC",
              "inn": "123456789"
            }
          }
        },
        "correctCount": 8,
        "incorrectCount": 2,
        "totalQuestions": 10,
        "score": 80,
        "submittedAt": "2024-01-15T14:30:00.000Z",
        "updatedAt": "2024-01-15T14:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3,
      "pages": 1
    }
  }
}
```

**Error Responses:**

**404 Not Found** - Candidate not found:
```json
{
  "success": false,
  "message": "Candidate not found"
}
```

**Example cURL:**
```bash
curl -X GET "http://localhost:3000/api/admin/test-results/candidate/507f1f77bcf86cd799439013?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 4. Get Test Results by Material

Muayyan material uchun barcha nomzodlarning test natijalarini olish.

**Endpoint:** `GET /api/admin/test-results/material/:materialId`

**Access:** Private (Admin JWT token talab qiladi)

**URL Parameters:**
- `materialId` - Material ID (MongoDB ObjectId)

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `minScore` (optional) - Minimum score filter
- `maxScore` (optional) - Maximum score filter

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
    "material": {
      "id": "507f1f77bcf86cd799439031",
      "title": "JavaScript Asoslari",
      "description": "JavaScript dasturlash tilining asosiy tushunchalari"
    },
    "testResults": [
      {
        "id": "507f1f77bcf86cd799439051",
        "candidate": {
          "id": "507f1f77bcf86cd799439013",
          "firstName": "John",
          "lastName": "Doe",
          "phone": "+998901234567",
          "telegramId": "123456789"
        },
        "correctCount": 8,
        "incorrectCount": 2,
        "totalQuestions": 10,
        "score": 80,
        "submittedAt": "2024-01-15T14:30:00.000Z",
        "updatedAt": "2024-01-15T14:30:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439052",
        "candidate": {
          "id": "507f1f77bcf86cd799439014",
          "firstName": "Jane",
          "lastName": "Smith",
          "phone": "+998901234568",
          "telegramId": "987654321"
        },
        "correctCount": 9,
        "incorrectCount": 1,
        "totalQuestions": 10,
        "score": 90,
        "submittedAt": "2024-01-15T15:00:00.000Z",
        "updatedAt": "2024-01-15T15:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "pages": 2
    }
  }
}
```

**Note:** Natijalar ball bo'yicha kamayish tartibida saralanadi (eng yuqori ball birinchi).

**Error Responses:**

**404 Not Found** - Material not found:
```json
{
  "success": false,
  "message": "Material not found"
}
```

**Example cURL:**
```bash
curl -X GET "http://localhost:3000/api/admin/test-results/material/507f1f77bcf86cd799439031?minScore=70&maxScore=100&page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 5. Get Test Results by Vacancy

Muayyan vakansiya uchun barcha test natijalarini olish.

**Endpoint:** `GET /api/admin/test-results/vacancy/:vacancyId`

**Access:** Private (Admin JWT token talab qiladi)

**URL Parameters:**
- `vacancyId` - Vacancy ID (MongoDB ObjectId)

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
    "vacancy": {
      "id": "507f1f77bcf86cd799439011",
      "title": "Senior Full Stack Developer",
      "department": "IT",
      "position": "Senior Developer"
    },
    "testResults": [
      {
        "id": "507f1f77bcf86cd799439051",
        "material": {
          "id": "507f1f77bcf86cd799439031",
          "title": "JavaScript Asoslari",
          "description": "JavaScript dasturlash tilining asosiy tushunchalari"
        },
        "candidate": {
          "id": "507f1f77bcf86cd799439013",
          "firstName": "John",
          "lastName": "Doe",
          "phone": "+998901234567",
          "telegramId": "123456789"
        },
        "correctCount": 8,
        "incorrectCount": 2,
        "totalQuestions": 10,
        "score": 80,
        "submittedAt": "2024-01-15T14:30:00.000Z",
        "updatedAt": "2024-01-15T14:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 8,
      "pages": 1
    }
  }
}
```

**Error Responses:**

**404 Not Found** - Vacancy not found:
```json
{
  "success": false,
  "message": "Vacancy not found"
}
```

**Example cURL:**
```bash
curl -X GET "http://localhost:3000/api/admin/test-results/vacancy/507f1f77bcf86cd799439011?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Filtering

Get All Test Results endpointida quyidagi filterlar mavjud:

- `candidateId` - Nomzod ID bo'yicha filter
- `materialId` - Material ID bo'yicha filter
- `vacancyId` - Vakansiya ID bo'yicha filter
- `minScore` - Minimum ball filter
- `maxScore` - Maximum ball filter

Example: `GET /api/admin/test-results?candidateId=507f1f77bcf86cd799439013&minScore=70&maxScore=100`

---

## Pagination

Barcha list endpointlarida pagination qo'llab-quvvatlanadi:

- `page` - Joriy sahifa raqami (default: 1)
- `limit` - Har bir sahifadagi elementlar soni (default: 10)
- Response da `pagination` obyekti qaytariladi:
  - `page` - Joriy sahifa
  - `limit` - Limit
  - `total` - Jami elementlar soni
  - `pages` - Jami sahifalar soni

---

## Security Notes

1. **Authentication:** Barcha endpointlar JWT token talab qiladi
2. **Authorization:** Faqat autentifikatsiya qilingan adminlar test natijalarini ko'ra oladi
3. **Full Access:** Adminlar barcha nomzodlarning test natijalarini ko'ra oladi

---

## Error Handling

Barcha error response lar quyidagi formatda:

```json
{
  "success": false,
  "message": "Error message description"
}
```

---

## Important Notes

1. **Application Integration:** Get Single Test Result endpointida nomzodning application ma'lumotlari ham qaytariladi (agar mavjud bo'lsa)
2. **Detailed Answers:** Barcha savollar, variantlar va to'g'ri javoblar ko'rsatiladi
3. **Score Sorting:** Get Test Results by Material endpointida natijalar ball bo'yicha kamayish tartibida saralanadi
4. **Multiple Filters:** Bir nechta filterlar bir vaqtning o'zida qo'llanilishi mumkin

---

## Frontend Integration Example

```javascript
// Get all test results with filters
async function getTestResults(filters = {}) {
  const token = localStorage.getItem('adminToken');
  const params = new URLSearchParams(filters);
  const response = await fetch(`http://localhost:3000/api/admin/test-results?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  const data = await response.json();
  return data;
}

// Get test results by candidate
async function getTestResultsByCandidate(candidateId) {
  const token = localStorage.getItem('adminToken');
  const response = await fetch(`http://localhost:3000/api/admin/test-results/candidate/${candidateId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  const data = await response.json();
  return data;
}

// Get test results by material
async function getTestResultsByMaterial(materialId, filters = {}) {
  const token = localStorage.getItem('adminToken');
  const params = new URLSearchParams(filters);
  const response = await fetch(`http://localhost:3000/api/admin/test-results/material/${materialId}?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  const data = await response.json();
  return data;
}

// Get test results by vacancy
async function getTestResultsByVacancy(vacancyId) {
  const token = localStorage.getItem('adminToken');
  const response = await fetch(`http://localhost:3000/api/admin/test-results/vacancy/${vacancyId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  const data = await response.json();
  return data;
}
```

