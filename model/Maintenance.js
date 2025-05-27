// models/MaintenanceSetting.js
const mongoose = require("mongoose");

const maintenanceSettingSchema = new mongoose.Schema({
  isActive: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: "The system is under maintenance. Please try again later.",
  },
  allowAdmin: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("MaintenanceSetting", maintenanceSettingSchema);