const express = require('express');
const router = express.Router();
const {
  getVacancies,
  getVacancy,
  createVacancy,
  updateVacancy,
  closeVacancy,
  deleteVacancy,
} = require('../controllers/vacancyController');
const {
  validateVacancyCreate,
  validateVacancyUpdate,
} = require('../middleware/vacancyValidator');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Routes
router.get('/', getVacancies);
router.get('/:id', getVacancy);
router.post('/', validateVacancyCreate, createVacancy);
router.put('/:id', validateVacancyUpdate, updateVacancy);
router.patch('/:id/close', closeVacancy);
router.delete('/:id', deleteVacancy);

module.exports = router;

