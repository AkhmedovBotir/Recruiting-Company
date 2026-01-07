# Company Integration API Documentation

Bu hujjat kompaniyalar uchun integrasiya API endpoints va ularning ishlatilishini tushuntiradi. Bu API kompaniyalarga o'z tizimlarini bizning platforma bilan integratsiya qilish imkonini beradi.

## Base URL

```
http://localhost:3000/api/company-integration
```

## Authentication

**Bu API endpointlar authentication talab qilmaydi (public endpoints).** Barcha endpointlar ochiq va hech qanday token yoki autentifikatsiya kerak emas.

---

## Endpoints

### 1. Get Candidate Data by Certificate ID

Sertifikat ID orqali nomzodning barcha ma'lumotlarini olish.

**Endpoint:** `GET /api/company-integration/certificate/:certificateId`

**Access:** Public (Authentication talab qilmaydi)

**URL Parameters:**
- `certificateId` (required) - Sertifikat ID (MongoDB ObjectId)

**Request Headers:**
```
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
      "qrCode": "c959393d10c6a7404a43d403e020dc084e662b5bb75315e9b45da188010fc679",
      "issuedDate": "2024-01-21T10:00:00.000Z",
      "status": "active"
    },
    "candidate": {
      "id": "507f1f77bcf86cd799439013",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "phone": "+998901234567",
      "telegramId": "@johndoe",
      "registrationType": "web"
    },
    "vacancy": {
      "id": "507f1f77bcf86cd799439011",
      "title": "Senior Full Stack Developer",
      "department": "IT",
      "position": "Senior Developer",
      "experience": "3-5 years",
      "workType": "full-time",
      "minAge": 25,
      "maxAge": 40,
      "salary": "1500-2000 USD",
      "description": "We are looking for an experienced Full Stack Developer...",
      "responsibilities": [
        "Develop and maintain web applications",
        "Collaborate with cross-functional teams"
      ],
      "preferences": [
        "Experience with React and Node.js",
        "Strong problem-solving skills"
      ],
      "skills": [
        "JavaScript",
        "React",
        "Node.js",
        "MongoDB"
      ],
      "company": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Tech Solutions LLC",
        "inn": "123456789",
        "ownerFullName": "Ahmadjon Karimov",
        "companyPhone": "+998901111111"
      }
    },
    "interview": {
      "id": "507f1f77bcf86cd799439061",
      "date": "2024-01-20T00:00:00.000Z",
      "time": "14:00",
      "interviewer": "Ahmadjon Karimov",
      "content": "JavaScript va React bo'yicha texnik suhbat",
      "location": "Zoom: https://zoom.us/j/123456789",
      "result": "passed",
      "status": "completed",
      "evaluations": [
        {
          "id": "507f1f77bcf86cd799439063",
          "admin": {
            "id": "507f1f77bcf86cd799439001",
            "username": "admin"
          },
          "text": "Yaxshi bilimga ega, muammolarni hal qilish qobiliyati yuqori. Kommunikatsiya qobiliyati yaxshi.",
          "rating": 8,
          "createdAt": "2024-01-20T15:00:00.000Z"
        },
        {
          "id": "507f1f77bcf86cd799439064",
          "admin": {
            "id": "507f1f77bcf86cd799439002",
            "username": "admin2"
          },
          "text": "Texnik bilimlar yaxshi, lekin tajriba yetarli emas.",
          "rating": 6,
          "createdAt": "2024-01-20T15:30:00.000Z"
        }
      ],
      "averageRating": 7.0
    },
    "application": {
      "id": "507f1f77bcf86cd799439021",
      "status": "passed",
      "notes": null,
      "createdAt": "2024-01-15T12:00:00.000Z",
      "updatedAt": "2024-01-20T15:30:00.000Z"
    },
    "testResults": [
      {
        "id": "507f1f77bcf86cd799439051",
        "material": {
          "id": "507f1f77bcf86cd799439031",
          "title": "JavaScript Fundamentals"
        },
        "answers": [
          {
            "questionIndex": 0,
            "answer": "A",
            "isCorrect": true
          },
          {
            "questionIndex": 1,
            "answer": "B",
            "isCorrect": true
          },
          {
            "questionIndex": 2,
            "answer": "C",
            "isCorrect": false
          }
        ],
        "correctCount": 2,
        "incorrectCount": 1,
        "totalQuestions": 3,
        "score": 66.67,
        "completedAt": "2024-01-16T10:00:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439052",
        "material": {
          "id": "507f1f77bcf86cd799439032",
          "title": "React Advanced"
        },
        "answers": [
          {
            "questionIndex": 0,
            "answer": "A",
            "isCorrect": true
          },
          {
            "questionIndex": 1,
            "answer": "A",
            "isCorrect": true
          },
          {
            "questionIndex": 2,
            "answer": "B",
            "isCorrect": true
          }
        ],
        "correctCount": 3,
        "incorrectCount": 0,
        "totalQuestions": 3,
        "score": 100,
        "completedAt": "2024-01-17T14:00:00.000Z"
      }
    ],
    "averageTestScore": 83.34,
    "issuedBy": {
      "id": "507f1f77bcf86cd799439001",
      "username": "admin",
      "email": "admin@example.com"
    }
  }
}
```

