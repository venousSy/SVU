const Material = require('../models/Material');
const pdfService = require('../services/pdfService');
const aiService = require('../services/aiService');
const { downloadRemoteFile } = require('../utils/downloadUtils');
const fs = require('fs');
const path = require('path');

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

const extractText = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    const { fileUrl } = material;
    let localFilePath = fileUrl;

    // If fileUrl is a remote URL, download it to a temp file
    if (fileUrl.startsWith('http')) {
      localFilePath = await downloadRemoteFile(fileUrl, `material-${material._id}`);
    }
 else if (!path.isAbsolute(fileUrl)) {
      // If it's a relative path, resolve it
      localFilePath = path.resolve(process.cwd(), fileUrl);
    }

    console.log(`[extractText] Starting extraction for material: ${material._id}`);
    const extractedText = await pdfService.extractTextFromPDF(localFilePath);
    console.log(`[extractText] Extraction successful. Length: ${extractedText?.length || 0}`);

    console.log(`[extractText] Sending text to AI service...`);
    // Call the AI generation service
    const generatedTest = await aiService.generateTestFromText(extractedText);
    console.log(`[extractText] AI generation successful.`);

    // Clean up temp file if it was downloaded
    if (fileUrl.startsWith('http') && fs.existsSync(localFilePath)) {
      console.log(`[extractText] Removing temp file: ${localFilePath}`);
      fs.unlinkSync(localFilePath);
    }

    res.json({
      message: 'Test generated successfully',
      extraction: extractedText,
      test: generatedTest,
    });
  } catch (error) {
    console.error('Generation Error Detail:', error);
    res.status(500).json({ message: 'Error generating test from PDF', error: error.message });
  }
};

module.exports = {
  getMaterials,
  createMaterial,
  extractText,
};
