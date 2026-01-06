const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: [2000, 'Evaluation text cannot exceed 2000 characters'],
  },
  rating: {
    type: Number,
    required: true,
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating cannot exceed 10'],
  },
}, {
  timestamps: true,
  _id: true,
});

const interviewSchema = new mongoose.Schema(
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
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
    },
    content: {
      type: String,
      required: [true, 'Interview content is required'],
      trim: true,
      maxlength: [5000, 'Content cannot exceed 5000 characters'],
    },
    interviewer: {
      type: String,
      required: [true, 'Interviewer name is required'],
      trim: true,
      maxlength: [200, 'Interviewer name cannot exceed 200 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [500, 'Location cannot exceed 500 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Interview date is required'],
    },
    time: {
      type: String,
      required: [true, 'Interview time is required'],
      trim: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time format (HH:MM)'],
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    result: {
      type: String,
      enum: ['passed', 'failed', 'pending'],
      default: 'pending',
    },
    evaluations: {
      type: [evaluationSchema],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
interviewSchema.index({ candidate: 1 });
interviewSchema.index({ vacancy: 1 });
interviewSchema.index({ application: 1 });
interviewSchema.index({ status: 1 });
interviewSchema.index({ result: 1 });
interviewSchema.index({ date: 1 });

// Prevent duplicate interviews for same candidate and vacancy on same date
interviewSchema.index({ candidate: 1, vacancy: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Interview', interviewSchema);

