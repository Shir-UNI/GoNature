const groupService = require('../services/groupService');

// Create a new group
const createGroup = async (req, res) => {
  try {
    const adminId = req.session.userId;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const group = await groupService.createGroup({ name, description, admin: adminId });
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create group', error: error.message });
  }
};

// Get a single group by ID
const getGroupById = async (req, res) => {
  try {
    const group = await groupService.getGroupById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch group', error: error.message });
  }
};

// Get all groups
const getAllGroups = async (req, res) => {
  try {
    const groups = await groupService.getAllGroups();
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch groups', error: error.message });
  }
};

// Update group details
const updateGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.session.userId;

    const group = await groupService.getGroupById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.admin._id.toString() !== userId) {
      return res.status(403).json({ message: 'Only the group admin can update this group' });
    }

    const updatedGroup = await groupService.updateGroup(groupId, req.body);
    res.status(200).json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update group', error: error.message });
  }
};

// Delete a group
const deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.session.userId;

    const group = await groupService.getGroupById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.admin._id.toString() !== userId) {
      return res.status(403).json({ message: 'Only the group admin can delete this group' });
    }

    await groupService.deleteGroup(groupId);
    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete group', error: error.message });
  }
};

// Add member to group
const addMember = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const result = await groupService.addMemberToGroup(groupId, userId);
    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    res.status(200).json(result.group);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add member', error: error.message });
  }
};

// Remove member from group
const removeMember = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.params.userId;

    const updatedGroup = await groupService.removeMemberFromGroup(groupId, userId);
    if (!updatedGroup) return res.status(404).json({ message: 'Group not found' });

    res.status(200).json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove member', error: error.message });
  }
};

module.exports = {
  createGroup,
  getGroupById,
  getAllGroups,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember
};
