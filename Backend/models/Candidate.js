const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^\+?998\d{9}$/, 'Please provide a valid phone number'],
    },
    telegramId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    registrationType: {
      type: String,
      enum: ['bot', 'web'],
      default: 'web',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
candidateSchema.index({ phone: 1 });
candidateSchema.index({ telegramId: 1 });

module.exports = mongoose.model('Candidate', candidateSchema);

