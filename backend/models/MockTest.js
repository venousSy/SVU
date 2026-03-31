const mongoose = require('mongoose');

const mockTestSchema = mongoose.Schema(
  {
    materialId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Material',
      required: true
    },
    testContent: { 
      type: mongoose.Schema.Types.Mixed, 
      required: true 
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MockTest', mockTestSchema);
