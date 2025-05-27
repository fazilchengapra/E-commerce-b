const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String }, // URL or path to logo image
});

module.exports = mongoose.model('Brand', brandSchema);