**Error Responses:**

**400 Bad Request** - Sertifikat bekor qilingan:
```json
{
  "success": false,
  "message": "Certificate is revoked"
}
```

**404 Not Found** - Sertifikat topilmadi:
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

### 2. Get Candidate Data by Certificate Number

Sertifikat raqami orqali nomzodning barcha ma'lumotlarini olish.

**Endpoint:** `GET /api/company-integration/certificate-number/:certificateNumber`

**Access:** Public (Authentication talab qilmaydi)

**URL Parameters:**
- `certificateNumber` (required) - Sertifikat raqami (format: CERT-YYYYMMDD-N, masalan: CERT-20240120-1)

**Request Headers:**
```
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
      "qrCode": "c959393d10c6a7404a43d403e020dc084e662b5bb75315e9b45da188010fc679",
      "issuedDate": "2024-01-21T10:00:00.000Z",
      "status": "active"
    },
    "candidate": {
      "id": "507f1f77bcf86cd799439013",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "phone": "+998901234567",
      "telegramId": "@johndoe",
      "registrationType": "web"
    },
    "vacancy": {
      "id": "507f1f77bcf86cd799439011",
      "title": "Senior Full Stack Developer",
      "department": "IT",
      "position": "Senior Developer",
      "experience": "3-5 years",
      "workType": "full-time",
      "minAge": 25,
      "maxAge": 40,
      "salary": "1500-2000 USD",
      "description": "We are looking for an experienced Full Stack Developer...",
      "responsibilities": [
        "Develop and maintain web applications",
        "Collaborate with cross-functional teams"
      ],
      "preferences": [
        "Experience with React and Node.js",
        "Strong problem-solving skills"
      ],
      "skills": [
        "JavaScript",
        "React",
        "Node.js",
        "MongoDB"
      ],
      "company": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Tech Solutions LLC",
        "inn": "123456789",
        "ownerFullName": "Ahmadjon Karimov",
        "companyPhone": "+998901111111"
      }
    },
    "interview": {
      "id": "507f1f77bcf86cd799439061",
      "date": "2024-01-20T00:00:00.000Z",
      "time": "14:00",
      "interviewer": "Ahmadjon Karimov",
      "content": "JavaScript va React bo'yicha texnik suhbat",
      "location": "Zoom: https://zoom.us/j/123456789",
      "result": "passed",
      "status": "completed",
      "evaluations": [
        {
          "id": "507f1f77bcf86cd799439063",
          "admin": {
            "id": "507f1f77bcf86cd799439001",
            "username": "admin"
          },
          "text": "Yaxshi bilimga ega, muammolarni hal qilish qobiliyati yuqori.",
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
      "createdAt": "2024-01-15T12:00:00.000Z",
      "updatedAt": "2024-01-20T15:30:00.000Z"
    },
    "testResults": [
      {
        "id": "507f1f77bcf86cd799439051",
        "material": {
          "id": "507f1f77bcf86cd799439031",
          "title": "JavaScript Fundamentals"
        },
        "answers": [
          {
            "questionIndex": 0,
            "answer": "A",
            "isCorrect": true
          },
          {
            "questionIndex": 1,
            "answer": "B",
            "isCorrect": true
          }
        ],
        "correctCount": 2,
        "incorrectCount": 0,
        "totalQuestions": 2,
        "score": 100,
        "completedAt": "2024-01-16T10:00:00.000Z"
      }
    ],
    "averageTestScore": 100.0,
    "issuedBy": {
      "id": "507f1f77bcf86cd799439001",
      "username": "admin",
      "email": "admin@example.com"
    }
  }
}
```

**Error Responses:**

**400 Bad Request** - Sertifikat bekor qilingan:
```json
{
  "success": false,
  "message": "Certificate is revoked"
}
```

**404 Not Found** - Sertifikat topilmadi:
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

## Response Data Structure

### Certificate Object
- `id` - Sertifikat ID
- `certificateNumber` - Sertifikat raqami (CERT-YYYYMMDD-N formatida)
- `qrCode` - QR kod token
- `issuedDate` - Berilgan sana
- `status` - Status (active yoki revoked)

