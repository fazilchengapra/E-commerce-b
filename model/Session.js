const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ipAddress: { type: String },
    country: { type: String },
    region: { type: String },
    city: { type: String },
    userAgent: { type: String },
    deviceType: {
      type: String,
      enum: ['Desktop', 'Mobile', 'Tablet', 'Unknown'],
      default: 'Unknown'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
