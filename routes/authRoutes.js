const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/userMiddleware');

// Register new user
router.post('/register', validateRegistration, authController.registerUser);

// Login user
router.post('/login', validateLogin, authController.loginUser);

// Logout user
router.post('/logout', authController.logoutUser);

module.exports = router;
