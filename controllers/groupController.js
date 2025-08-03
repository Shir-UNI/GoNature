// controllers/groupController.js

const groupService = require('../services/groupService');

const createGroup = async (req, res) => {
  try {
    const group = await groupService.createGroup({
      name: req.body.name,
      description: req.body.description,
      admin: req.session.userId
    });
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create group', error: error.message });
  }
};

const getGroupById = async (req, res) => {
  const group = await groupService.getGroupById(req.params.id);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }
  res.json(group);
};

const getAllGroups = async (req, res) => {
  const groups = await groupService.getAllGroups();
  res.json(groups);
};

const updateGroup = async (req, res) => {
  try {
    const updatedGroup = await groupService.updateGroup(req.params.id, req.body, req.session.userId);
    if (!updatedGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json(updatedGroup);
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const deletedGroup = await groupService.deleteGroup(req.params.id, req.session.userId);
    if (!deletedGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

const addMember = async (req, res) => {
  const { groupId, userId } = req.body;
  const { group, error } = await groupService.addMemberToGroup(groupId, userId, req.session.userId);
  if (error) {
    return res.status(400).json({ message: error });
  }
  res.json(group);
};

const removeMember = async (req, res) => {
  const { groupId, userId } = req.body;
  try {
    const updatedGroup = await groupService.removeMemberFromGroup(groupId, userId, req.session.userId);
    if (!updatedGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json(updatedGroup);
  } catch (error) {
    res.status(403).json({ message: error.message });
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
