const mongoose = require('mongoose');

const testSchema = mongoose.Schema(
  {
    materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
    questions: [
      {
        questionText: { type: String, required: true },
        options: [{ type: String }],
        correctAnswer: { type: String, required: true },
      }
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Test', testSchema);
