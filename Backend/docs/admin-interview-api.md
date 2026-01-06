# Admin Interview API Documentation

Bu hujjat Admin uchun suhbat (interview) tizimini boshqarish API endpoints va ularning ishlatilishini tushuntiradi.

## Base URL

```
http://localhost:3000/api/admin/interviews
```

## Authentication

Barcha endpointlar JWT token talab qiladi. Token `Authorization` header orqali yuboriladi:

```
Authorization: Bearer <your-token>
```

Token admin login orqali olinadi (admin-auth.md ga qarang).

---

## Interview Model

Interview quyidagi maydonlarga ega:

- `candidate` (ObjectId, required) - Nomzod ID (reference to Candidate)
- `vacancy` (ObjectId, required) - Vakansiya ID (reference to Vacancy)
- `application` (ObjectId, optional) - Application ID (reference to Application)
- `content` (String, required) - Suhbat mazmuni (10-5000 belgi)
- `interviewer` (String, required) - Suhbat o'tkazuvchi (2-200 belgi)
- `location` (String, required) - Suhbat joyi (2-500 belgi)
- `date` (Date, required) - Suhbat kuni
- `time` (String, required) - Suhbat vaqti (HH:MM format)
- `status` (String, enum: ['scheduled', 'completed', 'cancelled']) - Status (default: 'scheduled')
- `result` (String, enum: ['passed', 'failed', 'pending']) - Natija (default: 'pending')
- `evaluations` (Array) - Baxolashlar
  - `admin` (ObjectId, required) - Admin ID
  - `text` (String, required) - Baxolash matni (10-2000 belgi)
  - `rating` (Number, required) - Baxo (1-10)
  - `createdAt` (Date) - Yaratilgan vaqt
- `createdBy` (ObjectId, required) - Yaratgan admin ID
- `createdAt` (Date) - Yaratilgan vaqt
- `updatedAt` (Date) - Yangilangan vaqt

---

## Endpoints

### 1. Get Candidates Ready for Interview

Materiallarni to'liq ko'rib chiqqan (barcha testlarni topshirgan) nomzodlarni olish.

**Endpoint:** `GET /api/admin/interviews/candidates-ready`

**Access:** Private (Admin JWT token talab qiladi)

