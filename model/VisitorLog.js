const mongoose = require('mongoose');

const visitorLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  ip: { type: String }, // optional, for guest tracking
  userAgent: { type: String }, // optional
  visitedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VisitorLog', visitorLogSchema);
