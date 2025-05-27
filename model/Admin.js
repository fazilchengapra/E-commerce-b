const mongoose = require("mongoose");
const validator = require('validator');

const adminSchema = new mongoose.Schema({
  profileImage: { type: String }, // URL of profile picture
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, "invalid email address"]
  },
  phoneNumber: { type: String },
  birthday: { type: Date },
  password: { type: String, required: true }, // should be hashed
  department: { type: String }, // e.g., Marketing, Operations
  organization: { type: String }, // e.g., Themeberg
  role: {
    type: String,
    enum: ["superadmin", "product-manager", "order-manager"],
    default: "superadmin",
  },

  address: {
    country: { type: String },
    state: { type: String },
    city: { type: String },
    zip: { type: String },
  },

  socialAccounts: {
    facebook: { type: String },
    twitter: { type: String },
    github: { type: String },
    dribbble: { type: String },
  },

  connectedAccounts: [
    {
      name: { type: String }, // e.g., Bonnie Green
      location: { type: String }, // e.g., New York
      status: {
        type: String,
        enum: ["connected", "disconnected"],
        default: "connected",
      },
    },
  ],

  notifications: {
    companyNews: { type: Boolean, default: true },
    accountActivity: { type: Boolean, default: true },
    meetupsNearYou: { type: Boolean, default: false },
    newMessages: { type: Boolean, default: true },
  },

  emailSettings: {
    ratingReminders: { type: Boolean, default: true },
    itemUpdateNotifications: { type: Boolean, default: true },
    itemCommentNotifications: { type: Boolean, default: false },
    buyerReviewNotifications: { type: Boolean, default: true },
  },

  recentDevices: [
    {
      device: { type: String }, // e.g., Chrome on Android
      os: { type: String }, // e.g., Android 11
      location: { type: String },
      lastAccessed: { type: Date },
    },
  ],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Automatically update updatedAt on save
adminSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Admin", adminSchema);
