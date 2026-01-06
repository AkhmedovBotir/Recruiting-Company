# Web Application API Documentation

Bu hujjat Web sayt uchun vakansiyaga topshirish va jarayon API endpoints va ularning ishlatilishini tushuntiradi.

## Base URL

```
http://localhost:3000/api/web/applications
```

## Authentication

Barcha endpointlar JWT token talab qiladi. Token `Authorization` header orqali yuboriladi:

```
Authorization: Bearer <your-token>
```

Token candidate login yoki registration orqali olinadi (candidate-web-api.md ga qarang).

---

## Application Model

Application quyidagi maydonlarga ega:

- `candidate` (ObjectId, required) - Nomzod ID (reference to Candidate)
- `vacancy` (ObjectId, required) - Vakansiya ID (reference to Vacancy)
- `status` (String, enum: ['pending', 'reviewed', 'interview', 'passed', 'failed', 'accepted', 'rejected']) - Status (default: 'pending')
- `notes` (String, optional) - Eslatmalar (max 1000 characters)
- `createdAt` (Date) - Yaratilgan vaqt
- `updatedAt` (Date) - Yangilangan vaqt

### Application Status Values

- `pending` - Kutilyapti (default)
- `reviewed` - Ko'rib chiqilgan
- `interview` - Intervyuga qabul qilingan
- `passed` - Intervyudan o'tdi
- `failed` - Intervyudan o'tmadi
- `accepted` - Qabul qilingan
- `rejected` - Rad etilgan

---

## Endpoints

### 1. Apply to Vacancy

Vakansiyaga oddiy topshirish.

**Endpoint:** `POST /api/web/applications`

**Access:** Private (JWT token talab qiladi)

**Request Body:**
```json
{
  "vacancyId": "507f1f77bcf86cd799439011"
}
```

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Validation Rules:**
- `vacancyId`: Required, valid MongoDB ObjectId, must exist and be active

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "application": {
      "id": "507f1f77bcf86cd799439021",
      "vacancy": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Senior Full Stack Developer",
        "company": "507f1f77bcf86cd799439012"
      },
      "candidate": {
        "_id": "507f1f77bcf86cd799439013",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+998901234567"
      },
      "status": "pending",
      "createdAt": "2024-01-15T12:00:00.000Z"
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
      "msg": "Vacancy ID is required",
      "param": "vacancyId",
      "location": "body"
    }
  ]
}
```

**400 Bad Request** - Already applied:
```json
{
  "success": false,
  "message": "You have already applied to this vacancy"
}
```


**400 Bad Request** - Invalid option:
```json
{
  "success": false,
  "message": "Answer for question \"Qaysi shaharda yashaysiz?\" must be one of the provided options"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**404 Not Found** - Vacancy not found:
```json
{
  "success": false,
  "message": "Vacancy not found or not active"
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
curl -X POST http://localhost:3000/api/web/applications \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "vacancyId": "507f1f77bcf86cd799439011"
  }'
```

**Example JavaScript (fetch):**
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const response = await fetch('http://localhost:3000/api/web/applications', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    vacancyId: '507f1f77bcf86cd799439011'
  })
});

