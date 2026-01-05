# Admin Application API Documentation

Bu hujjat Admin uchun nomzodlarni tekshirish, intervyuga qabul qilish va intervyu natijalarini belgilash API endpoints va ularning ishlatilishini tushuntiradi.

## Base URL

```
http://localhost:3000/api/admin/applications
```

## Authentication

Barcha endpointlar JWT token talab qiladi. Token `Authorization` header orqali yuboriladi:

```
Authorization: Bearer <your-token>
```

Token admin login orqali olinadi (admin-auth.md ga qarang).

---

## Application Status Flow

Application status quyidagi ketma-ketlikda o'zgaradi:

1. `pending` - Nomzod vakansiyaga topshirgan (default)
2. `reviewed` - Admin ko'rib chiqdi
3. `interview` - Intervyuga qabul qilindi
4. `passed` - Intervyudan o'tdi
5. `failed` - Intervyudan o'tmadi
6. `accepted` - Qabul qilindi
7. `rejected` - Rad etildi

---

## Endpoints

### 1. Get All Applications

Barcha topshirishlarni olish (pagination va filter bilan).

**Endpoint:** `GET /api/admin/applications`

**Access:** Private (Admin JWT token talab qiladi)

**Query Parameters:**
- `status` (optional) - Filter by status: `pending`, `reviewed`, `interview`, `passed`, `failed`, `accepted`, `rejected`
- `vacancy` (optional) - Filter by vacancy ID
- `candidate` (optional) - Filter by candidate ID
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
        "candidate": {
          "_id": "507f1f77bcf86cd799439013",
          "firstName": "John",
          "lastName": "Doe",
          "phone": "+998901234567",
          "telegramId": "123456789"
        },
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
        "notes": null,
        "createdAt": "2024-01-15T12:00:00.000Z",
        "updatedAt": "2024-01-15T12:00:00.000Z"
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
curl -X GET "http://localhost:3000/api/admin/applications?status=pending&page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 2. Get Single Application

Bitta topshirish ma'lumotlarini olish (batafsil ma'lumotlar bilan).

**Endpoint:** `GET /api/admin/applications/:id`

**Access:** Private (Admin JWT token talab qiladi)

**URL Parameters:**
- `id` - Application ID (MongoDB ObjectId)

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
    "application": {
      "_id": "507f1f77bcf86cd799439021",
      "candidate": {
        "_id": "507f1f77bcf86cd799439013",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+998901234567",
        "telegramId": "123456789",
        "registrationType": "web"
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

**404 Not Found:**
```json
{
  "success": false,
  "message": "Application not found"
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

### 3. Accept Interview

Nomzodni intervyuga qabul qilish (status ni `interview` ga o'zgartirish).

**Endpoint:** `PATCH /api/admin/applications/:id/interview`

**Access:** Private (Admin JWT token talab qiladi)

**URL Parameters:**
- `id` - Application ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "notes": "Intervyu 2024-01-20 kuni soat 14:00 da bo'lishi rejalashtirilgan"
}
```

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Validation Rules:**
- `notes`: Optional, max 1000 characters

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Application accepted for interview",
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
        "company": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Tech Solutions LLC",
          "inn": "123456789"
        }
      },
      "status": "interview",
      "notes": "Intervyu 2024-01-20 kuni soat 14:00 da bo'lishi rejalashtirilgan",
      "createdAt": "2024-01-15T12:00:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**

**400 Bad Request** - Already in interview:
```json
{
  "success": false,
  "message": "Application is already in interview status"
}
```

**400 Bad Request** - Already processed:
```json
{
  "success": false,
  "message": "Application has already been processed"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Application not found"
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
curl -X PATCH http://localhost:3000/api/admin/applications/507f1f77bcf86cd799439021/interview \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Intervyu 2024-01-20 kuni soat 14:00 da bo'lishi rejalashtirilgan"
  }'
```

---

### 4. Mark Interview Passed

Intervyudan o'tgan nomzodni belgilash (status ni `passed` ga o'zgartirish).

**Endpoint:** `PATCH /api/admin/applications/:id/passed`

**Access:** Private (Admin JWT token talab qiladi)

**URL Parameters:**
- `id` - Application ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "notes": "Nomzod intervyudan muvaffaqiyatli o'tdi. Texnik bilimlari yaxshi darajada."
}
```

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Validation Rules:**
- `notes`: Optional, max 1000 characters

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Interview marked as passed",
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
        "company": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Tech Solutions LLC",
          "inn": "123456789"
        }
      },
      "status": "passed",
      "notes": "Nomzod intervyudan muvaffaqiyatli o'tdi. Texnik bilimlari yaxshi darajada.",
      "createdAt": "2024-01-15T12:00:00.000Z",
      "updatedAt": "2024-01-20T15:00:00.000Z"
    }
  }
}
```

**Error Responses:**

**400 Bad Request** - Not in interview status:
```json
{
  "success": false,
  "message": "Application is not in interview status"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Application not found"
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
curl -X PATCH http://localhost:3000/api/admin/applications/507f1f77bcf86cd799439021/passed \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Nomzod intervyudan muvaffaqiyatli o'tdi."
  }'
```