**Query Parameters:**
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
    "candidates": [
      {
        "candidate": {
          "id": "507f1f77bcf86cd799439013",
          "firstName": "John",
          "lastName": "Doe",
          "phone": "+998901234567",
          "telegramId": "123456789"
        },
        "vacancyId": "507f1f77bcf86cd799439011",
        "application": {
          "_id": "507f1f77bcf86cd799439021",
          "status": "passed"
        },
        "hasInterview": false,
        "testResultsCount": 3
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

**Note:** Faqat barcha materiallar uchun test topshirgan nomzodlar ko'rsatiladi.

---

### 2. Get All Interviews

Barcha suhbatlarni olish (pagination va filter bilan).

**Endpoint:** `GET /api/admin/interviews`

**Access:** Private (Admin JWT token talab qiladi)

**Query Parameters:**
- `candidateId` (optional) - Filter by candidate ID
- `vacancyId` (optional) - Filter by vacancy ID
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
          "company": {
            "_id": "507f1f77bcf86cd799439012",
            "name": "Tech Solutions LLC",
            "inn": "123456789"
          }
        },
        "application": {
          "_id": "507f1f77bcf86cd799439021",
          "status": "interview",
          "notes": null
        },
        "content": "JavaScript va React bo'yicha texnik suhbat",
        "interviewer": "Ahmadjon Karimov",
        "location": "Zoom: https://zoom.us/j/123456789",
        "date": "2024-01-20T00:00:00.000Z",
        "time": "14:00",
        "status": "scheduled",
        "result": "pending",
        "evaluations": [],
        "createdBy": {
          "_id": "507f1f77bcf86cd799439001",
          "username": "admin",
          "email": "admin@example.com"
        },
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

---

### 3. Get Single Interview

Bitta suhbatni batafsil ko'rish.

**Endpoint:** `GET /api/admin/interviews/:id`

**Access:** Private (Admin JWT token talab qiladi)

**URL Parameters:**
- `id` - Interview ID (MongoDB ObjectId)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "interview": {
      "_id": "507f1f77bcf86cd799439061",
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
        "company": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Tech Solutions LLC",
          "inn": "123456789",
          "ownerFullName": "John Doe",
          "companyPhone": "+998901234568"
        }
      },
      "application": {
        "_id": "507f1f77bcf86cd799439021",
        "status": "interview",
        "notes": null
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
            "username": "admin",
            "email": "admin@example.com"
          },
          "text": "Yaxshi bilimga ega, muammolarni hal qilish qobiliyati yuqori",
          "rating": 8,
          "createdAt": "2024-01-20T15:00:00.000Z"
        }
      ],
      "createdBy": {
        "_id": "507f1f77bcf86cd799439001",
        "username": "admin",
        "email": "admin@example.com"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-20T15:00:00.000Z"
    }
  }
}
```

---

### 4. Schedule Interview

Yangi suhbatni rejalashtirish.

**Endpoint:** `POST /api/admin/interviews`

**Access:** Private (Admin JWT token talab qiladi)

**Request Body:**
```json
{
  "candidateId": "507f1f77bcf86cd799439013",
  "vacancyId": "507f1f77bcf86cd799439011",
  "content": "JavaScript va React bo'yicha texnik suhbat",
  "interviewer": "Ahmadjon Karimov",
  "location": "Zoom: https://zoom.us/j/123456789",
  "date": "2024-01-20",
  "time": "14:00"
}
```

**Validation Rules:**
- `candidateId`: Required, valid MongoDB ObjectId, must exist
- `vacancyId`: Required, valid MongoDB ObjectId, must exist
- `content`: Required, 10-5000 characters
- `interviewer`: Required, 2-200 characters
- `location`: Required, 2-500 characters
- `date`: Required, valid ISO 8601 date format
- `time`: Required, HH:MM format (e.g., "14:00")

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Interview scheduled successfully",
  "data": {
    "interview": {
      "_id": "507f1f77bcf86cd799439061",
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
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Note:** Agar nomzodning application mavjud bo'lsa, uning statusi avtomatik `interview` ga o'zgaradi.

---

### 5. Update Interview

Suhbat ma'lumotlarini yangilash.

**Endpoint:** `PUT /api/admin/interviews/:id`

**Access:** Private (Admin JWT token talab qiladi)

**Request Body:**
```json
{
  "content": "Yangilangan suhbat mazmuni",
  "interviewer": "Yangi suhbat o'tkazuvchi",
  "location": "Yangi joy",
  "date": "2024-01-21",
  "time": "15:00",
  "status": "scheduled"
}
```

**Note:** Barcha maydonlar optional. Faqat yuborilgan maydonlar yangilanadi.

---

### 6. Complete Interview

Suhbatni yakunlash va natijani belgilash.

**Endpoint:** `PATCH /api/admin/interviews/:id/complete`

**Access:** Private (Admin JWT token talab qiladi)

**Request Body:**
```json
{
  "result": "passed"
}
```

**Validation Rules:**
- `result`: Required, must be either "passed" or "failed"

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Interview completed successfully",
  "data": {
    "interview": {
      "_id": "507f1f77bcf86cd799439061",
      "status": "completed",
      "result": "passed",
      ...
    }
  }
}
```

**Note:** Agar application mavjud bo'lsa, uning statusi avtomatik yangilanadi:
- `result: "passed"` → application status: `passed`
- `result: "failed"` → application status: `failed`

---

### 7. Add Evaluation

Suhbatga baxolash qo'shish.

**Endpoint:** `POST /api/admin/interviews/:id/evaluations`

