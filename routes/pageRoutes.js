const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');

// Render login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Render feed page
router.get('/feed', isAuthenticated, (req, res) => {
  res.render('feed'); // this looks for views/feed.ejs
});

module.exports = router;
