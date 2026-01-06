# Admin Certificate API Documentation

Bu hujjat Admin uchun sertifikat berish va boshqarish API endpoints va ularning ishlatilishini tushuntiradi.

## Base URL

```
http://localhost:3000/api/admin/certificates
```

## Authentication

Barcha endpointlar JWT token talab qiladi. Token `Authorization` header orqali yuboriladi:

```
Authorization: Bearer <your-token>
```

Token admin login orqali olinadi (admin-auth.md ga qarang).

---

## Certificate Model

Certificate quyidagi maydonlarga ega:

- `candidate` (ObjectId, required) - Nomzod ID (reference to Candidate)
- `vacancy` (ObjectId, required) - Vakansiya ID (reference to Vacancy)
- `interview` (ObjectId, required) - Interview ID (reference to Interview)
- `application` (ObjectId, optional) - Application ID (reference to Application)
- `certificateNumber` (String, required, unique) - Sertifikat raqami (avtomatik generatsiya qilinadi)
- `qrCode` (String, required, unique) - QR kod token (avtomatik generatsiya qilinadi)
- `certificateBase64` (String, optional) - To'g'rilangan sertifikat rasm (base64 formatida)
- `issuedDate` (Date, required) - Berilgan sana (default: hozirgi sana)
- `issuedBy` (ObjectId, required) - Bergan admin ID (reference to Admin)
- `status` (String, enum: ['active', 'revoked']) - Status (default: 'active')
- `createdAt` (Date) - Yaratilgan vaqt
- `updatedAt` (Date) - Yangilangan vaqt

### Certificate Number Format

Sertifikat raqami quyidagi formatda: `CERT-YYYYMMDD-N`
- `YYYY` - Yil
- `MM` - Oy
- `DD` - Kun
- `N` - O'sha kunda berilgan sertifikatlar soni (1 dan boshlanadi)

**Example:** `CERT-20260107-1` - 2026 yil 7 yanvar kuni birinchi sertifikat

### QR Code

Har bir sertifikat uchun unique QR kod token generatsiya qilinadi. Bu token orqali sertifikat tekshiriladi.

---

## Endpoints

### 1. Get Candidates Eligible for Certificate

Suhbatdan o'tgan (passed) va hali sertifikat olmagan nomzodlarni olish.

**Endpoint:** `GET /api/admin/certificates/candidates-eligible`

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
        "interview": {
          "id": "507f1f77bcf86cd799439061",
          "date": "2024-01-20T00:00:00.000Z",
          "time": "14:00",
          "interviewer": "Ahmadjon Karimov",
          "evaluations": [
            {
              "_id": "507f1f77bcf86cd799439062",
              "admin": "507f1f77bcf86cd799439001",
              "text": "Yaxshi bilimga ega, muammolarni hal qilish qobiliyati yuqori",
              "rating": 8,
              "createdAt": "2024-01-20T15:00:00.000Z"
            }
          ]
        },
        "candidate": {
          "id": "507f1f77bcf86cd799439013",
          "firstName": "John",
          "lastName": "Doe",
          "phone": "+998901234567",
          "telegramId": "123456789"
        },
        "vacancy": {
          "id": "507f1f77bcf86cd799439011",
          "title": "Senior Full Stack Developer",
          "department": "IT",
          "position": "Senior Developer",
          "company": {
            "_id": "507f1f77bcf86cd799439012",
            "name": "Tech Solutions LLC",
            "inn": "123456789"
          }
        },
        "hasCertificate": false
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

**Note:** Faqat `status: 'completed'` va `result: 'passed'` bo'lgan suhbatlar uchun nomzodlar ko'rsatiladi va faqat hali sertifikat olmagan nomzodlar.

---

### 2. Issue Certificate

Sertifikat berish.

**Endpoint:** `POST /api/admin/certificates`

**Access:** Private (Admin JWT token talab qiladi)

**Request Body:**
```json
{
  "interviewId": "507f1f77bcf86cd799439061"
}
```

