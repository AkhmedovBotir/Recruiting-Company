const express = require('express');
const router = express.Router();
const {
  saveVacancy,
  unsaveVacancy,
  getSavedVacancies,
  checkSavedVacancy,
} = require('../controllers/webSavedVacancyController');
const { validateSaveVacancy } = require('../middleware/savedVacancyValidator');
const { protect } = require('../middleware/candidateAuth');

// All routes require candidate authentication
router.use(protect);

// Routes
router.get('/', getSavedVacancies);
router.get('/check/:vacancyId', checkSavedVacancy);
router.post('/', validateSaveVacancy, saveVacancy);
router.delete('/:vacancyId', unsaveVacancy);

module.exports = router;