### Candidate Object
- `id` - Nomzod ID
- `firstName` - Ism
- `lastName` - Familiya
- `fullName` - To'liq ism
- `phone` - Telefon raqami
- `telegramId` - Telegram ID (ixtiyoriy)
- `registrationType` - Ro'yxatdan o'tish turi (bot yoki web)

### Vacancy Object
- `id` - Vakansiya ID
- `title` - Vakansiya nomi
- `department` - Bo'lim
- `position` - Lavozim
- `experience` - Tajriba
- `workType` - Ish turi
- `minAge` - Minimal yosh
- `maxAge` - Maksimal yosh
- `salary` - Maosh
- `description` - Tavsif
- `responsibilities` - Mas'uliyatlar (array)
- `preferences` - Afzalliklar (array)
- `skills` - Ko'nikmalar (array)
- `company` - Kompaniya ma'lumotlari

### Interview Object
- `id` - Suhbat ID
- `date` - Suhbat kuni
- `time` - Suhbat vaqti
- `interviewer` - Suhbat o'tkazuvchi
- `content` - Suhbat mazmuni
- `location` - Suhbat joyi
- `result` - Natija (passed, failed, pending)
- `status` - Status (scheduled, completed, cancelled)
- `evaluations` - Baxolashlar (array)
  - `id` - Baxolash ID
  - `admin` - Admin ma'lumotlari
  - `text` - Baxolash matni
  - `rating` - Baxo (1-10)
  - `createdAt` - Yaratilgan vaqt
- `averageRating` - O'rtacha baxo

### Application Object
- `id` - Application ID
- `status` - Status
- `notes` - Eslatmalar
- `createdAt` - Yaratilgan vaqt
- `updatedAt` - Yangilangan vaqt

### Test Results Array
Har bir test natijasi quyidagi maydonlarga ega:
- `id` - Test natijasi ID
- `material` - Material ma'lumotlari
  - `id` - Material ID
  - `title` - Material nomi
- `answers` - Javoblar (array)
  - `questionIndex` - Savol indeksi
  - `answer` - Javob
  - `isCorrect` - To'g'ri yoki noto'g'ri
- `correctCount` - To'g'ri javoblar soni
- `incorrectCount` - Noto'g'ri javoblar soni
- `totalQuestions` - Jami savollar soni
- `score` - Ball (0-100)
- `completedAt` - Tugallangan vaqt

### Issued By Object
- `id` - Admin ID
- `username` - Admin username
- `email` - Admin email

---

## Notes

1. **Public Access:** Bu API endpointlar authentication talab qilmaydi va ochiqdir. Har qanday kompaniya o'z tizimlariga integratsiya qilish uchun foydalanishi mumkin.

2. **Certificate Status:** Faqat `active` statusdagi sertifikatlar uchun ma'lumotlar qaytariladi. Agar sertifikat `revoked` bo'lsa, 400 Bad Request xatosi qaytariladi.

3. **Data Completeness:** API nomzodning barcha ma'lumotlarini qaytaradi:
   - Shaxsiy ma'lumotlar (ism, familiya, telefon, telegram)
   - Vakansiya ma'lumotlari
   - Suhbat natijalari va baxolashlar
   - Test natijalari (barcha materiallar bo'yicha)
   - Application ma'lumotlari
   - Sertifikat ma'lumotlari

4. **Average Calculations:**
   - `averageRating` - Suhbat baxolashlarining o'rtacha qiymati
   - `averageTestScore` - Barcha test natijalarining o'rtacha balli

5. **Certificate Number Format:** Sertifikat raqami `CERT-YYYYMMDD-N` formatida bo'ladi, bu yerda:
   - `YYYYMMDD` - berilgan sana
   - `N` - shu kundagi ketma-ket raqam

6. **Test Results:** Test natijalari faqat shu vakansiya uchun berilgan materiallar bo'yicha qaytariladi.

---

## Use Cases

### 1. HR System Integration
Kompaniyalar o'z HR tizimlariga integratsiya qilib, sertifikatga ega nomzodlarni avtomatik ravishda o'z xodimlari ro'yxatiga qo'shishlari mumkin.

### 2. Employee Verification
Kompaniyalar xodimning sertifikatini tekshirib, uning malakasini tasdiqlashlari mumkin.

### 3. Automated Onboarding
Sertifikatga ega nomzodlarni avtomatik ravishda onboarding jarayoniga qo'shish.

### 4. Performance Tracking
Nomzodning test natijalari va suhbat baxolashlarini tahlil qilish.

---

## Example Usage

### JavaScript (Fetch API)

```javascript
// Get candidate data by certificate ID
const getCandidateByCertificateId = async (certificateId) => {
  const response = await fetch(
    `http://localhost:3000/api/company-integration/certificate/${certificateId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  return data;
};

