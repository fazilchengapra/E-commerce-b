const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ipAddress: { type: String },
    country: { type: String },
    region: { type: String },
    city: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
