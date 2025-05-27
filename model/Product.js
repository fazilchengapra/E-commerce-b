const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 }, // percentage
  images: [String],
  variants: [
    {
      color: String,
      size: String,
      stock: Number,
      sku: String
    }
  ],
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);
