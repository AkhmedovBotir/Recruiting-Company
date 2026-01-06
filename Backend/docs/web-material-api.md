# Web Material API Documentation

Bu hujjat Web sayt uchun o'quv materiallarini ko'rish, testlarga javob berish va natijalarni ko'rish API endpoints va ularning ishlatilishini tushuntiradi.

## Base URL

```
http://localhost:3000/api/web/materials
```

## Authentication

Barcha endpointlar JWT token talab qiladi. Token `Authorization` header orqali yuboriladi:

```
Authorization: Bearer <your-token>
```

Token candidate login yoki registration orqali olinadi (candidate-web-api.md ga qarang).

---

## Access Control

Materiallarni faqat quyidagi status dagi nomzodlar ko'ra oladi:
- `accepted` - Qabul qilingan nomzodlar
- `passed` - Intervyudan o'tgan nomzodlar

Boshqa status dagi nomzodlar materiallarga kirish huquqiga ega emas.

---

## Endpoints

### 1. Get All Materials

Nomzodning vakansiyasiga tegishli barcha materiallarni olish.

**Endpoint:** `GET /api/web/materials`

**Access:** Private (JWT token talab qiladi)

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Note:** Faqat `accepted` yoki `passed` status dagi nomzodlar materiallarni ko'ra oladi. Testlarda to'g'ri javoblar ko'rsatilmaydi.

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
            "options": ["var, let, const", "variable", "var", "let"]
          },
          {
            "question": "Array metodlari qaysilar?",
            "options": ["map, filter, reduce", "for, while", "if, else", "function"]
          },
          {
            "question": "Promise nima?",
            "options": ["Asinxron operatsiyalar", "Sinxron operatsiyalar", "O'zgaruvchi", "Funksiya"]
          }
        ],
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

**Success Response (200 OK) - No Access:**
```json
{
  "success": true,
  "data": {
    "materials": [],
    "message": "No materials available. You need to be accepted or passed interview."
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
curl -X GET http://localhost:3000/api/web/materials \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 2. Get Single Material

Bitta material ma'lumotlarini olish (videodars va testlar bilan).

**Endpoint:** `GET /api/web/materials/:id`

**Access:** Private (JWT token talab qiladi)

**URL Parameters:**
- `id` - Material ID (MongoDB ObjectId)

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Note:** Testlarda to'g'ri javoblar ko'rsatilmaydi.

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
        "company": "507f1f77bcf86cd799439012"
      },
      "tests": [
        {
          "question": "JavaScript da qanday o'zgaruvchi e'lon qilinadi?",
          "options": ["var, let, const", "variable", "var", "let"]
        },
        {
          "question": "Array metodlari qaysilar?",
          "options": ["map, filter, reduce", "for, while", "if, else", "function"]
        },
        {
          "question": "Promise nima?",
          "options": ["Asinxron operatsiyalar", "Sinxron operatsiyalar", "O'zgaruvchi", "Funksiya"]
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

**403 Forbidden** - No access:
```json
{
  "success": false,
  "message": "You do not have access to this material"
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
curl -X GET http://localhost:3000/api/web/materials/507f1f77bcf86cd799439031 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. Submit Test Answers

Testga javob berish.

**Endpoint:** `POST /api/web/materials/:id/submit-test`

**Access:** Private (JWT token talab qiladi)

**URL Parameters:**
- `id` - Material ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "answers": ["A", "B", "A"]
}
```

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Validation Rules:**
- `answers`: Required, array of strings (A, B, C, D, ...)
- Har bir testga javob berilishi kerak
- Answers array uzunligi testlar soniga teng bo'lishi kerak

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Test submitted successfully",
  "data": {
    "testResult": {
      "id": "507f1f77bcf86cd799439041",
      "correctCount": 2,
      "incorrectCount": 1,
      "totalQuestions": 3,
      "score": 67,
      "submittedAt": "2024-01-20T14:00:00.000Z"
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
      "msg": "Answers must be an array",
      "param": "answers",
      "location": "body"
    }
  ]
}
```

**400 Bad Request** - Wrong number of answers:
```json
{
  "success": false,
  "message": "Please answer all 3 questions"
}
```

**400 Bad Request** - Already submitted:
```json
{
  "success": false,
  "message": "Test already submitted"
}
```

**403 Forbidden** - No access:
```json
{
  "success": false,
  "message": "You do not have access to this material"
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
curl -X POST http://localhost:3000/api/web/materials/507f1f77bcf86cd799439031/submit-test \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "answers": ["A", "B", "A"]
  }'
```

**Example JavaScript (fetch):**
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const response = await fetch('http://localhost:3000/api/web/materials/507f1f77bcf86cd799439031/submit-test', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    answers: ['A', 'B', 'A']
  })
});

