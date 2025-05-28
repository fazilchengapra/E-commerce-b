var express = require("express");
var router = express.Router();

const userController = require("../controllers/userController");
const cartController = require("../controllers/cartController");

// respond only authenticated users

// User profile routes
router.get("/profile", userController.getUserProfile);
router.put("/profile", userController.updateUserProfile);

// cart routes
router.post("/cart/add", cartController.addToCart);
router.get("/cart/", cartController.getCart);
router.put("/cart/update", cartController.updateCartQuantity);
router.delete("/cart/remove", cartController.removeFromCart);
router.delete("/cart/clear", cartController.clearCart);

module.exports = router;
