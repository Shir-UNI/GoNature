const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const {
  validateUpdateUser,
  validateUserIdParam
} = require('../middleware/userValidator');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Get all users
router.get('/', isAuthenticated, userController.getAllUsers);

// Get single user by ID
router.get('/:id', isAuthenticated, validateUserIdParam, userController.getUserById);

// Update user (only by themselves)
router.put('/:id', isAuthenticated, validateUserIdParam, validateUpdateUser, userController.updateUser);

// Delete user (only by themselves)
router.delete('/:id', isAuthenticated, validateUserIdParam, userController.deleteUser);

module.exports = router;