**Access:** Private (Admin JWT token talab qiladi)

**Request Body:**
```json
{
  "text": "Yaxshi bilimga ega, muammolarni hal qilish qobiliyati yuqori. Kommunikatsiya qobiliyati yaxshi.",
  "rating": 8
}
```

**Validation Rules:**
- `text`: Required, 10-2000 characters
- `rating`: Required, integer between 1 and 10

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Evaluation added successfully",
  "data": {
    "interview": {
      "_id": "507f1f77bcf86cd799439061",
      "evaluations": [
        {
          "_id": "507f1f77bcf86cd799439062",
          "admin": {
            "_id": "507f1f77bcf86cd799439001",
            "username": "admin",
            "email": "admin@example.com"
          },
          "text": "Yaxshi bilimga ega, muammolarni hal qilish qobiliyati yuqori. Kommunikatsiya qobiliyati yaxshi.",
          "rating": 8,
          "createdAt": "2024-01-20T15:00:00.000Z"
        }
      ],
      ...
    }
  }
}
```

**Note:** Har bir admin bir suhbatga faqat bir marta baxolash qo'sha oladi.

---

### 8. Update Evaluation

Baxolashni yangilash.

**Endpoint:** `PUT /api/admin/interviews/:id/evaluations/:evaluationId`

**Access:** Private (Admin JWT token talab qiladi)

**Request Body:**
```json
{
  "text": "Yangilangan baxolash matni",
  "rating": 9
}
```

**Note:** Faqat o'z baxolashingizni yangilashingiz mumkin.

---

### 9. Cancel Interview

Suhbatni bekor qilish.

**Endpoint:** `PATCH /api/admin/interviews/:id/cancel`

**Access:** Private (Admin JWT token talab qiladi)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Interview cancelled successfully",
  "data": {
    "interview": {
      "_id": "507f1f77bcf86cd799439061",
      "status": "cancelled",
      ...
    }
  }
}
```

**Note:** Faqat `scheduled` status dagi suhbatlarni bekor qilish mumkin.

---

## Interview Status Flow

1. **scheduled** - Suhbat rejalashtirilgan
2. **completed** - Suhbat o'tkazilgan
3. **cancelled** - Suhbat bekor qilingan

## Interview Result Values

- `pending` - Natija hali belgilanmagan (default)
- `passed` - Suhbatdan o'tdi
- `failed` - Suhbatdan o'tmadi

---

## Filtering

Get All Interviews endpointida quyidagi filterlar mavjud:

- `candidateId` - Nomzod ID bo'yicha filter
- `vacancyId` - Vakansiya ID bo'yicha filter
- `status` - Status bo'yicha filter (scheduled/completed/cancelled)
- `result` - Natija bo'yicha filter (passed/failed/pending)

---

## Pagination

Barcha list endpointlarida pagination qo'llab-quvvatlanadi:

- `page` - Joriy sahifa raqami (default: 1)
- `limit` - Har bir sahifadagi elementlar soni (default: 10)

---

## Security Notes

1. **Authentication:** Barcha endpointlar JWT token talab qiladi
2. **Authorization:** Faqat autentifikatsiya qilingan adminlar suhbatlarni boshqara oladi
3. **Evaluation Ownership:** Adminlar faqat o'z baxolashlarini yangilay oladi

---

## Important Notes

1. **Material Completion Check:** Get Candidates Ready endpointida faqat barcha materiallar uchun test topshirgan nomzodlar ko'rsatiladi
2. **Application Integration:** Suhbat yaratilganda, agar application mavjud bo'lsa, uning statusi avtomatik `interview` ga o'zgaradi
3. **Multiple Evaluations:** Bir suhbatga bir nechta admin baxolash qo'sha oladi
4. **Unique Constraint:** Bir nomzod, bir vakansiya va bir sana uchun faqat bitta suhbat bo'lishi mumkin

