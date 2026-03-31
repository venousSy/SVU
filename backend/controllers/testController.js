const MockTest = require('../models/MockTest');

const MAX_TESTS_PER_USER = 5;

// @desc    Save a generated mock test (enforces 5-test global limit per user)
// @route   POST /api/tests
// @access  Protected
const saveTest = async (req, res) => {
  try {
    const { materialId, testContent } = req.body;

    if (!materialId || !testContent) {
      return res.status(400).json({ message: 'materialId and testContent are required' });
    }

    // Enforce per-user limit (global, across all materials)
    const userTestCount = await MockTest.countDocuments({ createdBy: req.user._id });
    if (userTestCount >= MAX_TESTS_PER_USER) {
      return res.status(403).json({
        message: `You have reached the limit of ${MAX_TESTS_PER_USER} created tests. You can still view any existing tests.`,
        limitReached: true,
        count: userTestCount,
      });
    }

    const test = new MockTest({
      materialId,
      testContent,
      createdBy: req.user._id,
    });

    const savedTest = await test.save();
    res.status(201).json(savedTest);
  } catch (error) {
    console.error('Error saving mock test:', error);
    res.status(500).json({ message: 'Server Error saving mock test' });
  }
};

// @desc    Check if a test exists for a specific material
// @route   GET /api/tests/:materialId
// @access  Protected
const getTestByMaterialId = async (req, res) => {
  try {
    const { materialId } = req.params;

    // Find all tests for this material (most recent first)
    const tests = await MockTest.find({ materialId }).sort({ createdAt: -1 });

    if (tests.length > 0) {
      return res.json({ tests, count: tests.length });
    }

    return res.status(404).json({ message: 'No test found for this material' });
  } catch (error) {
    console.error('Error fetching mock test by material ID:', error);
    res.status(500).json({ message: 'Server Error fetching mock test' });
  }
};

// @desc    Get all saved mock tests
// @route   GET /api/tests
// @access  Protected
const getAllTests = async (req, res) => {
  try {
    const tests = await MockTest
      .find()
      .populate('materialId', 'title description')
      .sort({ createdAt: -1 });
    res.json(tests);
  } catch (error) {
    console.error('Error fetching all mock tests:', error);
    res.status(500).json({ message: 'Server Error fetching all mock tests' });
  }
};

// @desc    Get the current user's test creation count
// @route   GET /api/tests/user/count
// @access  Protected
const getUserTestCount = async (req, res) => {
  try {
    const count = await MockTest.countDocuments({ createdBy: req.user._id });
    res.json({ count, limit: MAX_TESTS_PER_USER, limitReached: count >= MAX_TESTS_PER_USER });
  } catch (error) {
    console.error('Error fetching user test count:', error);
    res.status(500).json({ message: 'Server Error fetching user test count' });
  }
};

module.exports = {
  saveTest,
  getTestByMaterialId,
  getAllTests,
  getUserTestCount,
};
