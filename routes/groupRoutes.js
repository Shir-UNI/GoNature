const express = require('express');
const router = express.Router();

const groupController = require('../controllers/groupController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { validateCreateGroup, validateUpdateGroup } = require('../middleware/groupValidator');

// Create a new group
router.post('/', isAuthenticated, validateCreateGroup, groupController.createGroup);

// Get all groups
router.get('/', isAuthenticated, groupController.getAllGroups);

// Get a specific group by ID
router.get('/:id', isAuthenticated, groupController.getGroupById);

// Update a group
router.put('/:id', isAuthenticated, validateUpdateGroup, groupController.updateGroup);

// Delete a group
router.delete('/:id', isAuthenticated, groupController.deleteGroup);

// Add a member to group
router.post('/:id/members', isAuthenticated, groupController.addMemberToGroup);

// Remove a member from group
router.delete('/:id/members/:userId', isAuthenticated, groupController.removeMemberFromGroup);

module.exports = router;