const data = await response.json();
console.log(data);
```

---

### 2. Get My Applications

Joriy nomzodning barcha topshirishlarini olish.

**Endpoint:** `GET /api/web/applications`

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
        "_id": "507f1f77bcf86cd799439021",
        "candidate": "507f1f77bcf86cd799439013",
        "vacancy": {
          "_id": "507f1f77bcf86cd799439011",
          "title": "Senior Full Stack Developer",
          "department": "IT",
          "position": "Senior Developer",
          "workType": "fulltime",
          "salary": "5000000",
          "status": "active",
          "company": {
            "_id": "507f1f77bcf86cd799439012",
            "name": "Tech Solutions LLC",
            "inn": "123456789"
          }
        },
        "status": "pending",
        "createdAt": "2024-01-15T12:00:00.000Z",
        "updatedAt": "2024-01-15T12:00:00.000Z"
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
curl -X GET "http://localhost:3000/api/web/applications?status=pending&page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example JavaScript (fetch):**
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const response = await fetch('http://localhost:3000/api/web/applications?status=pending&page=1&limit=10', {
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

### 3. Get Single Application

Bitta topshirish jarayonini olish (batafsil ma'lumotlar bilan).

**Endpoint:** `GET /api/web/applications/:id`

**Access:** Private (JWT token talab qiladi)

**URL Parameters:**
- `id` - Application ID (MongoDB ObjectId)

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Note:** Faqat joriy nomzodning o'z topshirishlarini ko'rish mumkin.

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "application": {
      "_id": "507f1f77bcf86cd799439021",
      "candidate": {
        "_id": "507f1f77bcf86cd799439013",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+998901234567"
      },
      "vacancy": {
        "_id": "507f1f77bcf86cd799439011",
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
        "company": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Tech Solutions LLC",
          "inn": "123456789",
          "ownerFullName": "John Doe",
          "companyPhone": "+998901234568"
        }
      },
      "status": "pending",
      "notes": null,
      "createdAt": "2024-01-15T12:00:00.000Z",
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
  "message": "Invalid application ID"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Application not found"
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
curl -X GET http://localhost:3000/api/web/applications/507f1f77bcf86cd799439021 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example JavaScript (fetch):**
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const response = await fetch('http://localhost:3000/api/web/applications/507f1f77bcf86cd799439021', {
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

## Application Flow

Vakansiyaga topshirish jarayoni:

1. **Browse Vacancies:** Foydalanuvchi `/api/web/vacancies` endpoint orqali vakansiyalarni ko'radi
2. **View Vacancy Details:** Foydalanuvchi `/api/web/vacancies/:id` endpoint orqali bitta vakansiyaning batafsil ma'lumotlarini ko'radi
3. **Apply to Vacancy:** Foydalanuvchi `/api/web/applications` endpoint orqali vakansiyaga topshiradi
4. **Track Application:** Foydalanuvchi `/api/web/applications` endpoint orqali barcha topshirishlarini ko'radi
5. **View Application Status:** Foydalanuvchi `/api/web/applications/:id` endpoint orqali bitta topshirishning jarayonini ko'radi

---

## Filtering

Get My Applications endpointida quyidagi filterlar mavjud:

- `status` - Status bo'yicha filter (pending/reviewed/interview/passed/failed/accepted/rejected)

Example: `GET /api/web/applications?status=pending`

---

## Pagination

Get My Applications endpointida pagination qo'llab-quvvatlanadi:

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
2. **Authorization:** Faqat joriy nomzodning o'z topshirishlarini ko'rish mumkin
3. **Validation:** Vakansiya mavjudligi va faolligi tekshiriladi
4. **Duplicate Prevention:** Bir nomzod bir vakansiyaga bir marta topshiradi (unique constraint)

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

1. **One Application Per Vacancy:** Bir nomzod bir vakansiyaga faqat bir marta topshiradi
2. **Active Vacancies Only:** Faqat faol vakansiyalarga topshirish mumkin
3. **Status Tracking:** Topshirish jarayoni status orqali kuzatiladi
4. **Own Applications Only:** Nomzod faqat o'z topshirishlarini ko'ra oladi

---

## Frontend Integration Example

```javascript
// Step 1: Browse vacancies
async function getVacancies(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`http://localhost:3000/api/web/vacancies?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  const data = await response.json();
  return data;
}

// Step 2: View vacancy details
async function getVacancyDetails(vacancyId) {
  const response = await fetch(`http://localhost:3000/api/web/vacancies/${vacancyId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  const data = await response.json();
  return data;
}

// Step 3: Apply to vacancy
async function applyToVacancy(vacancyId) {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3000/api/web/applications', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ vacancyId })
  });
  
  const data = await response.json();
  return data;
}

// Step 4: Get my applications
async function getMyApplications(filters = {}) {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams(filters);
  const response = await fetch(`http://localhost:3000/api/web/applications?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  const data = await response.json();
  return data;
}

// Step 5: View application status
async function getApplicationStatus(applicationId) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3000/api/web/applications/${applicationId}`, {
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

