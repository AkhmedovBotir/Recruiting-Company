# Web Certificate API Documentation

Bu hujjat Web sayt uchun nomzodlarning o'z sertifikatlarini ko'rish va yuklab olish API endpoints va ularning ishlatilishini tushuntiradi.

## Base URL

```
http://localhost:3000/api/web/certificates
```

## Authentication

Barcha endpointlar JWT token talab qiladi. Token `Authorization` header orqali yuboriladi:

```
Authorization: Bearer <your-token>
```

Token candidate login yoki registration orqali olinadi (candidate-web-api.md ga qarang).

---

## Certificate Model

Certificate quyidagi maydonlarga ega:

- `candidate` (ObjectId, required) - Nomzod ID (reference to Candidate)
- `vacancy` (ObjectId, required) - Vakansiya ID (reference to Vacancy)
- `interview` (ObjectId, required) - Suhbat ID (reference to Interview)
- `application` (ObjectId, optional) - Application ID (reference to Application)
- `certificateNumber` (String, unique) - Sertifikat raqami (format: CERT-YYYYMMDD-N)
- `qrCode` (String, unique) - QR kod token
- `certificateBase64` (String, optional) - Sertifikat rasmi (base64 formatida)
- `issuedDate` (Date, required) - Berilgan sana
- `issuedBy` (ObjectId, required) - Admin ID (reference to Admin)
- `status` (String, enum: ['active', 'revoked']) - Status (default: 'active')
- `createdAt` (Date) - Yaratilgan vaqt
- `updatedAt` (Date) - Yangilangan vaqt

### Certificate Status Values

- `active` - Faol (default)
- `revoked` - Bekor qilingan

---

## Endpoints

### 1. Get My Certificates

Joriy nomzodning barcha sertifikatlarini olish.

**Endpoint:** `GET /api/web/certificates`

**Access:** Private (JWT token talab qiladi)

**Query Parameters:**
- `status` (optional) - Filter by status: `active`, `revoked`
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
        "candidate": "507f1f77bcf86cd799439013",
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
        "certificateNumber": "CERT-20240120-1",
        "qrCode": "c959393d10c6a7404a43d403e020dc084e662b5bb75315e9b45da188010fc679",
        "issuedDate": "2024-01-21T10:00:00.000Z",
        "status": "active",
        "createdAt": "2024-01-21T10:00:00.000Z",
        "updatedAt": "2024-01-21T10:00:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439072",
        "candidate": "507f1f77bcf86cd799439013",
        "vacancy": {
          "_id": "507f1f77bcf86cd799439014",
          "title": "Frontend Developer",
          "department": "IT",
          "position": "Middle Developer",
          "company": {
            "_id": "507f1f77bcf86cd799439015",
            "name": "Digital Agency",
            "inn": "987654321"
          }
        },
        "interview": {
          "_id": "507f1f77bcf86cd799439062",
          "date": "2024-01-18T00:00:00.000Z",
          "time": "10:00",
          "interviewer": "Sardor Toshmatov",
          "result": "passed"
        },
        "certificateNumber": "CERT-20240118-1",
        "qrCode": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
        "issuedDate": "2024-01-19T09:00:00.000Z",
        "status": "active",
        "createdAt": "2024-01-19T09:00:00.000Z",
        "updatedAt": "2024-01-19T09:00:00.000Z"
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

**401 Unauthorized** - Token yo'q yoki noto'g'ri:
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

---

### 2. Get Single Certificate

Joriy nomzodning bitta sertifikatini batafsil ma'lumotlari bilan olish.

**Endpoint:** `GET /api/web/certificates/:id`

**Access:** Private (JWT token talab qiladi)

**URL Parameters:**
- `id` (required) - Sertifikat ID (MongoDB ObjectId)

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
    "certificate": {
      "_id": "507f1f77bcf86cd799439071",
      "candidate": {
        "_id": "507f1f77bcf86cd799439013",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+998901234567",
        "telegramId": "@johndoe"
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
          "ownerFullName": "Ahmadjon Karimov",
          "companyPhone": "+998901111111"
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
            "_id": "507f1f77bcf86cd799439063",
            "admin": {
              "_id": "507f1f77bcf86cd799439001",
              "username": "admin"
            },
            "text": "Yaxshi bilimga ega, muammolarni hal qilish qobiliyati yuqori.",
            "rating": 8,
            "createdAt": "2024-01-20T15:00:00.000Z"
          }
        ]
      },
      "application": {
        "_id": "507f1f77bcf86cd799439021",
        "status": "passed",
        "notes": null
      },
      "certificateNumber": "CERT-20240120-1",
      "qrCode": "c959393d10c6a7404a43d403e020dc084e662b5bb75315e9b45da188010fc679",
      "qrCodeUrl": "http://localhost:5173/certificates/verify/c959393d10c6a7404a43d403e020dc084e662b5bb75315e9b45da188010fc679",
      "issuedBy": {
        "_id": "507f1f77bcf86cd799439001",
        "username": "admin",
        "email": "admin@example.com"
      },
      "issuedDate": "2024-01-21T10:00:00.000Z",
      "status": "active",
      "createdAt": "2024-01-21T10:00:00.000Z",
      "updatedAt": "2024-01-21T10:00:00.000Z"
    }
  }
}
```

**Error Responses:**

**400 Bad Request** - Noto'g'ri sertifikat ID:
```json
{
  "success": false,
  "message": "Invalid certificate ID"
}
```

**401 Unauthorized** - Token yo'q yoki noto'g'ri:
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**404 Not Found** - Sertifikat topilmadi yoki nomzodga tegishli emas:
```json
{
  "success": false,
  "message": "Certificate not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error"
}
```

---

### 3. Download Certificate

Sertifikat rasmini base64 formatida yuklab olish.

**Endpoint:** `GET /api/web/certificates/:id/download`

**Access:** Private (JWT token talab qiladi)

**URL Parameters:**
- `id` (required) - Sertifikat ID (MongoDB ObjectId)

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
    "certificate": {
      "id": "507f1f77bcf86cd799439071",
      "certificateNumber": "CERT-20240120-1",
      "issuedDate": "2024-01-21T10:00:00.000Z",
      "candidate": {
        "firstName": "John",
        "lastName": "Doe",
        "fullName": "John Doe"
      },
      "vacancy": {
        "title": "Senior Full Stack Developer",
        "company": "Tech Solutions LLC"
      }
    },
    "certificateImageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
}
```

