// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const {
  setMaintenance,
  getMaintenanceStatus,
} = require("../controllers/maintenanceController");
const categoryController = require("../controllers/categoryController");
const brandController = require("../controllers/brandController");
const productController = require("../controllers/productController");
const userController = require("../controllers/userController");

// account management
router.get("/profile", adminController.getProfile);
router.put("/profile", adminController.updateProfile);
router.put("/change-password", adminController.changePassword);
router.post("/maintenance", setMaintenance);
router.get("/maintenance", getMaintenanceStatus);

// category management
router.post("/categories", categoryController.createCategory);
router.get("/categories", categoryController.getAllCategories);
router.get("/categories/:id", categoryController.getCategoryById);
router.put("/categories/:id", categoryController.updateCategory);
router.delete("/categories/:id", categoryController.deleteCategory);

// brand management
router.post('/brand/', brandController.createBrand);
router.get('/brand/', brandController.getAllBrands);
router.get('/brand/:id', brandController.getBrandById);
router.put('/brand/:id', brandController.updateBrand);
router.delete('/brand/:id', brandController.deleteBrand);

// product management
router.post('/product/', productController.createProduct);
router.get('/product/', productController.getAllProducts);
router.get('/product/:id', productController.getProductById);
router.put('/product/:id', productController.updateProduct);
router.delete('/product/:id', productController.deleteProduct);

// user management
router.get('/users', userController.getAllUsers); // GET all users
router.get('/user/:id', userController.getUserById); // GET single user
router.put('/user/:id', userController.updateUser); // UPDATE user
router.delete('/user/:id', userController.deleteUser); // DELETE user 

module.exports = router;
