var express = require('express');
var router = express.Router();

const userController = require('../controllers/userController');
const { logSession } = require('../controllers/sessionController');
const { authMiddleware } = require('../middlewares/auth');

// user registration and login
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser,authMiddleware, logSession);

module.exports = router;
