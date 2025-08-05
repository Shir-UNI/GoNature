const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const feedController = require('../controllers/feedController');

// Get feed for logged-in user
router.get('/', feedController.getFeed);

module.exports = router;