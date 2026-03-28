const express = require('express');
const router = express.Router();
const { saveTest, getTestByMaterialId, getAllTests } = require('../controllers/testController');

router.route('/')
  .post(saveTest)
  .get(getAllTests);

router.route('/:materialId')
  .get(getTestByMaterialId);

module.exports = router;
