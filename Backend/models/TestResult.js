const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: [true, 'Candidate is required'],
    },
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: [true, 'Material is required'],
    },
    answers: [
      {
        questionIndex: {
          type: Number,
          required: true,
        },
        answer: {
          type: String,
          required: true,
          trim: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
      },
    ],
    correctCount: {
      type: Number,
      required: true,
      default: 0,
    },
    incorrectCount: {
      type: Number,
      required: true,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate test results (one candidate can take test once per material)
testResultSchema.index({ candidate: 1, material: 1 }, { unique: true });

// Index for faster queries
testResultSchema.index({ candidate: 1 });
testResultSchema.index({ material: 1 });

module.exports = mongoose.model('TestResult', testResultSchema);


