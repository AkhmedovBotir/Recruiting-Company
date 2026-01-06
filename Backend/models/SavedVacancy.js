const mongoose = require('mongoose');

const savedVacancySchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate saved vacancies (one candidate can save one vacancy only once)
savedVacancySchema.index({ candidate: 1, vacancy: 1 }, { unique: true });

// Index for faster queries
savedVacancySchema.index({ candidate: 1 });
savedVacancySchema.index({ vacancy: 1 });

module.exports = mongoose.model('SavedVacancy', savedVacancySchema);