**Error Responses:**

**400 Bad Request** - Noto'g'ri sertifikat ID:
```json
{
  "success": false,
  "message": "Invalid certificate ID"
}
```

**401 Unauthorized** - Token yo'q yoki noto'g'ri:
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**404 Not Found** - Sertifikat topilmadi, nomzodga tegishli emas yoki rasm mavjud emas:
```json
{
  "success": false,
  "message": "Certificate not found"
}
```

yoki

```json
{
  "success": false,
  "message": "Certificate image not available"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error"
}
```

---

## Notes

1. **Authentication:** Barcha endpointlar JWT token talab qiladi. Token `Authorization` header orqali `Bearer <token>` formatida yuborilishi kerak.

2. **Authorization:** Nomzod faqat o'ziga tegishli sertifikatlarni ko'ra oladi. Boshqa nomzodning sertifikatiga kirishga harakat qilinsa, 404 Not Found xatosi qaytariladi.

3. **Certificate Image:** Sertifikat rasmi `certificateBase64` maydonida saqlanadi va faqat admin tomonidan yuklanganidan keyin mavjud bo'ladi. Agar rasm mavjud bo'lmasa, download endpoint 404 xatosi qaytaradi.

4. **QR Code Verification:** Sertifikatning QR kodi skaner qilinganda, frontend URL ga yo'naltiriladi: `http://localhost:5173/certificates/verify/{qrCode}`. Bu URL `qrCodeUrl` maydonida qaytariladi.

5. **Pagination:** Ro'yxat endpointlarida pagination qo'llab-quvvatlanadi. `page` va `limit` query parametrlari orqali boshqariladi.

6. **Status Filtering:** `status` query parametri orqali faqat faol yoki bekor qilingan sertifikatlarni filterlash mumkin.

7. **Certificate Number Format:** Sertifikat raqami `CERT-YYYYMMDD-N` formatida bo'ladi, bu yerda:
   - `YYYYMMDD` - berilgan sana
   - `N` - shu kundagi ketma-ket raqam

---

## Example Usage

### JavaScript (Fetch API)

```javascript
// Get my certificates
const getMyCertificates = async (token) => {
  const response = await fetch('http://localhost:3000/api/web/certificates', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data;
};

// Get single certificate
const getCertificate = async (token, certificateId) => {
  const response = await fetch(`http://localhost:3000/api/web/certificates/${certificateId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data;
};

// Download certificate
const downloadCertificate = async (token, certificateId) => {
  const response = await fetch(`http://localhost:3000/api/web/certificates/${certificateId}/download`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  
  if (data.success && data.data.certificateImageBase64) {
    // Convert base64 to blob and download
    const base64Data = data.data.certificateImageBase64.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-${data.data.certificate.certificateNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
  
  return data;
};
```

### cURL

```bash
# Get my certificates
curl -X GET "http://localhost:3000/api/web/certificates" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Get single certificate
curl -X GET "http://localhost:3000/api/web/certificates/507f1f77bcf86cd799439071" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Download certificate
curl -X GET "http://localhost:3000/api/web/certificates/507f1f77bcf86cd799439071/download" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Error Handling

Barcha endpointlar quyidagi umumiy xato kodlarini qaytarishi mumkin:

- **400 Bad Request** - Noto'g'ri so'rov (validation xatosi, noto'g'ri ID format)
- **401 Unauthorized** - Autentifikatsiya talab qilinadi yoki token noto'g'ri
- **404 Not Found** - Sertifikat topilmadi yoki nomzodga tegishli emas
- **500 Internal Server Error** - Server xatosi

Xato javoblari quyidagi formatda bo'ladi:

```json
{
  "success": false,
  "message": "Error message"
}
```

