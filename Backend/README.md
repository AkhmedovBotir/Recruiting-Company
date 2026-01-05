# HR Company Backend

Node.js, Express.js va MongoDB asosida yaratilgan monolitik backend API.

## Texnologiyalar

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (Mongoose ODM)
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## O'rnatish

### 1. Dependencies o'rnatish

```bash
npm install
```

### 2. Environment Variables

`.env.example` faylini `.env` ga ko'chiring va kerakli qiymatlarni to'ldiring:

```bash
cp .env.example .env
```

Yoki `.env` faylini qo'lda yarating va quyidagi o'zgaruvchilarni to'ldiring:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hr_company
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
```

### 3. MongoDB ni ishga tushiring

MongoDB ni lokal yoki remote serverda ishga tushiring va `MONGODB_URI` ni to'g'ri sozlang.

### 4. Admin User yaratish

Birinchi admin userni yaratish uchun:

```bash
npm run create:admin
```

Script sizdan quyidagi ma'lumotlarni so'raydi:
- Username
- Email
- Password
- Role (admin/super_admin)

### 5. Serverni ishga tushirish

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server `http://localhost:3000` da ishga tushadi.

## API Endpoints

### Health Check
```
GET /health
```

### Admin Authentication

Batafsil ma'lumot uchun [Admin Authentication Documentation](./docs/admin-auth.md) ni ko'ring.

- `POST /api/admin/login` - Admin login
- `GET /api/admin/me` - Joriy admin ma'lumotlari (Protected)

## File Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   └── adminController.js   # Admin business logic
├── docs/
│   └── admin-auth.md        # Admin auth documentation
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   └── validator.js         # Request validation
├── models/
│   └── Admin.js             # Admin model
├── routes/
│   └── adminRoutes.js       # Admin routes
├── scripts/
│   └── createAdmin.js       # Admin creation script
├── utils/
│   └── generateToken.js     # JWT token generator
├── app.js                   # Express app setup
├── server.js                 # Server entry point
├── .env.example             # Environment variables example
├── .gitignore
├── package.json
└── README.md
```

## Scripts

- `npm start` - Production mode da server ishga tushirish
- `npm run dev` - Development mode da server ishga tushirish (nodemon)
- `npm run create:admin` - Yangi admin user yaratish

## Documentation

Batafsil API dokumentatsiyasi uchun `docs/` papkasiga qarang.

