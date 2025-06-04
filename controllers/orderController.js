const Razorpay = require("razorpay");
const crypto = require("crypto"); // <-- Added import
const Order = require("../model/Order");
const Product = require("../model/Product");
const FlashSale = require("../model/FlashSale");
const { log } = require("console");
const generateInvoiceId = require("../utils/generateInvoiceId");
require("dotenv").config();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 🧾 Helper: Calculate final price for each item (price after discount * quantity)
const calculateItemTotal = async (product, quantity) => {
  const now = new Date();

  // 🔍 Check if the product is in a flash sale
  const flashSale = await FlashSale.findOne({
    product: product._id,
    startDate: { $lte: now },
    endDate: { $gte: now },
  });

  const finalPrice = flashSale
    ? flashSale.salePrice
    : product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return finalPrice * quantity;
};

// 📦 Create Razorpay Order (client initiates payment)
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderItems } = req.body;
    if (!orderItems || orderItems.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No order items" });
    }

    let totalAmount = 0;
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product)
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      totalAmount += calculateItemTotal(product, item.quantity);
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // convert to paise
      currency: "INR",
      receipt: `order_rcpt_${Date.now()}`,
    });

    res.status(200).json({
      success: true,
      order: razorpayOrder,
    });
  } catch (err) {
    console.error("createRazorpayOrder error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🧾 Confirm Order After Razorpay Payment
exports.placeOrderAfterPayment = async (req, res) => {
  try {
    const userId = req.userId; // Assuming middleware sets req.userId
    const {
      orderItems,
      shippingAddress,
      paymentInfo,
      paymentMethod = "Razorpay",
      shippingPrice = 0,
      taxPrice = 0,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    // Validate Razorpay signature
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      paymentInfo;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Calculate total and prepare order items
    let totalPrice = 0;
    const finalItems = await Promise.all(
      orderItems.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) throw new Error("Product not found");

        const itemTotal = calculateItemTotal(product, item.quantity);
        totalPrice += itemTotal;

        return {
          product: item.product,
          name: product.name,
          image: product.images?.[0] || "",
          price: itemTotal,
          quantity: item.quantity,
          color: item.color || null,
          size: item.size || null,
          sku: item.sku || null,
        };
      })
    );

    totalPrice += shippingPrice + taxPrice;

    // Create order in DB
    const order = await Order.create({
      user: userId,
      orderItems: finalItems,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2 || "",
        city: shippingAddress.city,
        state: shippingAddress.state || "",
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
      },
      paymentMethod,
      paymentStatus: "paid",
      paidAt: Date.now(),
      paymentInfo: {
        id: razorpay_payment_id,
        orderId: razorpay_order_id,
        signature: razorpay_signature,
        method: paymentInfo.method || "unknown",
        status: paymentInfo.status || "captured",
        receipt: paymentInfo.receipt || "",
      },
      shippingPrice,
      taxPrice,
      totalPrice,
      orderStatus: "processing",
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("placeOrderAfterPayment error:", error);
    res.status(500).json({ message: "Order failed", error: error.message });
  }
};

// 🛒 Create COD Order
exports.createCODOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      orderItems,
      shippingAddress,
      shippingPrice = 0,
      taxPrice = 0,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    let totalPrice = 0;
    const finalItems = await Promise.all(
      orderItems.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) throw new Error("Product not found");

        const itemTotal = await calculateItemTotal(product, item.quantity);
        totalPrice += itemTotal;

        return {
          product: item.product,
          name: product.name,
          image: product.images?.[0] || "",
          price: itemTotal,
          quantity: item.quantity,
          color: item.color || null,
          size: item.size || null,
          sku: item.sku || null,
        };
      })
    );

    totalPrice += shippingPrice + taxPrice;

    const order = await Order.create({
      user: userId,
      orderItems: finalItems,
      shippingAddress,
      paymentMethod: "COD",
      paymentStatus: "pending",
      shippingPrice,
      taxPrice,
      totalPrice,
      orderStatus: "pending",
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("createCODOrder error:", error);
    res
      .status(500)
      .json({ message: "Failed to create COD order", error: error.message });
  }
};

// 🔒 Get User's Orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({
      createdAt: -1,
    });
    res.json({ success: true, orders });
  } catch (err) {
    console.error("getMyOrders error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// 🔍 Get Order by ID (User/Admin)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    log("getOrderById order:", order);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Only owner or admin can access
    if (req.userId !== order.user.toString() && req.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error("getOrderById error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// 🔁 Admin: Update Order Status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;

    const validOrderStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    const validPaymentStatuses = ["pending", "paid", "failed"];

    // Validate status
    if (status && !validOrderStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // ✅ Update order status
    if (status) {
      order.orderStatus = status;
      if (status === "delivered") {
        order.deliveredAt = new Date();
      }
    }

    // ✅ Update payment status
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
      if (paymentStatus === "paid" && !order.paidAt) {
        order.paidAt = new Date();
      }
    }

    if (
      !order.invoiceId &&
      order.paymentStatus === "paid" &&
      order.orderStatus === "delivered"
    ) {
      order.invoiceId = await generateInvoiceId();
    }

    await order.save();

    res.json({
      message: "Order updated successfully",
      success: true,
      order,
    });
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// 📋 Admin: Get All Orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    console.error("getAllOrders error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
