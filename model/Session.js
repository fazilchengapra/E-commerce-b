const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ipAddress: String,
    country: String,
    region: String,
    city: String,
    userAgent: String,
    deviceType: { type: String, enum: ['Desktop', 'Mobile', 'Tablet', 'Unknown'], default: 'Unknown' },
    deviceModel: String,
    browser: String,
    os: String,
    platform: String,
    lastAccessed: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
