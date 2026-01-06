# Web Saved Vacancy API Documentation

Bu hujjat Web sayt uchun vakansiyalarni saqlash va boshqarish API endpoints va ularning ishlatilishini tushuntiradi.

## Base URL

```
http://localhost:3000/api/web/saved-vacancies
```

## Authentication

Barcha endpointlar JWT token talab qiladi. Token `Authorization` header orqali yuboriladi:

```
Authorization: Bearer <your-token>
```

Token candidate login yoki registration orqali olinadi (candidate-web-api.md ga qarang).

---

## Endpoints

### 1. Save Vacancy

Vakansiyani saqlash.

**Endpoint:** `POST /api/web/saved-vacancies`

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
  "message": "Vacancy saved successfully",
  "data": {
    "savedVacancy": {
      "id": "507f1f77bcf86cd799439051",
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
      "savedAt": "2024-01-20T10:00:00.000Z"
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

**400 Bad Request** - Already saved:
```json
{
  "success": false,
  "message": "Vacancy already saved"
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
curl -X POST http://localhost:3000/api/web/saved-vacancies \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "vacancyId": "507f1f77bcf86cd799439011"
  }'
```

**Example JavaScript (fetch):**
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const response = await fetch('http://localhost:3000/api/web/saved-vacancies', {
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

### 2. Unsave Vacancy

Saqlangan vakansiyani o'chirish.

**Endpoint:** `DELETE /api/web/saved-vacancies/:vacancyId`

**Access:** Private (JWT token talab qiladi)

**URL Parameters:**
- `vacancyId` - Vacancy ID (MongoDB ObjectId)

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Vacancy unsaved successfully"
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
  "message": "Saved vacancy not found"
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
curl -X DELETE http://localhost:3000/api/web/saved-vacancies/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example JavaScript (fetch):**
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const response = await fetch('http://localhost:3000/api/web/saved-vacancies/507f1f77bcf86cd799439011', {
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

### 3. Get All Saved Vacancies

Saqlangan barcha vakansiyalarni olish.

**Endpoint:** `GET /api/web/saved-vacancies`

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
    "savedVacancies": [
      {
        "_id": "507f1f77bcf86cd799439051",
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
        "createdAt": "2024-01-20T10:00:00.000Z",
        "updatedAt": "2024-01-20T10:00:00.000Z"
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
curl -X GET "http://localhost:3000/api/web/saved-vacancies?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example JavaScript (fetch):**
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const response = await fetch('http://localhost:3000/api/web/saved-vacancies?page=1&limit=10', {
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

### 4. Check if Vacancy is Saved

Vakansiya saqlanganligini tekshirish.

**Endpoint:** `GET /api/web/saved-vacancies/check/:vacancyId`

**Access:** Private (JWT token talab qiladi)

**URL Parameters:**
- `vacancyId` - Vacancy ID (MongoDB ObjectId)

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Success Response (200 OK) - Saved:**
```json
{
  "success": true,
  "data": {
    "isSaved": true,
    "savedVacancy": {
      "id": "507f1f77bcf86cd799439051",
      "savedAt": "2024-01-20T10:00:00.000Z"
    }
  }
}
```

**Success Response (200 OK) - Not Saved:**
```json
{
  "success": true,
  "data": {
    "isSaved": false,
    "savedVacancy": null
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
curl -X GET http://localhost:3000/api/web/saved-vacancies/check/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example JavaScript (fetch):**
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const response = await fetch('http://localhost:3000/api/web/saved-vacancies/check/507f1f77bcf86cd799439011', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

const data = await response.json();
console.log(data);

if (data.data.isSaved) {
  // Show "Saved" indicator
} else {
  // Show "Save" button
}
```

---

## Pagination

Get All Saved Vacancies endpointida pagination qo'llab-quvvatlanadi:

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
2. **Authorization:** Faqat joriy nomzodning o'z saqlangan vakansiyalarini ko'rish mumkin
3. **Validation:** Vakansiya mavjudligi va faolligi tekshiriladi
4. **Duplicate Prevention:** Bir nomzod bir vakansiyani bir marta saqlaydi (unique constraint)

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

1. **One Save Per Vacancy:** Bir nomzod bir vakansiyani faqat bir marta saqlaydi
2. **Active Vacancies Only:** Faqat faol vakansiyalarni saqlash mumkin
3. **Own Saved Vacancies:** Nomzod faqat o'z saqlangan vakansiyalarini ko'ra oladi
4. **Check Before Save:** Vakansiyani saqlashdan oldin tekshirish mumkin

---

## Frontend Integration Example

```javascript
// Save vacancy
async function saveVacancy(vacancyId) {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3000/api/web/saved-vacancies', {
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

// Unsave vacancy
async function unsaveVacancy(vacancyId) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3000/api/web/saved-vacancies/${vacancyId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  const data = await response.json();
  return data;
}

// Get saved vacancies
async function getSavedVacancies(page = 1, limit = 10) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3000/api/web/saved-vacancies?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  const data = await response.json();
  return data;
}

// Check if vacancy is saved
async function checkSavedVacancy(vacancyId) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3000/api/web/saved-vacancies/check/${vacancyId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  const data = await response.json();
  return data.data.isSaved;
}

// Example usage in vacancy detail page
const vacancyId = '507f1f77bcf86cd799439011';

// Check if saved
const isSaved = await checkSavedVacancy(vacancyId);
updateSaveButton(isSaved);

// Toggle save
async function toggleSave() {
  if (isSaved) {
    await unsaveVacancy(vacancyId);
    isSaved = false;
  } else {
    await saveVacancy(vacancyId);
    isSaved = true;
  }
  updateSaveButton(isSaved);
}
```


