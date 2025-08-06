const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');
const { validateCreatePost, validateUpdatePost } = require('../middleware/postValidator');
const { isAuthenticated } = require('../middleware/authMiddleware'); 
const validateObjectId = require('../middleware/objectIdValidator');
const { uploadPostMedia, attachMediaUrl } = require('../middleware/uploadMiddleware')

// Create a new post
router.post('/', uploadPostMedia.single('media'), attachMediaUrl, isAuthenticated, validateCreatePost, postController.createPost);

// Get all posts
router.get('/', isAuthenticated, postController.getAllPosts);

// Get a single post by ID
router.get('/:id', validateObjectId('id', 'post ID'), isAuthenticated, postController.getPostById);

// Update a post
router.put('/:id', validateObjectId('id', 'post ID'), isAuthenticated, validateUpdatePost, postController.updatePost);

// Delete a post
router.delete('/:id', validateObjectId('id', 'post ID'), isAuthenticated, postController.deletePost);

module.exports = router;