**Validation Rules:**
- `interviewId`: Required, valid MongoDB ObjectId, must exist
- Interview status must be `completed`
- Interview result must be `passed`
- Certificate must not already exist for this interview

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Certificate issued successfully",
  "data": {
    "certificate": {
      "_id": "507f1f77bcf86cd799439071",
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
      "interview": {
        "_id": "507f1f77bcf86cd799439061",
        "date": "2024-01-20T00:00:00.000Z",
        "time": "14:00",
        "interviewer": "Ahmadjon Karimov",
        "result": "passed",
        "evaluations": [...]
      },
      "certificateNumber": "CERT-20240107-1",
      "qrCode": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
      "issuedDate": "2024-01-21T10:30:00.000Z",
      "issuedBy": {
        "_id": "507f1f77bcf86cd799439001",
        "username": "admin",
        "email": "admin@example.com"
      },
      "status": "active",
      "createdAt": "2024-01-21T10:30:00.000Z",
      "updatedAt": "2024-01-21T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**

**400 Bad Request** - Interview not passed:
```json
{
  "success": false,
  "message": "Certificate can only be issued for passed interviews"
}
```

**400 Bad Request** - Certificate already exists:
```json
{
  "success": false,
  "message": "Certificate already issued for this interview"
}
```

**404 Not Found** - Interview not found:
```json
{
  "success": false,
  "message": "Interview not found"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/admin/certificates \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "interviewId": "507f1f77bcf86cd799439061"
  }'
```

---

### 3. Get All Certificates

Barcha sertifikatlarni olish (pagination va filter bilan).

**Endpoint:** `GET /api/admin/certificates`

**Access:** Private (Admin JWT token talab qiladi)

**Query Parameters:**
- `candidateId` (optional) - Filter by candidate ID
- `vacancyId` (optional) - Filter by vacancy ID
- `status` (optional) - Filter by status: `active` yoki `revoked`
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
    "certificates": [
      {
        "_id": "507f1f77bcf86cd799439071",
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
        "interview": {
          "_id": "507f1f77bcf86cd799439061",
          "date": "2024-01-20T00:00:00.000Z",
          "time": "14:00",
          "interviewer": "Ahmadjon Karimov",
          "result": "passed"
        },
        "certificateNumber": "CERT-20240107-1",
        "qrCode": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
        "issuedDate": "2024-01-21T10:30:00.000Z",
        "issuedBy": {
          "_id": "507f1f77bcf86cd799439001",
          "username": "admin",
          "email": "admin@example.com"
        },
        "status": "active",
        "createdAt": "2024-01-21T10:30:00.000Z",
        "updatedAt": "2024-01-21T10:30:00.000Z"
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

### 4. Get Single Certificate

Bitta sertifikatni batafsil ko'rish.

**Endpoint:** `GET /api/admin/certificates/:id`

**Access:** Private (Admin JWT token talab qiladi)

**URL Parameters:**
- `id` - Certificate ID (MongoDB ObjectId)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "certificate": {
      "_id": "507f1f77bcf86cd799439071",
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
      "interview": {
        "_id": "507f1f77bcf86cd799439061",
        "date": "2024-01-20T00:00:00.000Z",
        "time": "14:00",
        "interviewer": "Ahmadjon Karimov",
        "content": "JavaScript va React bo'yicha texnik suhbat",
        "result": "passed",
        "evaluations": [
          {
            "_id": "507f1f77bcf86cd799439062",
            "admin": "507f1f77bcf86cd799439001",
            "text": "Yaxshi bilimga ega, muammolarni hal qilish qobiliyati yuqori",
            "rating": 8,
            "createdAt": "2024-01-20T15:00:00.000Z"
          }
        ]
      },
      "application": {
        "_id": "507f1f77bcf86cd799439021",
        "status": "passed",
        "notes": null,
        "answers": [...]
      },
      "certificateNumber": "CERT-20240107-1",
      "qrCode": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
      "issuedDate": "2024-01-21T10:30:00.000Z",
      "issuedBy": {
        "_id": "507f1f77bcf86cd799439001",
        "username": "admin",
        "email": "admin@example.com"
      },
      "status": "active",
      "createdAt": "2024-01-21T10:30:00.000Z",
      "updatedAt": "2024-01-21T10:30:00.000Z"
    }
  }
}
```

---

### 5. Get Certificate Data for Frontend

Frontend uchun sertifikat ma'lumotlarini olish (ism-familiya, QR kod URL, sertifikat rasmi).

**Endpoint:** `GET /api/admin/certificates/:id/for-frontend`

**Access:** Private (Admin JWT token talab qiladi)

**URL Parameters:**
- `id` - Certificate ID (MongoDB ObjectId)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "certificate": {
      "id": "507f1f77bcf86cd799439071",
      "certificateNumber": "CERT-20240107-1",
      "issuedDate": "2024-01-21T10:30:00.000Z"
    },
    "candidate": {
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe"
    },
    "vacancy": {
      "title": "Senior Full Stack Developer",
      "company": "Tech Solutions LLC"
    },
    "qrCode": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
    "qrCodeUrl": "http://localhost:5173/certificates/verify/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
    "certificateImageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
    }
  }
}
```

**Note:** 
- `certificateImageBase64` - Sertifikat PNG rasmi base64 formatida
- `qrCodeUrl` - QR kod ichiga joylashtiriladigan URL
- Frontend tomonidan:
  1. `certificateImageBase64` dan rasmni olish
  2. `candidate.fullName` ni rasmga yozish
  3. `qrCodeUrl` dan QR kod generatsiya qilish va rasmga joylashtirish

**Example cURL:**
```bash
curl -X GET http://localhost:3000/api/admin/certificates/507f1f77bcf86cd799439071/for-frontend \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 6. Get Certificate Image

Sertifikat rasmini base64 formatida olish.

**Endpoint:** `GET /api/admin/certificates/image`

**Access:** Private (Admin JWT token talab qiladi)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "mimeType": "image/png"
  }
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "success": false,
  "message": "Certificate image not found"
}
```

**Example cURL:**
```bash
curl -X GET http://localhost:3000/api/admin/certificates/image \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 7. Save Certificate Base64

Frontenddan to'g'rilangan sertifikatni (base64 formatida) bazada saqlash.

**Endpoint:** `PUT /api/admin/certificates/:id/save-certificate`

**Access:** Private (Admin JWT token talab qiladi)

**URL Parameters:**
- `id` - Certificate ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "certificateBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Validation Rules:**
- `certificateBase64`: Required, must start with `data:image/`

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Certificate saved successfully",
  "data": {
    "certificate": {
      "id": "507f1f77bcf86cd799439071",
      "certificateNumber": "CERT-20260107-1",
      "qrCode": "c959393d10c6a7404a43d403e020dc084e662b5bb75315e9b45da188010fc679",
      "certificateBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "issuedDate": "2024-01-07T10:30:00.000Z",
      "status": "active"
    }
  }
}
```

**Error Responses:**

**400 Bad Request** - Missing certificateBase64:
```json
{
  "success": false,
  "message": "Certificate base64 is required"
}
```

**400 Bad Request** - Invalid format:
```json
{
  "success": false,
  "message": "Invalid base64 format. Must start with data:image/"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Certificate not found"
}
```

**Example cURL:**
```bash
curl -X PUT http://localhost:3000/api/admin/certificates/507f1f77bcf86cd799439071/save-certificate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "certificateBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }'
```

**Note:** 
- Frontend sertifikatni edit qilgandan keyin (ism-familiya va QR kod qo'shgandan keyin) base64 formatida yuboradi
- Bazada saqlanadi va keyinchalik ko'rish yoki yuklab olish uchun ishlatiladi

---

### 8. Revoke Certificate

Sertifikatni bekor qilish (revoke).

**Endpoint:** `PATCH /api/admin/certificates/:id/revoke`

**Access:** Private (Admin JWT token talab qiladi)

**URL Parameters:**
- `id` - Certificate ID (MongoDB ObjectId)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Certificate revoked successfully",
  "data": {
    "certificate": {
      "_id": "507f1f77bcf86cd799439071",
      "status": "revoked",
      ...
    }
  }
}
```

**Error Responses:**

**400 Bad Request** - Already revoked:
```json
{
  "success": false,
  "message": "Certificate is already revoked"
}
```

---

## QR Code Verification (Public Endpoint)

### Verify Certificate by QR Code

QR kod orqali sertifikatni tekshirish - frontend URL ga redirect qiladi.

**Endpoint:** `GET /api/certificates/verify/:qrCode`

**Access:** Public (Token talab qilmaydi)

**URL Parameters:**
- `qrCode` - QR kod token (64 belgili hex string)

**Query Parameters:**
- `format` (optional) - Response format: `json` (default: redirect to frontend)

**Note:** 
- Default holatda endpoint frontend URL ga redirect qiladi: `{FRONTEND_URL}/certificates/verify/{qrCode}`
- `format=json` parametri bilan JSON response olish mumkin (API integratsiya uchun)
- Frontend tomonidan ma'lumotlar olinadi va chiroyli sahifada render qilinadi

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
        "certificate": {
          "id": "507f1f77bcf86cd799439071",
          "certificateNumber": "CERT-20240107-1",
          "issuedDate": "2024-01-07T10:30:00.000Z",
          "status": "active"
        },
    "candidate": {
      "id": "507f1f77bcf86cd799439013",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "phone": "+998901234567",
      "telegramId": "123456789",
      "registrationType": "web"
    },
    "vacancy": {
      "id": "507f1f77bcf86cd799439011",
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
    "interview": {
      "id": "507f1f77bcf86cd799439061",
      "date": "2024-01-20T00:00:00.000Z",
      "time": "14:00",
      "interviewer": "Ahmadjon Karimov",
      "content": "JavaScript va React bo'yicha texnik suhbat",
      "result": "passed",
          "evaluations": [
            {
              "id": "507f1f77bcf86cd799439062",
              "admin": {
                "id": "507f1f77bcf86cd799439001",
                "username": "admin"
              },
              "text": "Yaxshi bilimga ega, muammolarni hal qilish qobiliyati yuqori",
              "rating": 8,
              "createdAt": "2024-01-20T15:00:00.000Z"
            }
          ],
          "averageRating": 8.0
        },
        "application": {
          "id": "507f1f77bcf86cd799439021",
          "status": "passed",
          "notes": null,
          "answers": [...]
        },
        "testResults": [
          {
            "id": "507f1f77bcf86cd799439051",
            "material": {
              "id": "507f1f77bcf86cd799439031",
              "title": "JavaScript Asoslari"
            },
            "score": 85,
            "correctCount": 17,
            "incorrectCount": 3,
            "totalQuestions": 20,
            "completedAt": "2024-01-18T14:30:00.000Z"
          }
        ],
        "averageTestScore": 85.0
      }
    }
    ```

**Error Responses:**

**404 Not Found:**
```json
{
  "success": false,
  "message": "Certificate not found or revoked"
}
```

**Example cURL - Redirect (default):**
```bash
curl -X GET http://localhost:3000/api/certificates/verify/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
# Redirects to: http://localhost:5173/certificates/verify/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

**Example cURL - JSON Format:**
```bash
curl -X GET "http://localhost:3000/api/certificates/verify/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6?format=json"
```

**Note:** 
- Default holatda endpoint frontend URL ga redirect qiladi
- `format=json` parametri bilan JSON response olish mumkin
- Frontend tomonidan ma'lumotlar olinadi va chiroyli sahifada render qilinadi
- JSON response da quyidagi ma'lumotlar mavjud:
  - Nomzod ma'lumotlari (ism, familiya, telefon, telegram)
  - Vakansiya ma'lumotlari (nomi, bo'lim, lavozim, kompaniya)
  - Suhbat ma'lumotlari (kun, vaqt, o'tkazuvchi, natija)
  - Baxolashlar (barcha adminlar tomonidan berilgan baxolashlar va o'rtacha baxo)
  - Test natijalari (barcha materiallar uchun test natijalari va o'rtacha ball)
  - Sertifikat raqami va berilgan sana
- Frontend o'zi HTML render qiladi, bu xavfsizlik uchun yaxshi yondashuv

---

## Frontend Integration

### Certificate Image Editing

Frontend tomonidan sertifikat PNG rasmini edit qilish uchun quyidagi endpointdan foydalaning:

**Endpoint:** `GET /api/admin/certificates/:id/for-frontend`

Bu endpoint quyidagi ma'lumotlarni qaytaradi:
- `certificateImageBase64` - Sertifikat PNG rasmi base64 formatida
- `candidate.fullName` - Ism-familiya (rasmga yozish uchun)
- `qrCodeUrl` - QR kod URL (QR kod generatsiya qilish va rasmga joylashtirish uchun)
- `certificate.certificateNumber` - Sertifikat raqami

### Example Frontend Flow

#### 1. Certificate Image Editing

```javascript
// Get certificate data for frontend
const response = await fetch(`/api/admin/certificates/${certificateId}/for-frontend`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { data } = await response.json();

// Load certificate image from base64
const img = new Image();
img.src = data.certificateImageBase64;

// Create canvas and draw image
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = img.width;
canvas.height = img.height;
ctx.drawImage(img, 0, 0);

// Add candidate name to image
ctx.font = 'bold 48px Arial';
ctx.fillStyle = '#1e3c72';
ctx.textAlign = 'center';
ctx.fillText(data.candidate.fullName, canvas.width / 2, 400); // Adjust position

// Generate QR code
const qrCodeImage = await generateQRCode(data.qrCodeUrl);

// Add QR code to image
const qrImg = new Image();
qrImg.src = qrCodeImage;
qrImg.onload = () => {
  ctx.drawImage(qrImg, 100, 500, 200, 200); // Adjust position and size
  
  // Convert canvas to image
  const finalImage = canvas.toDataURL('image/png');
  
  // Download or display the edited certificate
  downloadImage(finalImage, `certificate-${data.certificate.certificateNumber}.png`);
};
```

#### 2. QR Code Verification Page

```javascript
// Get certificate data from QR code
const qrCode = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6';
const response = await fetch(`/api/certificates/verify/${qrCode}`);
const { data } = await response.json();

// Render certificate information in a beautiful page
function renderCertificatePage(data) {
  // Use data to render:
  // - Candidate information
  // - Vacancy information
  // - Interview information
  // - Evaluations (with average rating)
  // - Test results (with average score)
  // - Certificate number
}
```

### QR Code URL Format

QR kod ichida quyidagi URL bo'lishi kerak (frontend URL):
- Production: `https://yourdomain.com/certificates/verify/{qrCode}`
- Development: `http://localhost:5173/certificates/verify/{qrCode}`

QR kod skaner qilganda:
1. Backend URL ga so'rov yuboriladi: `http://localhost:3000/api/certificates/verify/{qrCode}`
2. Backend avtomatik frontend URL ga redirect qiladi: `http://localhost:5173/certificates/verify/{qrCode}`
3. Frontend tomonidan ma'lumotlar olinadi va chiroyli sahifada ko'rsatiladi

---

## Filtering

Get All Certificates endpointida quyidagi filterlar mavjud:

- `candidateId` - Nomzod ID bo'yicha filter
- `vacancyId` - Vakansiya ID bo'yicha filter
- `status` - Status bo'yicha filter (active/revoked)

---

## Pagination

Barcha list endpointlarida pagination qo'llab-quvvatlanadi:

- `page` - Joriy sahifa raqami (default: 1)
- `limit` - Har bir sahifadagi elementlar soni (default: 10)

---

## Security Notes

1. **Authentication:** Admin endpointlari JWT token talab qiladi
2. **QR Code Verification:** Public endpoint, lekin faqat `active` status dagi sertifikatlar tekshiriladi
3. **Unique Constraints:** Har bir interview uchun faqat bitta sertifikat bo'lishi mumkin
4. **Certificate Revocation:** Revoked sertifikatlar QR kod orqali tekshirilmaydi

---

## Important Notes

1. **Certificate Eligibility:** Faqat `status: 'completed'` va `result: 'passed'` bo'lgan suhbatlar uchun sertifikat beriladi
2. **One Certificate Per Interview:** Har bir interview uchun faqat bitta sertifikat bo'lishi mumkin
3. **QR Code Format:** QR kod 64 belgili hex string bo'lib, unique token sifatida ishlatiladi
4. **Certificate Number:** Avtomatik generatsiya qilinadi, format: `CERT-YYYYMMDD-N` (N - o'sha kunda berilgan sertifikatlar soni)
5. **Public Verification:** QR kod skaner qilganda, endpoint JSON response qaytaradi va frontend tomonidan chiroyli sahifada render qilinadi
6. **Security:** Backend HTML render qilmaydi, faqat JSON ma'lumotlar qaytaradi. Bu xavfsizlik uchun yaxshi yondashuv

---

## Error Handling

Barcha error response lar quyidagi formatda:

```json
{
  "success": false,
  "message": "Error message description"
}
```

Validation errorlarida qo'shimcha `errors` array qaytariladi:

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "Error message 1",
    "Error message 2"
  ]
}
```

