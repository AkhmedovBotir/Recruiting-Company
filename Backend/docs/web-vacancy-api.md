# Web Vacancy API Documentation

Bu hujjat Web sayt uchun vakansiyalarni ko'rish API endpoints va ularning ishlatilishini tushuntiradi.

## Base URL

```
http://localhost:3000/api/web/vacancies
```

## Authentication

Web vacancy endpoints lar public va JWT token talab qilmaydi. Faqat faol (active) vakansiyalar ko'rsatiladi.

---

## Endpoints

### 1. Get All Vacancies

Barcha faol vakansiyalarni olish (pagination va filter bilan).

**Endpoint:** `GET /api/web/vacancies`

**Access:** Public (Token talab qilmaydi)

**Query Parameters:**
- `workType` (optional) - Filter by work type: `fulltime` yoki `parttime`
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `search` (optional) - Search in title, department, or position

**Request Headers:**
```
Content-Type: application/json
```

**Note:** Faqat `status: 'active'` bo'lgan vakansiyalar ko'rsatiladi. Batafsil ma'lumotlar (description, responsibilities, preferences, skills) qaytarilmaydi.

**Example Request:**
```
GET /api/web/vacancies?workType=fulltime&page=1&limit=10&search=developer
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

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error"
}
```

**Example cURL:**
```bash
curl -X GET "http://localhost:3000/api/web/vacancies?workType=fulltime&page=1&limit=10" \
  -H "Content-Type: application/json"
```

**Example JavaScript (fetch):**
```javascript
const response = await fetch('http://localhost:3000/api/web/vacancies?workType=fulltime&page=1&limit=10', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
});

const data = await response.json();
console.log(data);
```

---

### 2. Get Single Vacancy

Bitta vakansiya ma'lumotlarini olish (batafsil ma'lumotlar bilan).

**Endpoint:** `GET /api/web/vacancies/:id`

**Access:** Public (Token talab qilmaydi)

**URL Parameters:**
- `id` - Vacancy ID (MongoDB ObjectId)

**Request Headers:**
```
Content-Type: application/json
```

**Note:** Faqat `status: 'active'` bo'lgan vakansiyalar ko'rsatiladi. Batafsil ma'lumotlar (description, responsibilities, preferences, skills) ham qaytariladi.

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

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error"
}
```

**Example cURL:**
```bash
curl -X GET http://localhost:3000/api/web/vacancies/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json"
```

**Example JavaScript (fetch):**
```javascript
const response = await fetch('http://localhost:3000/api/web/vacancies/507f1f77bcf86cd799439011', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
});

const data = await response.json();
console.log(data);
```

---

## Filtering

Get All Vacancies endpointida quyidagi filterlar mavjud:

- `workType` - Ish turi bo'yicha filter (fulltime/parttime)
- `search` - Vakansiya nomi, bo'lim yoki lavozim nomida qidirish

Example: `GET /api/web/vacancies?workType=fulltime&search=developer`

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
- Example: `GET /api/web/vacancies?search=developer`

---

## Response Fields

### Get All Vacancies Response

Faqat asosiy ma'lumotlar qaytariladi:
- `_id`, `title`, `department`, `position`, `experience`, `workType`, `minAge`, `maxAge`, `salary`, `status`, `createdAt`, `updatedAt`
- `company` - Kompaniya nomi va INN
- Batafsil ma'lumotlar (description, responsibilities, preferences, skills) qaytarilmaydi

### Get Single Vacancy Response

To'liq ma'lumotlar qaytariladi:
- Barcha vakansiya maydonlari
- Batafsil ma'lumotlar (description, responsibilities, preferences, skills)
- Kompaniya to'liq ma'lumotlari (nom, INN, egasi ism-familiyasi, telefon)

---

## Important Notes

1. **Public Access:** Barcha endpointlar public va token talab qilmaydi
2. **Active Only:** Faqat `status: 'active'` bo'lgan vakansiyalar ko'rsatiladi
3. **Limited Fields:** Get All Vacancies endpointida batafsil ma'lumotlar qaytarilmaydi (tezkorlik uchun)
4. **Full Details:** Get Single Vacancy endpointida barcha ma'lumotlar qaytariladi

---

## Error Handling

Barcha error response lar quyidagi formatda:

```json
{
  "success": false,
  "message": "Error message description"
}
```

