const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { validateUpdateUser, validateUserIdParam } = require('../middleware/userValidator');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { uploadProfileImage } = require("../middleware/uploadMiddleware");

// Get current user
router.get('/me', isAuthenticated, userController.getCurrentUser);

// Get all users
router.get('/', isAuthenticated, userController.getAllUsers);

// Follow & unfollow routes
router.post('/:id/follow', isAuthenticated, validateUserIdParam, userController.followUser);
router.post('/:id/unfollow', isAuthenticated, validateUserIdParam, userController.unfollowUser);

// Get single user by ID
router.get('/:id', isAuthenticated, validateUserIdParam, userController.getUserById);

// Update user (only by themselves)
router.put('/:id', isAuthenticated, uploadProfileImage.single("profileImage"), validateUserIdParam, validateUpdateUser, userController.updateUser);

// Delete user (only by themselves)
router.delete('/:id', isAuthenticated, validateUserIdParam, userController.deleteUser);


module.exports = router;
