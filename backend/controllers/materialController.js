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

const createMaterial = async (req, res) => {
  try {
    const { title, description, fileUrl, type } = req.body;

    if (!title || !fileUrl) {
      return res.status(400).json({ message: 'Title and File URL are required' });
    }

    const material = new Material({
      title,
      description,
      fileUrl,
      type
    });
    
    // Assume generic admin for now if auth is not present
    // if (req.user) material.uploadedBy = req.user._id;

    const createdMaterial = await material.save();
    res.status(201).json(createdMaterial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error creating material' });
  }
};

module.exports = {
  getMaterials,
  createMaterial,
};
