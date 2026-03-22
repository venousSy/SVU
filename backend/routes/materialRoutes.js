const express = require('express');
const router = express.Router();
const { getMaterials, createMaterial } = require('../controllers/materialController');

router.route('/').get(getMaterials).post(createMaterial);

module.exports = router;
