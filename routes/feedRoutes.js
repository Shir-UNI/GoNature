const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/', isAuthenticated, (req, res) => {
  res.status(200).json({
    message: `Welcome to your feed, user ${req.session.userId}`
  });
});

module.exports = router;
