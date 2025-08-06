const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Search users and groups by query
router.get('/', isAuthenticated, searchController.searchUsersAndGroups);

module.exports = router;
