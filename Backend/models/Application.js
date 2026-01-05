const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: [true, 'Candidate is required'],
    },
    vacancy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vacancy',
      required: [true, 'Vacancy is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'interview', 'passed', 'failed', 'accepted', 'rejected'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications (one candidate can apply to one vacancy only once)
applicationSchema.index({ candidate: 1, vacancy: 1 }, { unique: true });

// Index for faster queries
applicationSchema.index({ candidate: 1 });
applicationSchema.index({ vacancy: 1 });
applicationSchema.index({ status: 1 });

module.exports = mongoose.model('Application', applicationSchema);

