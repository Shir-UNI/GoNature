const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');
const { validateCreatePost, validateUpdatePost } = require('../middleware/postValidator');
const { isAuthenticated } = require('../middleware/authMiddleware'); 

// Create a new post
router.post('/', isAuthenticated, validateCreatePost, postController.createPost);

// Get all posts
router.get('/', isAuthenticated, postController.getAllPosts);

// Get a single post by ID
router.get('/:id', isAuthenticated, postController.getPostById);

// Update a post
router.put('/:id', isAuthenticated, validateUpdatePost, postController.updatePost);

// Delete a post
router.delete('/:id', isAuthenticated, postController.deletePost);

module.exports = router;
