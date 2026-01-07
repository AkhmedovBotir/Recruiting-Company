const express = require('express');
const router = express.Router();
const {
  getVacancies,
  getVacancy,
  getMyProfile,
  getMyApplications,
  getMyInterviews,
  getMyCertificates,
} = require('../controllers/botController');
const { protect } = require('../middleware/candidateAuth');

// All routes require candidate authentication (bot token)
router.use(protect);

// Routes
router.get('/vacancies', getVacancies);
router.get('/vacancies/:id', getVacancy);
router.get('/profile', getMyProfile);
router.get('/applications', getMyApplications);
router.get('/interviews', getMyInterviews);
router.get('/certificates', getMyCertificates);

module.exports = router;

