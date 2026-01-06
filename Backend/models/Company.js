const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  { 
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      minlength: [2, 'Company name must be at least 2 characters'],
      maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    inn: {
      type: String,
      required: [true, 'INN is required'],
      unique: true,
      trim: true,
      match: [/^\d{9}$|^\d{12}$/, 'INN must be 9 or 12 digits'],
    },
    ownerFullName: {
      type: String,
      required: [true, 'Owner full name is required'],
      trim: true,
      minlength: [3, 'Owner full name must be at least 3 characters'],
      maxlength: [100, 'Owner full name cannot exceed 100 characters'],
    },
    ownerPhone: {
      type: String,
      required: [true, 'Owner phone number is required'],
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'],
    },
    companyPhone: {
      type: String,
      required: [true, 'Company phone number is required'],
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { 
    timestamps: true,
  } 
);  

// Index for faster queries
// companySchema.index({ inn: 1 });
companySchema.index({ status: 1 });

module.exports = mongoose.model('Company', companySchema);

