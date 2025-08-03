const express = require('express');
const router = express.Router();
const requireLogin = require('../middleware/authMiddleware');

router.get('/', requireLogin, (req, res) => {
  res.status(200).json({
    message: `Welcome to your feed, user ${req.session.userId}`
  });
});

module.exports = router;
