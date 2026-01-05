const express = require('express');
const router = express.Router();
const {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
} = require('../controllers/companyController');
const {
  validateCompanyCreate,
  validateCompanyUpdate,
} = require('../middleware/companyValidator');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Routes
router.get('/', getCompanies);
router.get('/:id', getCompany);
router.post('/', validateCompanyCreate, createCompany);
router.put('/:id', validateCompanyUpdate, updateCompany);
router.delete('/:id', deleteCompany);

module.exports = router;

