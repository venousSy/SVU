const express = require('express');
const router = express.Router();
const { getMaterials, createMaterial, extractText } = require('../controllers/materialController');

router.route('/').get(getMaterials).post(createMaterial);
router.route('/:id/extract-text').post(extractText);
router.route('/:id/generate-test').post(extractText);

module.exports = router;
