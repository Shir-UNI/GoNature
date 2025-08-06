const express = require('express');
const router = express.Router();
const { isAuthenticated, redirectIfAuthenticated } = require('../middleware/authMiddleware');
const userPageController = require("../controllers/userPageController");


// redirect root "/" to login or feed
router.get('/', (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect('/feed');
  } else {
    return res.redirect('/login');
  }
});

// Render login page
router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('login');
});

// Render register page
router.get('/register', redirectIfAuthenticated, (req, res) => {
  res.render('register');
});

// Render feed page
router.get('/feed', isAuthenticated, (req, res) => {
  res.render('feed', {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
  });
});

//Render user page
router.get("/users/:userId", (req, res) => {
  res.render("userPage", { userId: req.params.userId });
});

  
module.exports = router;
