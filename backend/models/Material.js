const mongoose = require('mongoose');

const materialSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Material', materialSchema);
