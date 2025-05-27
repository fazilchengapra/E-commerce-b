const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "invalid email address"]
    },
    password: { type: String, required: true },
    phone: { type: String },
    role: {
      type: String,
      enum: ['customer', 'seller'],
      default: 'customer'
    },
    avatar: { type: String }, // URL or file path
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpires: Date
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);