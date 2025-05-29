var express = require("express");
var router = express.Router();

const userController = require("../controllers/userController");
const cartController = require("../controllers/cartController");
const addressController = require("../controllers/addressController");

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
router.post("/cart/add", cartController.addToCart);
router.get("/cart/", cartController.getCart);
router.put("/cart/update", cartController.updateCartQuantity);
router.delete("/cart/remove", cartController.removeFromCart);
router.delete("/cart/clear", cartController.clearCart);

module.exports = router;
