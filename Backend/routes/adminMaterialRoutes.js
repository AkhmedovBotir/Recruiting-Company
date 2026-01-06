const express = require('express');
const router = express.Router();
const {
  getMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} = require('../controllers/adminMaterialController');
const {
  validateMaterialCreate,
  validateMaterialUpdate,
} = require('../middleware/materialValidator');
const { protect } = require('../middleware/auth');

// All routes require admin authentication
router.use(protect);

// Routes
router.get('/', getMaterials);
router.get('/:id', getMaterial);
router.post('/', validateMaterialCreate, createMaterial);
router.put('/:id', validateMaterialUpdate, updateMaterial);
router.delete('/:id', deleteMaterial);

module.exports = router;