---

### 5. Mark Interview Failed

Intervyudan o'tmagan nomzodni belgilash (status ni `failed` ga o'zgartirish).

**Endpoint:** `PATCH /api/admin/applications/:id/failed`

**Access:** Private (Admin JWT token talab qiladi)

**URL Parameters:**
- `id` - Application ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "notes": "Nomzod intervyudan o'tmadi. Texnik bilimlari etarli emas."
}
```

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Validation Rules:**
- `notes`: Optional, max 1000 characters

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Interview marked as failed",
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
        "company": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Tech Solutions LLC",
          "inn": "123456789"
        }
      },
      "status": "failed",
      "notes": "Nomzod intervyudan o'tmadi. Texnik bilimlari etarli emas.",
      "createdAt": "2024-01-15T12:00:00.000Z",
      "updatedAt": "2024-01-20T15:00:00.000Z"
    }
  }
}
```

**Error Responses:**

**400 Bad Request** - Not in interview status:
```json
{
  "success": false,
  "message": "Application is not in interview status"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Application not found"
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
curl -X PATCH http://localhost:3000/api/admin/applications/507f1f77bcf86cd799439021/failed \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Nomzod intervyudan o'tmadi."
  }'
```

---

### 6. Update Application Status

Application status ni o'zgartirish (umumiy endpoint).

**Endpoint:** `PATCH /api/admin/applications/:id/status`

**Access:** Private (Admin JWT token talab qiladi)

**URL Parameters:**
- `id` - Application ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "status": "accepted",
  "notes": "Nomzod qabul qilindi. Ishga kirish sanasi: 2024-02-01"
}
```

**Request Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Validation Rules:**
- `status`: Required, must be one of: `pending`, `reviewed`, `interview`, `passed`, `failed`, `accepted`, `rejected`
- `notes`: Optional, max 1000 characters

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Application status updated successfully",
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
        "company": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Tech Solutions LLC",
          "inn": "123456789"
        }
      },
      "status": "accepted",
      "notes": "Nomzod qabul qilindi. Ishga kirish sanasi: 2024-02-01",
      "createdAt": "2024-01-15T12:00:00.000Z",
      "updatedAt": "2024-01-25T10:00:00.000Z"
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
      "msg": "Status is required",
      "param": "status",
      "location": "body"
    }
  ]
}
```

**400 Bad Request** - Invalid status:
```json
{
  "success": false,
  "message": "Status must be one of: pending, reviewed, interview, passed, failed, accepted, rejected"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Application not found"
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
curl -X PATCH http://localhost:3000/api/admin/applications/507f1f77bcf86cd799439021/status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "accepted",
    "notes": "Nomzod qabul qilindi."
  }'
```

---

## Application Status Flow

Admin tomonidan boshqariladigan status o'zgarishlari:

```
pending → reviewed → interview → passed/failed → accepted/rejected
```

**Status o'zgarish qoidalari:**
- `pending` dan `reviewed`, `interview`, `accepted`, yoki `rejected` ga o'tkazish mumkin
- `reviewed` dan `interview`, `accepted`, yoki `rejected` ga o'tkazish mumkin
- `interview` dan `passed`, `failed`, yoki `rejected` ga o'tkazish mumkin
- `passed` dan `accepted` yoki `rejected` ga o'tkazish mumkin
- `failed` dan `rejected` ga o'tkazish mumkin

---

## Filtering

Get All Applications endpointida quyidagi filterlar mavjud:

- `status` - Status bo'yicha filter
- `vacancy` - Vakansiya ID bo'yicha filter
- `candidate` - Nomzod ID bo'yicha filter

Example: `GET /api/admin/applications?status=interview&vacancy=507f1f77bcf86cd799439011`

---

## Pagination

Get All Applications endpointida pagination qo'llab-quvvatlanadi:

- `page` - Joriy sahifa raqami (default: 1)
- `limit` - Har bir sahifadagi elementlar soni (default: 10)
- Response da `pagination` obyekti qaytariladi:
  - `page` - Joriy sahifa
  - `limit` - Limit
  - `total` - Jami elementlar soni
  - `pages` - Jami sahifalar soni

---

## Security Notes

1. **Authentication:** Barcha endpointlar Admin JWT token talab qiladi
2. **Authorization:** Faqat adminlar application larni boshqara oladi
3. **Validation:** Status va notes validation dan o'tadi
4. **Status Flow:** Status o'zgarishlari mantiqiy ketma-ketlikda tekshiriladi

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

1. **Interview Acceptance:** Faqat `pending` yoki `reviewed` status dagi application larni `interview` ga o'tkazish mumkin
2. **Interview Results:** Faqat `interview` status dagi application larni `passed` yoki `failed` ga o'tkazish mumkin
3. **Status Update:** Umumiy status update endpoint barcha status larni o'zgartirishga imkon beradi
4. **Notes:** Har bir status o'zgarishida eslatma qo'shish mumkin

