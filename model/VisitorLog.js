const mongoose = require("mongoose");

const visitorLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  ip: { type: String }, // optional, for guest tracking
  userAgent: { type: String }, // optional
  visitedAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    index: { expires: 0 }, // TTL index
  },
});

module.exports = mongoose.model("VisitorLog", visitorLogSchema);
