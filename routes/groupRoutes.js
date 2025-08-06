const express = require('express');
const router = express.Router();

const groupController = require('../controllers/groupController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { validateCreateGroup, validateUpdateGroup } = require('../middleware/groupValidator');
const validateObjectId = require('../middleware/objectIdValidator');


// Create a new group
router.post('/', isAuthenticated, validateCreateGroup, groupController.createGroup);

// Get all groups
router.get('/', isAuthenticated, groupController.getAllGroups);

// Gets group by UserID
router.get('/my-groups', isAuthenticated, groupController.getGroupsByCurrentUser);

// Get a specific group by ID
router.get('/:id', isAuthenticated, validateObjectId('id', 'group ID'), groupController.getGroupById);

// Update a group
router.put('/:id', isAuthenticated, validateObjectId('id', 'group ID'), validateUpdateGroup, groupController.updateGroup);

// Delete a group
router.delete('/:id', isAuthenticated, validateObjectId('id', 'group ID'), groupController.deleteGroup);

// Add a member to group
router.post('/:id/members', isAuthenticated, validateObjectId('id', 'group ID'), groupController.addMember);

// Remove a member from group
router.delete('/:id/members', isAuthenticated, validateObjectId('id', 'group ID'), groupController.removeMember);


module.exports = router;
