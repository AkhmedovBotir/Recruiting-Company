const mongoose = require('mongoose');

const vacancySchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company is required'],
    },
    title: {
      type: String,
      required: [true, 'Vacancy title is required'],
      trim: true,
      minlength: [3, 'Vacancy title must be at least 3 characters'],
      maxlength: [200, 'Vacancy title cannot exceed 200 characters'],
    },
    department: {
      type: String,
      trim: true,
      maxlength: [100, 'Department name cannot exceed 100 characters'],
    },
    position: {
      type: String,
      trim: true,
      maxlength: [100, 'Position name cannot exceed 100 characters'],
    },
    experience: {
      type: String,
      required: [true, 'Experience is required'],
      trim: true,
    },
    workType: {
      type: String,
      enum: ['fulltime', 'parttime'],
      required: [true, 'Work type is required'],
    },
    minAge: {
      type: Number,
      required: [true, 'Minimum age is required'],
      min: [1, 'Minimum age must be at least 1'],
      max: [100, 'Minimum age cannot exceed 100'],
    },
    maxAge: {
      type: Number,
      required: [true, 'Maximum age is required'],
      min: [1, 'Maximum age must be at least 1'],
      max: [100, 'Maximum age cannot exceed 100'],
    },
    salary: {
      type: String,
      required: [true, 'Salary is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    responsibilities: {
      type: String,
      required: [true, 'Responsibilities is required'],
      trim: true,
    },
    preferences: {
      type: String,
      required: [true, 'Preferences is required'],
      trim: true,
    },
    skills: {
      type: [String],
      required: [true, 'Skills are required'],
      default: [],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: 'At least one skill is required',
      },
    },
    status: {
      type: String,
      enum: ['active', 'close'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
vacancySchema.index({ company: 1 });
vacancySchema.index({ status: 1 });
vacancySchema.index({ workType: 1 });

// Validate maxAge > minAge
vacancySchema.pre('save', function (next) {
  if (this.maxAge <= this.minAge) {
    next(new Error('Maximum age must be greater than minimum age'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Vacancy', vacancySchema);