const data = await response.json();
console.log(data);
```

---

### 4. Get Test Results

Test natijalarini ko'rish (nechta to'g'ri, nechta noto'g'ri).

**Endpoint:** `GET /api/web/materials/:id/results`

**Access:** Private (JWT token talab qiladi)

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
    "testResult": {
      "id": "507f1f77bcf86cd799439041",
      "material": {
        "_id": "507f1f77bcf86cd799439031",
        "title": "JavaScript Asoslari"
      },
      "correctCount": 2,
      "incorrectCount": 1,
      "totalQuestions": 3,
      "score": 67,
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
        },
        {
          "questionIndex": 2,
          "answer": "A",
          "isCorrect": true
        }
      ],
      "submittedAt": "2024-01-20T14:00:00.000Z"
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
  "message": "Test result not found. Please submit the test first."
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
curl -X GET http://localhost:3000/api/web/materials/507f1f77bcf86cd799439031/results \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example JavaScript (fetch):**
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const response = await fetch('http://localhost:3000/api/web/materials/507f1f77bcf86cd799439031/results', {
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

## Material Access Flow

Materiallarga kirish jarayoni:

```
1. Nomzod vakansiyaga topshiradi
   ↓
2. Admin nomzodni intervyuga qabul qiladi (status: interview)
   ↓
3. Nomzod intervyudan o'tadi (status: passed) yoki qabul qilinadi (status: accepted)
   ↓
4. Nomzod materiallarni ko'ra oladi
   ↓
5. Nomzod videodarsni tomosha qiladi
   ↓
6. Nomzod testlarga javob beradi
   ↓
7. Nomzod natijalarni ko'radi
```

---

## Test Submission Flow

Testga javob berish jarayoni:

```
1. Nomzod materialni ko'radi (GET /api/web/materials/:id)
   ↓
2. Nomzod videodarsni tomosha qiladi
   ↓
3. Nomzod testlarga javob beradi
   ↓
4. POST /api/web/materials/:id/submit-test
   - Validates answers
   - Calculates results
   - Saves test result
   ↓
5. Nomzod natijalarni ko'radi (GET /api/web/materials/:id/results)
```

---

## Answer Format

Answers array quyidagi formatda yuboriladi:

```json
{
  "answers": ["A", "B", "C", "A"]
}
```

- Har bir element test indeksiga mos keladi
- Har bir javob variant harfi bo'lishi kerak (A, B, C, D, ...)
- Answers array uzunligi testlar soniga teng bo'lishi kerak

**Example:**
Agar materialda 3 ta test bo'lsa:
```json
{
  "answers": ["A", "B", "A"]
}
```

---

## Test Results Structure

Test natijalari quyidagi ma'lumotlarni o'z ichiga oladi:

- `correctCount` - To'g'ri javoblar soni
- `incorrectCount` - Noto'g'ri javoblar soni
- `totalQuestions` - Jami savollar soni
- `score` - Foiz (0-100)
- `answers` - Har bir savolga berilgan javoblar va natijalar
  - `questionIndex` - Savol indeksi
  - `answer` - Berilgan javob
  - `isCorrect` - To'g'ri yoki noto'g'ri

---

## Score Calculation

Score quyidagi formula bilan hisoblanadi:

```
score = (correctCount / totalQuestions) * 100
```

Masalan:
- 3 ta savoldan 2 tasiga to'g'ri javob: `(2 / 3) * 100 = 67%`
- 5 ta savoldan 4 tasiga to'g'ri javob: `(4 / 5) * 100 = 80%`

---

## Security Notes

1. **Authentication:** Barcha endpointlar JWT token talab qiladi
2. **Authorization:** Faqat `accepted` yoki `passed` status dagi nomzodlar materiallarni ko'ra oladi
3. **Test Answers:** Testlarda to'g'ri javoblar ko'rsatilmaydi (faqat test berilgandan keyin natijada ko'rsatiladi)
4. **One Submission:** Har bir material uchun test faqat bir marta berilishi mumkin
5. **Access Control:** Nomzod faqat o'z vakansiyasiga tegishli materiallarni ko'ra oladi

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

1. **Access Control:** Faqat `accepted` yoki `passed` status dagi nomzodlar materiallarni ko'ra oladi
2. **One Test Per Material:** Har bir material uchun test faqat bir marta berilishi mumkin
3. **Correct Answers Hidden:** Materiallarni ko'rishda to'g'ri javoblar ko'rsatilmaydi
4. **All Questions Required:** Barcha savollarga javob berilishi kerak
5. **Results Available:** Test berilgandan keyin natijalar ko'rinadi

---

## Frontend Integration Example

```javascript
// Step 1: Get materials
async function getMaterials() {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3000/api/web/materials', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  const data = await response.json();
  return data;
}

// Step 2: Get material details
async function getMaterialDetails(materialId) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3000/api/web/materials/${materialId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  const data = await response.json();
  return data;
}

// Step 3: Submit test answers
async function submitTest(materialId, answers) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3000/api/web/materials/${materialId}/submit-test`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ answers })
  });
  
  const data = await response.json();
  return data;
}

// Step 4: Get test results
async function getTestResults(materialId) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3000/api/web/materials/${materialId}/results`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  const data = await response.json();
  return data;
}

// Example usage
const materials = await getMaterials();
const material = materials.data.materials[0];

// Show video
const videoUrl = material.videoUrl;

// Show tests (without correct answers)
const tests = material.tests;

// User answers questions
const userAnswers = ['A', 'B', 'A'];

// Submit test
const result = await submitTest(material._id, userAnswers);
console.log(`Score: ${result.data.testResult.score}%`);
console.log(`Correct: ${result.data.testResult.correctCount}`);
console.log(`Incorrect: ${result.data.testResult.incorrectCount}`);

// Get detailed results
const detailedResults = await getTestResults(material._id);
console.log(detailedResults.data.testResult);
```


