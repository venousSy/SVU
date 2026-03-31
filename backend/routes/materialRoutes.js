const express = require('express');
const router = express.Router();
const { getMaterials, createMaterial, extractText } = require('../controllers/materialController');
const { protect } = require('../middleware/authMiddleware');

// GET is public — anyone can see the cards
router.route('/').get(getMaterials).post(protect, createMaterial);

// Text extraction and test generation require login
router.route('/:id/extract-text').post(protect, extractText);
router.route('/:id/generate-test').post(protect, extractText);

module.exports = router;