// Get candidate data by certificate number
const getCandidateByCertificateNumber = async (certificateNumber) => {
  const response = await fetch(
    `http://localhost:3000/api/company-integration/certificate-number/${certificateNumber}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  return data;
};

// Example: Add candidate to company HR system
const addCandidateToHRSystem = async (certificateId) => {
  const candidateData = await getCandidateByCertificateId(certificateId);
  
  if (candidateData.success) {
    const { candidate, vacancy, interview, testResults } = candidateData.data;
    
    // Add to your HR system
    const employee = {
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      phone: candidate.phone,
      telegramId: candidate.telegramId,
      position: vacancy.position,
      department: vacancy.department,
      interviewRating: interview.averageRating,
      testScore: candidateData.data.averageTestScore,
      certificateNumber: candidateData.data.certificate.certificateNumber,
      issuedDate: candidateData.data.certificate.issuedDate
    };
    
    // Send to your HR system API
    // await yourHRSystemAPI.createEmployee(employee);
    
    return employee;
  }
  
  throw new Error('Failed to get candidate data');
};
```

### cURL

```bash
# Get candidate data by certificate ID
curl -X GET "http://localhost:3000/api/company-integration/certificate/507f1f77bcf86cd799439071" \
  -H "Content-Type: application/json"

# Get candidate data by certificate number
curl -X GET "http://localhost:3000/api/company-integration/certificate-number/CERT-20240120-1" \
  -H "Content-Type: application/json"
```

### Python

```python
import requests

# Get candidate data by certificate ID
def get_candidate_by_certificate_id(certificate_id):
    url = f"http://localhost:3000/api/company-integration/certificate/{certificate_id}"
    response = requests.get(url)
    return response.json()

# Get candidate data by certificate number
def get_candidate_by_certificate_number(certificate_number):
    url = f"http://localhost:3000/api/company-integration/certificate-number/{certificate_number}"
    response = requests.get(url)
    return response.json()

# Example usage
certificate_id = "507f1f77bcf86cd799439071"
data = get_candidate_by_certificate_id(certificate_id)

if data['success']:
    candidate = data['data']['candidate']
    print(f"Candidate: {candidate['fullName']}")
    print(f"Phone: {candidate['phone']}")
    print(f"Average Test Score: {data['data']['averageTestScore']}")
    print(f"Interview Rating: {data['data']['interview']['averageRating']}")
```

### PHP

```php
<?php
// Get candidate data by certificate ID
function getCandidateByCertificateId($certificateId) {
    $url = "http://localhost:3000/api/company-integration/certificate/{$certificateId}";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

// Get candidate data by certificate number
function getCandidateByCertificateNumber($certificateNumber) {
    $url = "http://localhost:3000/api/company-integration/certificate-number/{$certificateNumber}";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

// Example usage
$certificateId = "507f1f77bcf86cd799439071";
$data = getCandidateByCertificateId($certificateId);

if ($data['success']) {
    $candidate = $data['data']['candidate'];
    echo "Candidate: " . $candidate['fullName'] . "\n";
    echo "Phone: " . $candidate['phone'] . "\n";
    echo "Average Test Score: " . $data['data']['averageTestScore'] . "\n";
}
?>
```

---

## Error Handling

Barcha endpointlar quyidagi umumiy xato kodlarini qaytarishi mumkin:

- **400 Bad Request** - Sertifikat bekor qilingan
- **404 Not Found** - Sertifikat topilmadi
- **500 Internal Server Error** - Server xatosi

Xato javoblari quyidagi formatda bo'ladi:

```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Rate Limiting

Hozircha rate limiting qo'llanmaydi, lekin kelajakda qo'shilishi mumkin. Kompaniyalar o'z integratsiyalarida retry logic va error handling qo'llashlari tavsiya etiladi.

---

## Security Considerations

1. **Public Endpoints:** Bu endpointlar public bo'lgani uchun, faqat sertifikat ID yoki raqami orqali ma'lumotlar olinadi. Boshqa ma'lumotlar olinmaydi.

2. **Certificate Status:** Faqat `active` statusdagi sertifikatlar uchun ma'lumotlar qaytariladi.

3. **Data Privacy:** Kompaniyalar olingan ma'lumotlarni xavfsiz saqlashlari va faqat kerakli maqsadlar uchun ishlatishlari kerak.

4. **HTTPS:** Production muhitida HTTPS protokoli ishlatilishi tavsiya etiladi.

