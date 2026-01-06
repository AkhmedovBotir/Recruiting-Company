# Admin Material API Documentation

Bu hujjat Admin uchun o'quv materiallarini boshqarish API endpoints va ularning ishlatilishini tushuntiradi.

## Base URL

```
http://localhost:3000/api/admin/materials
```

## Authentication

Barcha endpointlar JWT token talab qiladi. Token `Authorization` header orqali yuboriladi:

```
Authorization: Bearer <your-token>
```

Token admin login orqali olinadi (admin-auth.md ga qarang).

---

## Material Model

Material quyidagi maydonlarga ega:

- `title` (String, required) - Mavzu nomi (3-200 belgi)
- `videoUrl` (String, required) - Videodars linki (YouTube URL)
- `description` (String, optional) - Qo'shimcha matn (max 5000 belgi)
- `vacancy` (ObjectId, required) - Vakansiya ID (reference to Vacancy)
- `company` (ObjectId, required) - Kompaniya ID (reference to Company)
- `tests` (Array, required) - Testlar (kamida 3 ta)
  - `question` (String, required) - Test savoli (5-500 belgi)
  - `options` (Array[String], required) - Variantlar (2-10 ta)
  - `correctAnswer` (String, required) - To'g'ri javob (A, B, C, D, ...)
- `isActive` (Boolean) - Faollik holati (default: true)
- `createdAt` (Date) - Yaratilgan vaqt
- `updatedAt` (Date) - Yangilangan vaqt

### Test Structure

Har bir test quyidagi strukturada:

```json
{
  "question": "JavaScript da qanday o'zgaruvchi e'lon qilinadi?",
  "options": [
    "var, let, const",
    "variable",
    "var",
    "let"
  ],
  "correctAnswer": "A"
}
```

**Important Notes:**
- `correctAnswer` har doim variant harfi bo'lishi kerak (A, B, C, D, ...)
- Variantlar array indeksiga qarab avtomatik harflarga aylantiriladi:
  - Index 0 → A
  - Index 1 → B
  - Index 2 → C
  - va hokazo

---

## Endpoints

### 1. Get All Materials

Barcha materiallarni olish (pagination va filter bilan).

**Endpoint:** `GET /api/admin/materials`

**Access:** Private (Admin JWT token talab qiladi)

**Query Parameters:**
- `vacancy` (optional) - Filter by vacancy ID
- `company` (optional) - Filter by company ID
- `isActive` (optional) - Filter by active status (true/false)
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
    "materials": [
      {
        "_id": "507f1f77bcf86cd799439031",
        "title": "JavaScript Asoslari",
        "videoUrl": "https://www.youtube.com/watch?v=example",
        "description": "JavaScript dasturlash tilining asosiy tushunchalari",
        "vacancy": {
          "_id": "507f1f77bcf86cd799439011",
          "title": "Senior Full Stack Developer",
          "company": "507f1f77bcf86cd799439012"
        },
        "company": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Tech Solutions LLC",
          "inn": "123456789"
        },
        "tests": [
          {
            "question": "JavaScript da qanday o'zgaruvchi e'lon qilinadi?",
            "options": ["var, let, const", "variable", "var", "let"],
            "correctAnswer": "A"
          }
        ],
        "isActive": true,
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
curl -X GET "http://localhost:3000/api/admin/materials?vacancy=507f1f77bcf86cd799439011&page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 2. Get Single Material

Bitta material ma'lumotlarini olish (batafsil ma'lumotlar bilan).

**Endpoint:** `GET /api/admin/materials/:id`

**Access:** Private (Admin JWT token talab qiladi)

**URL Parameters:**
- `id` - Material ID (MongoDB ObjectId)

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
      "_id": "507f1f77bcf86cd799439031",
      "title": "JavaScript Asoslari",
      "videoUrl": "https://www.youtube.com/watch?v=example",
      "description": "JavaScript dasturlash tilining asosiy tushunchalari",
      "vacancy": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Senior Full Stack Developer",
        "department": "IT",
        "position": "Senior Developer",
        "company": "507f1f77bcf86cd799439012"
      },
      "company": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Tech Solutions LLC",
        "inn": "123456789",
        "ownerFullName": "John Doe",
        "companyPhone": "+998901234568"
      },
      "tests": [
        {
          "question": "JavaScript da qanday o'zgaruvchi e'lon qilinadi?",
          "options": ["var, let, const", "variable", "var", "let"],
          "correctAnswer": "A"
        },
        {
          "question": "Array metodlari qaysilar?",
          "options": ["map, filter, reduce", "for, while", "if, else", "function"],
          "correctAnswer": "A"
        },
        {
          "question": "Promise nima?",
          "options": ["Asinxron operatsiyalar", "Sinxron operatsiyalar", "O'zgaruvchi", "Funksiya"],
          "correctAnswer": "A"
        }
      ],
      "isActive": true,
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
  "message": "Invalid material ID"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Material not found"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

---

### 3. Create Material

Yangi material yaratish.

