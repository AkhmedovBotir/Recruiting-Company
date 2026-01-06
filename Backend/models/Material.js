const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
    minlength: [5, 'Question must be at least 5 characters'],
    maxlength: [500, 'Question cannot exceed 500 characters'],
  },
  options: {
    type: [String],
    required: [true, 'Options are required'],
    validate: {
      validator: function (v) {
        return v.length >= 2 && v.length <= 10;
      },
      message: 'Options must be between 2 and 10',
    },
  },
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer is required'],
    trim: true,
  },
});

const materialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Material title is required'],
      trim: true,
      minlength: [3, 'Material title must be at least 3 characters'],
      maxlength: [200, 'Material title cannot exceed 200 characters'],
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
      trim: true,
      match: [
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/,
        'Please provide a valid YouTube URL',
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    vacancy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vacancy',
      required: [true, 'Vacancy is required'],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company is required'],
    },
    tests: {
      type: [testSchema],
      required: [true, 'Tests are required'],
      validate: {
        validator: function (v) {
          return v.length >= 3;
        },
        message: 'At least 3 tests are required',
      },
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
materialSchema.index({ vacancy: 1 });
materialSchema.index({ company: 1 });
materialSchema.index({ isActive: 1 });

// Pre-save hook to normalize and validate correctAnswer
materialSchema.pre('save', function (next) {
  if (this.tests && this.tests.length > 0) {
    this.tests.forEach((test) => {
      if (test.correctAnswer) {
        // Normalize to uppercase
        test.correctAnswer = test.correctAnswer.toUpperCase();
        
        // Validate correctAnswer
        if (test.options && Array.isArray(test.options)) {
          const optionLetters = test.options.map((_, index) =>
            String.fromCharCode(65 + index)
          ); // A, B, C, ...
          
          if (!optionLetters.includes(test.correctAnswer)) {
            return next(new Error(`Correct answer must be one of: ${optionLetters.join(', ')}`));
          }
        }
      }
    });
  }
  next();
});

module.exports = mongoose.model('Material', materialSchema);

