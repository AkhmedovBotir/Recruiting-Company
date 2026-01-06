# Web Test Result API Documentation

Bu hujjat Web sayt uchun test natijalarini ko'rish API endpoints va ularning ishlatilishini tushuntiradi.

## Base URL

```
http://localhost:3000/api/web/test-results
```

## Authentication

Barcha endpointlar JWT token talab qiladi. Token `Authorization` header orqali yuboriladi:

```
Authorization: Bearer <your-token>
```

Token candidate login yoki registration orqali olinadi (candidate-web-api.md ga qarang).

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

### 1. Get My Test Results

Joriy nomzodning barcha test natijalarini olish.

**Endpoint:** `GET /api/web/test-results`

**Access:** Private (JWT token talab qiladi)

**Query Parameters:**
- `materialId` (optional) - Filter by material ID
- `vacancyId` (optional) - Filter by vacancy ID
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
          "phone": "+998901234567"
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
      "total": 5,
      "pages": 1
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
curl -X GET "http://localhost:3000/api/web/test-results?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example JavaScript (fetch):**
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const response = await fetch('http://localhost:3000/api/web/test-results?page=1&limit=10', {
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

### 2. Get Single Test Result

Bitta test natijasini batafsil ko'rish (savollar va javoblar bilan).

**Endpoint:** `GET /api/web/test-results/:id`

**Access:** Private (JWT token talab qiladi)

**URL Parameters:**
- `id` - Test Result ID (MongoDB ObjectId)

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Note:** Faqat joriy nomzodning o'z test natijalarini ko'rish mumkin.

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
            "inn": "123456789"
          }
        }
      },
      "candidate": {
        "id": "507f1f77bcf86cd799439013",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+998901234567"
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

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Example cURL:**
```bash
curl -X GET http://localhost:3000/api/web/test-results/507f1f77bcf86cd799439051 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. Get Test Result by Material

Muayyan material uchun test natijasini olish.

**Endpoint:** `GET /api/web/test-results/material/:materialId`

**Access:** Private (JWT token talab qiladi)

**URL Parameters:**
- `materialId` - Material ID (MongoDB ObjectId)

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
            "inn": "123456789"
          }
        }
      },
      "correctCount": 8,
      "incorrectCount": 2,
      "totalQuestions": 10,
      "score": 80,
      "answers": [
        {
          "questionIndex": 0,
          "answer": "A",
          "isCorrect": true
        },
        {
          "questionIndex": 1,
          "answer": "B",
          "isCorrect": false
        }
      ],
      "submittedAt": "2024-01-15T14:30:00.000Z",
      "updatedAt": "2024-01-15T14:30:00.000Z"
    }
  }
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "success": false,
  "message": "Test result not found for this material"
}
```

**Example cURL:**
```bash
curl -X GET http://localhost:3000/api/web/test-results/material/507f1f77bcf86cd799439031 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Filtering

Get My Test Results endpointida quyidagi filterlar mavjud:

- `materialId` - Material ID bo'yicha filter
- `vacancyId` - Vakansiya ID bo'yicha filter

Example: `GET /api/web/test-results?materialId=507f1f77bcf86cd799439031&vacancyId=507f1f77bcf86cd799439011`

---

## Pagination

Get My Test Results endpointida pagination qo'llab-quvvatlanadi:

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
2. **Authorization:** Faqat joriy nomzodning o'z test natijalarini ko'rish mumkin
3. **Own Results Only:** Nomzod faqat o'z test natijalarini ko'ra oladi

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

1. **One Test Per Material:** Bir nomzod bir material uchun faqat bir marta test topshiradi
2. **Detailed Answers:** Get Single Test Result endpointida barcha savollar, variantlar va to'g'ri javoblar ko'rsatiladi
3. **Score Calculation:** Ball foiz sifatida hisoblanadi: (to'g'ri javoblar / jami savollar) * 100

---

## Frontend Integration Example

```javascript
// Get all my test results
async function getMyTestResults(filters = {}) {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams(filters);
  const response = await fetch(`http://localhost:3000/api/web/test-results?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  const data = await response.json();
  return data;
}

// Get single test result with details
async function getTestResult(testResultId) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3000/api/web/test-results/${testResultId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  const data = await response.json();
  return data;
}

// Get test result by material
async function getTestResultByMaterial(materialId) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3000/api/web/test-results/material/${materialId}`, {
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

