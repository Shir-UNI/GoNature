const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');

// Render the feed page
router.get('/feed', (req, res) => {
  res.render('feed'); // this looks for views/feed.ejs
});

module.exports = router;
