const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true }, // price per quantity *after discount*
  quantity: { type: Number, required: true },
  color: { type: String },
  size: { type: String },
  sku: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  // 🧑 User Reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // 📦 Ordered Items
  orderItems: {
    type: [orderItemSchema],
    required: true
  },

  // 📍 Shipping Address
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },

  // 💳 Payment Method & Status
  paymentMethod: {
    type: String,
    required: true,
    enum: ['COD', 'Razorpay', 'Stripe', 'PayPal']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paidAt: Date,

  // 💳 Payment Confirmation Info (after payment done)
  paymentInfo: {
    id: { type: String },         // razorpay_payment_id
    orderId: { type: String },    // razorpay_order_id
    signature: { type: String },  // razorpay_signature
    receipt: { type: String },    // optional
    method: { type: String },     // e.g. 'UPI', 'card', 'netbanking'
    status: { type: String }      // e.g. 'captured', 'failed'
  },

  // 🧾 Razorpay Order Info (from razorpay.orders.create())
  razorpayOrder: {
    id: { type: String },          // razorpay order id
    amount: { type: Number },
    amount_due: { type: Number },
    currency: { type: String },
    status: { type: String },
    receipt: { type: String },
    created_at: { type: Number }
  },

  // 💸 Pricing
  shippingPrice: {
    type: Number,
    required: true,
    default: 0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0
  },
  totalPrice: {
    type: Number,
    required: true
  },

  // 📦 Order Status
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveredAt: Date

}, {
  timestamps: true // createdAt & updatedAt
});

module.exports = mongoose.model('Order', orderSchema);