**Endpoint:** `POST /api/admin/materials`

**Access:** Private (Admin JWT token talab qiladi)

**Request Body:**
```json
{
  "title": "JavaScript Asoslari",
  "videoUrl": "https://www.youtube.com/watch?v=example",
  "description": "JavaScript dasturlash tilining asosiy tushunchalari",
  "vacancy": "507f1f77bcf86cd799439011",
  "company": "507f1f77bcf86cd799439012",
  "tests": [
    {
      "question": "JavaScript da qanday o'zgaruvchi e'lon qilinadi?",
      "options": ["var, let, const", "variable", "var", "let"],
      "correctAnswer": "A"
    },
    {
      "question": "Array metodlari qaysilar?",
      "options": ["map, filter, reduce", "for, while", "if, else", "function"],
      "correctAnswer": "A"
    },
    {
      "question": "Promise nima?",
      "options": ["Asinxron operatsiyalar", "Sinxron operatsiyalar", "O'zgaruvchi", "Funksiya"],
      "correctAnswer": "A"
    }
  ]
}
```

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Validation Rules:**
- `title`: Required, 3-200 characters
- `videoUrl`: Required, valid YouTube URL
- `description`: Optional, max 5000 characters
- `vacancy`: Required, valid MongoDB ObjectId, must exist
- `company`: Required, valid MongoDB ObjectId, must exist
- `tests`: Required, array with at least 3 tests
- `tests[].question`: Required, 5-500 characters
- `tests[].options`: Required, array with 2-10 items
- `tests[].correctAnswer`: Required, must be one of option letters (A, B, C, ...)

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Material created successfully",
  "data": {
    "material": {
      "_id": "507f1f77bcf86cd799439031",
      "title": "JavaScript Asoslari",
      "videoUrl": "https://www.youtube.com/watch?v=example",
      "description": "JavaScript dasturlash tilining asosiy tushunchalari",
      "vacancy": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Senior Full Stack Developer",
        "company": "507f1f77bcf86cd799439012"
      },
      "company": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Tech Solutions LLC",
        "inn": "123456789"
      },
      "tests": [
        {
          "question": "JavaScript da qanday o'zgaruvchi e'lon qilinadi?",
          "options": ["var, let, const", "variable", "var", "let"],
          "correctAnswer": "A"
        },
        {
          "question": "Array metodlari qaysilar?",
          "options": ["map, filter, reduce", "for, while", "if, else", "function"],
          "correctAnswer": "A"
        },
        {
          "question": "Promise nima?",
          "options": ["Asinxron operatsiyalar", "Sinxron operatsiyalar", "O'zgaruvchi", "Funksiya"],
          "correctAnswer": "A"
        }
      ],
      "isActive": true,
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
    "Material title is required",
    "At least 3 tests are required"
  ]
}
```

**400 Bad Request** - Invalid test:
```json
{
  "success": false,
  "message": "Test 1: correctAnswer must be one of: A, B, C, D"
}
```

**404 Not Found** - Vacancy not found:
```json
{
  "success": false,
  "message": "Vacancy not found"
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

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/admin/materials \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "JavaScript Asoslari",
    "videoUrl": "https://www.youtube.com/watch?v=example",
    "description": "JavaScript dasturlash tilining asosiy tushunchalari",
    "vacancy": "507f1f77bcf86cd799439011",
    "company": "507f1f77bcf86cd799439012",
    "tests": [
      {
        "question": "JavaScript da qanday o'zgaruvchi e'lon qilinadi?",
        "options": ["var, let, const", "variable", "var", "let"],
        "correctAnswer": "A"
      },
      {
        "question": "Array metodlari qaysilar?",
        "options": ["map, filter, reduce", "for, while", "if, else", "function"],
        "correctAnswer": "A"
      },
      {
        "question": "Promise nima?",
        "options": ["Asinxron operatsiyalar", "Sinxron operatsiyalar", "O'zgaruvchi", "Funksiya"],
        "correctAnswer": "A"
      }
    ]
  }'
```

---

### 4. Update Material

Material ma'lumotlarini yangilash.

**Endpoint:** `PUT /api/admin/materials/:id`

**Access:** Private (Admin JWT token talab qiladi)

**URL Parameters:**
- `id` - Material ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "title": "Updated JavaScript Asoslari",
  "description": "Yangilangan tavsif",
  "isActive": false
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
- `tests` yangilanganda kamida 3 ta test bo'lishi kerak

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Material updated successfully",
  "data": {
    "material": {
      "_id": "507f1f77bcf86cd799439031",
      "title": "Updated JavaScript Asoslari",
      "videoUrl": "https://www.youtube.com/watch?v=example",
      "description": "Yangilangan tavsif",
      "vacancy": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Senior Full Stack Developer",
        "company": "507f1f77bcf86cd799439012"
      },
      "company": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Tech Solutions LLC",
        "inn": "123456789"
      },
      "tests": [...],
      "isActive": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-20T11:00:00.000Z"
    }
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid ID:
```json
{
  "success": false,
  "message": "Invalid material ID"
}
```

**400 Bad Request** - Validation error:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "At least 3 tests are required"
  ]
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Material not found"
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
curl -X PUT http://localhost:3000/api/admin/materials/507f1f77bcf86cd799439031 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated JavaScript Asoslari",
    "isActive": false
  }'
```

