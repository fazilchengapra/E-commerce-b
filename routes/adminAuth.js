const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middlewares/auth');
const maintenanceMiddleware = require('../middlewares/maintenance');

router.post('/register',maintenanceMiddleware, adminController.registerAdmin);
router.post('/login', adminController.loginAdmin, authMiddleware);


module.exports = router;