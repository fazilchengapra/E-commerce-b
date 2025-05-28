// models/cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  selectedVariant: {
    color: { type: String },
    size: { type: String },
  },
  priceAtAddition: {
    type: Number,
    required: true, // snapshot of price when added to cart
  },
}, { _id: false });

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon', // Optional: if you're applying coupons
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Optional: Total price calculation (virtual or controller-side)
cartSchema.methods.getTotalPrice = function () {
  return this.items.reduce((total, item) => {
    return total + item.priceAtAddition * item.quantity;
  }, 0);
};

module.exports = mongoose.model('Cart', cartSchema);