---

### 5. Delete Material

Materialni o'chirish.

**Endpoint:** `DELETE /api/admin/materials/:id`

**Access:** Private (Admin JWT token talab qiladi)

**URL Parameters:**
- `id` - Material ID (MongoDB ObjectId)

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Material deleted successfully"
}
```

**Error Responses:**

**400 Bad Request** - Invalid ID:
```json
{
  "success": false,
  "message": "Invalid material ID"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Material not found"
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
curl -X DELETE http://localhost:3000/api/admin/materials/507f1f77bcf86cd799439031 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Test Structure Details

### Correct Answer Format

`correctAnswer` har doim variant harfi bo'lishi kerak. Variantlar array indeksiga qarab avtomatik harflarga aylantiriladi:

- Index 0 → A
- Index 1 → B
- Index 2 → C
- Index 3 → D
- va hokazo (E, F, G, H, I, J - maksimal 10 ta variant)

**Example:**
```json
{
  "question": "JavaScript da qanday o'zgaruvchi e'lon qilinadi?",
  "options": [
    "var, let, const",  // Index 0 → A
    "variable",          // Index 1 → B
    "var",              // Index 2 → C
    "let"               // Index 3 → D
  ],
  "correctAnswer": "A"  // Birinchi variant to'g'ri
}
```

### Test Validation Rules

1. **Minimum Tests:** Kamida 3 ta test bo'lishi kerak
2. **Question:** 5-500 belgi
3. **Options:** 2-10 ta variant
4. **Correct Answer:** Variant harflaridan biri bo'lishi kerak (A, B, C, ...)

---

## Filtering

Get All Materials endpointida quyidagi filterlar mavjud:

- `vacancy` - Vakansiya ID bo'yicha filter
- `company` - Kompaniya ID bo'yicha filter
- `isActive` - Faollik holati bo'yicha filter (true/false)

Example: `GET /api/admin/materials?vacancy=507f1f77bcf86cd799439011&isActive=true`

---

## Pagination

Get All Materials endpointida pagination qo'llab-quvvatlanadi:

- `page` - Joriy sahifa raqami (default: 1)
- `limit` - Har bir sahifadagi elementlar soni (default: 10)
- Response da `pagination` obyekti qaytariladi:
  - `page` - Joriy sahifa
  - `limit` - Limit
  - `total` - Jami elementlar soni
  - `pages` - Jami sahifalar soni

---

## YouTube URL Validation

Video URL quyidagi formatlarda qabul qilinadi:

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `http://www.youtube.com/watch?v=VIDEO_ID`

---

## Security Notes

1. **Authentication:** Barcha endpointlar Admin JWT token talab qiladi
2. **Authorization:** Faqat adminlar materiallarni boshqara oladi
3. **Validation:** Barcha input ma'lumotlar validation dan o'tadi
4. **Vacancy/Company Validation:** Vakansiya va kompaniya mavjudligi tekshiriladi

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

1. **Minimum Tests:** Har bir materialda kamida 3 ta test bo'lishi kerak
2. **Correct Answer:** To'g'ri javob har doim variant harfi bo'lishi kerak (A, B, C, ...)
3. **YouTube URL:** Faqat YouTube linklari qabul qilinadi
4. **Vacancy/Company:** Vakansiya va kompaniya mavjud bo'lishi kerak
5. **Active Status:** Materialni `isActive: false` qilib nofaol qilish mumkin

---

## Frontend Integration Example

```javascript
// Create material
async function createMaterial(materialData) {
  const token = localStorage.getItem('adminToken');
  const response = await fetch('http://localhost:3000/api/admin/materials', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(materialData)
  });
  
  const data = await response.json();
  return data;
}

// Example material data
const materialData = {
  title: "JavaScript Asoslari",
  videoUrl: "https://www.youtube.com/watch?v=example",
  description: "JavaScript dasturlash tilining asosiy tushunchalari",
  vacancy: "507f1f77bcf86cd799439011",
  company: "507f1f77bcf86cd799439012",
  tests: [
    {
      question: "JavaScript da qanday o'zgaruvchi e'lon qilinadi?",
      options: ["var, let, const", "variable", "var", "let"],
      correctAnswer: "A"
    },
    {
      question: "Array metodlari qaysilar?",
      options: ["map, filter, reduce", "for, while", "if, else", "function"],
      correctAnswer: "A"
    },
    {
      question: "Promise nima?",
      options: ["Asinxron operatsiyalar", "Sinxron operatsiyalar", "O'zgaruvchi", "Funksiya"],
      correctAnswer: "A"
    }
  ]
};

createMaterial(materialData);
```


