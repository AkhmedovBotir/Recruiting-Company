# Web Interview API Documentation

Bu hujjat Web sayt uchun nomzodlarning o'z suhbatlarini ko'rish API endpoints va ularning ishlatilishini tushuntiradi.

## Base URL

```
http://localhost:3000/api/web/interviews
```

## Authentication

Barcha endpointlar JWT token talab qiladi. Token `Authorization` header orqali yuboriladi:

```
Authorization: Bearer <your-token>
```

Token candidate login yoki registration orqali olinadi (candidate-web-api.md ga qarang).

---

## Interview Model

Interview quyidagi maydonlarga ega:

- `candidate` (ObjectId, required) - Nomzod ID (reference to Candidate)
- `vacancy` (ObjectId, required) - Vakansiya ID (reference to Vacancy)
- `application` (ObjectId, optional) - Application ID (reference to Application)
- `content` (String, required) - Suhbat mazmuni
- `interviewer` (String, required) - Suhbat o'tkazuvchi
- `location` (String, required) - Suhbat joyi
- `date` (Date, required) - Suhbat kuni
- `time` (String, required) - Suhbat vaqti (HH:MM format)
- `status` (String, enum: ['scheduled', 'completed', 'cancelled']) - Status
- `result` (String, enum: ['passed', 'failed', 'pending']) - Natija
- `evaluations` (Array) - Baxolashlar
  - `admin` (ObjectId, required) - Admin ID
  - `text` (String, required) - Baxolash matni
  - `rating` (Number, required) - Baxo (1-10)
  - `createdAt` (Date) - Yaratilgan vaqt
- `createdAt` (Date) - Yaratilgan vaqt
- `updatedAt` (Date) - Yangilangan vaqt

---

## Endpoints

### 1. Get My Interviews

Joriy nomzodning barcha suhbatlarini olish.

**Endpoint:** `GET /api/web/interviews`

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
        "_id": "507f1f77bcf86cd799439061",
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
        },
        "content": "JavaScript va React bo'yicha texnik suhbat",
        "interviewer": "Ahmadjon Karimov",
        "location": "Zoom: https://zoom.us/j/123456789",
        "date": "2024-01-20T00:00:00.000Z",
        "time": "14:00",
        "status": "scheduled",
        "result": "pending",
        "evaluations": [],
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439062",
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
        },
        "content": "JavaScript va React bo'yicha texnik suhbat",
        "interviewer": "Ahmadjon Karimov",
        "location": "Zoom: https://zoom.us/j/123456789",
        "date": "2024-01-18T00:00:00.000Z",
        "time": "10:00",
        "status": "completed",
        "result": "passed",
        "evaluations": [
          {
            "_id": "507f1f77bcf86cd799439063",
            "admin": {
              "_id": "507f1f77bcf86cd799439001",
              "username": "admin"
            },
            "text": "Yaxshi bilimga ega, muammolarni hal qilish qobiliyati yuqori. Kommunikatsiya qobiliyati yaxshi.",
            "rating": 8,
            "createdAt": "2024-01-18T12:00:00.000Z"
          },
          {
            "_id": "507f1f77bcf86cd799439064",
            "admin": {
              "_id": "507f1f77bcf86cd799439002",
              "username": "admin2"
            },
            "text": "Texnik bilimlar yaxshi, lekin tajriba yetarli emas.",
            "rating": 6,
            "createdAt": "2024-01-18T12:30:00.000Z"
          }
        ],
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-18T12:30:00.000Z"
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
curl -X GET "http://localhost:3000/api/web/interviews?status=scheduled&page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example JavaScript (fetch):**
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const response = await fetch('http://localhost:3000/api/web/interviews?status=scheduled&page=1&limit=10', {
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

### 2. Get Single Interview

Bitta suhbatni batafsil ko'rish (baxolashlar bilan).

**Endpoint:** `GET /api/web/interviews/:id`

**Access:** Private (JWT token talab qiladi)

**URL Parameters:**
- `id` - Interview ID (MongoDB ObjectId)

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Note:** Faqat joriy nomzodning o'z suhbatlarini ko'rish mumkin.

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "interview": {
      "_id": "507f1f77bcf86cd799439061",
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
      },
      "content": "JavaScript va React bo'yicha texnik suhbat",
      "interviewer": "Ahmadjon Karimov",
      "location": "Zoom: https://zoom.us/j/123456789",
      "date": "2024-01-20T00:00:00.000Z",
      "time": "14:00",
      "status": "completed",
      "result": "passed",
      "evaluations": [
        {
          "_id": "507f1f77bcf86cd799439062",
          "admin": {
            "_id": "507f1f77bcf86cd799439001",
            "username": "admin"
          },
          "text": "Yaxshi bilimga ega, muammolarni hal qilish qobiliyati yuqori. Kommunikatsiya qobiliyati yaxshi.",
          "rating": 8,
          "createdAt": "2024-01-20T15:00:00.000Z"
        },
        {
          "_id": "507f1f77bcf86cd799439063",
          "admin": {
            "_id": "507f1f77bcf86cd799439002",
            "username": "admin2"
          },
          "text": "Texnik bilimlar yaxshi, lekin tajriba yetarli emas.",
          "rating": 6,
          "createdAt": "2024-01-20T15:30:00.000Z"
        }
      ],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-20T15:30:00.000Z"
    }
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid ID:
```json
{
  "success": false,
  "message": "Invalid interview ID"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Interview not found"
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
curl -X GET http://localhost:3000/api/web/interviews/507f1f77bcf86cd799439061 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Filtering

Get My Interviews endpointida quyidagi filterlar mavjud:

- `status` - Status bo'yicha filter (scheduled/completed/cancelled)
- `result` - Natija bo'yicha filter (passed/failed/pending)

Example: `GET /api/web/interviews?status=completed&result=passed`

---

## Pagination

Get My Interviews endpointida pagination qo'llab-quvvatlanadi:

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
2. **Authorization:** Faqat joriy nomzodning o'z suhbatlarini ko'rish mumkin
3. **Own Interviews Only:** Nomzod faqat o'z suhbatlarini ko'ra oladi

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

1. **Multiple Evaluations:** Bir suhbatga bir nechta admin baxolash qo'sha oladi va barcha baxolashlar nomzodga ko'rinadi
2. **Evaluation Visibility:** Faqat `completed` status dagi suhbatlarda baxolashlar ko'rsatiladi
3. **Result Visibility:** Suhbat natijasi (`passed`/`failed`) nomzodga ko'rinadi

---

## Frontend Integration Example

```javascript
// Get all my interviews
async function getMyInterviews(filters = {}) {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams(filters);
  const response = await fetch(`http://localhost:3000/api/web/interviews?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  const data = await response.json();
  return data;
}

// Get single interview with details
async function getInterview(interviewId) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3000/api/web/interviews/${interviewId}`, {
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

