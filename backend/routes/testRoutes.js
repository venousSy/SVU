const express = require('express');
const router = express.Router();
const { saveTest, getTestByMaterialId, getAllTests, getUserTestCount } = require('../controllers/testController');
const { protect } = require('../middleware/authMiddleware');

// Must be declared before /:materialId to avoid route conflict
router.get('/user/count', protect, getUserTestCount);

router.route('/')
  .post(protect, saveTest)
  .get(protect, getAllTests);

router.route('/:materialId')
  .get(protect, getTestByMaterialId);

module.exports = router;
