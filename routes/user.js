var express = require("express");
var router = express.Router();

const userController = require("../controllers/userController");
const cartController = require("../controllers/cartController");
const addressController = require("../controllers/addressController");
const orderController = require("../controllers/orderController");

// respond only authenticated users

// User profile routes
router.get("/profile", userController.getUserProfile);
router.put("/profile", userController.updateUserProfile);

// add user address
router.post("/address", addressController.addAddress); // Add new address
router.get("/address", addressController.getAddresses); // Get all addresses
router.put("/address/:id", addressController.updateAddress); // Update address by id
router.put("/address/:id/set-default", addressController.setDefaultAddress); // Set address as default
router.delete("/address/:id", addressController.deleteAddress); // Delete address by id

// cart routes
router.post("/cart/add", cartController.addToCart); // Add item to cart
router.get("/cart/", cartController.getCart); // Get cart items
router.put("/cart/update", cartController.updateCartQuantity); // Update item quantity in cart
router.delete("/cart/remove", cartController.removeFromCart); // Remove item from cart
router.delete("/cart/clear", cartController.clearCart); // Clear cart

// Order routes
router.post("/razorpayOrder", orderController.createRazorpayOrder); // Create Razorpay order
router.post("/placeOrder", orderController.placeOrderAfterPayment); // Place order after payment
router.post("/codOrder", orderController.createCODOrder); // Create COD order
router.get("/myOrders", orderController.getMyOrders); // Get user's orders
router.get("/order/:id", orderController.getOrderById); // Get order by ID (User/Admin)

module.exports = router;
