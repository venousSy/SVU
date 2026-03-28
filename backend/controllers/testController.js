const MockTest = require('../models/MockTest');

// @desc    Save a generated mock test
// @route   POST /api/tests
// @access  Public
const saveTest = async (req, res) => {
  try {
    const { materialId, testContent } = req.body;

    if (!materialId || !testContent) {
      return res.status(400).json({ message: 'materialId and testContent are required' });
    }

    const test = new MockTest({
      materialId,
      testContent
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
// @access  Public
const getTestByMaterialId = async (req, res) => {
  try {
    const { materialId } = req.params;
    
    // Find the most recent test for this material globally
    const test = await MockTest.findOne({ materialId }).sort({ createdAt: -1 });
    
    if (test) {
      return res.json(test);
    }
    
    return res.status(404).json({ message: 'No test found for this material' });
  } catch (error) {
    console.error('Error fetching mock test by material ID:', error);
    res.status(500).json({ message: 'Server Error fetching mock test' });
  }
};

// @desc    Get all saved mock tests
// @route   GET /api/tests
// @access  Public
const getAllTests = async (req, res) => {
  try {
    // Populate material to show the title in the UI
    const tests = await MockTest.find().populate('materialId', 'title description').sort({ createdAt: -1 });
    res.json(tests);
  } catch (error) {
    console.error('Error fetching all mock tests:', error);
    res.status(500).json({ message: 'Server Error fetching all mock tests' });
  }
};

module.exports = {
  saveTest,
  getTestByMaterialId,
  getAllTests
};
