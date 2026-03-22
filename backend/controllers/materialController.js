const Material = require('../models/Material');

// @desc    Get all materials, with optional search query
// @route   GET /api/materials
// @access  Public
const getMaterials = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          $or: [
            { title: { $regex: req.query.keyword, $options: 'i' } },
            { description: { $regex: req.query.keyword, $options: 'i' } },
          ],
        }
      : {};

    const materials = await Material.find({ ...keyword }).populate('uploadedBy', 'name');
    res.json(materials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching materials' });
  }
};

module.exports = {
  getMaterials,
};
