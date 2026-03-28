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
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MockTest', mockTestSchema);
