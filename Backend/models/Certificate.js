const mongoose = require('mongoose');
const crypto = require('crypto');

const certificateSchema = new mongoose.Schema(
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
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: [true, 'Interview is required'],
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
    },
    certificateNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    qrCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Edited certificate image (base64) provided by frontend after rendering name/QR
    certificateBase64: {
      type: String,
      trim: true,
    },
    issuedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'revoked'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
certificateSchema.index({ candidate: 1 });
certificateSchema.index({ vacancy: 1 });
certificateSchema.index({ interview: 1 });
certificateSchema.index({ certificateNumber: 1 });
certificateSchema.index({ qrCode: 1 });
certificateSchema.index({ status: 1 });

// Prevent duplicate certificates for same interview
certificateSchema.index({ interview: 1 }, { unique: true });

// Generate unique certificate number and QR code
certificateSchema.pre('save', async function (next) {
  // Only generate for new documents
  if (this.isNew) {
    // Generate certificate number if not exists
    if (!this.certificateNumber) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const dateStr = `${year}${month}${day}`;
      
      // Get count of certificates issued on the same date
      const todayStart = new Date(year, now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const todayEnd = new Date(year, now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const count = await mongoose.model('Certificate').countDocuments({
        issuedDate: {
          $gte: todayStart,
          $lte: todayEnd,
        },
      });
      
      // Generate certificate number: CERT-YYYYMMDD-N
      const uniqueNumber = count + 1;
      this.certificateNumber = `CERT-${dateStr}-${uniqueNumber}`;
    }
    
    // Generate QR code if not exists
    if (!this.qrCode) {
      // Generate unique QR code token
      this.qrCode = crypto.randomBytes(32).toString('hex');
    }
  }
  
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);

