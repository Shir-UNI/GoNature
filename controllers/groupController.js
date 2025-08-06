const groupService = require("../services/groupService");
const Group = require("../models/Group");
const mongoose = require("mongoose");

const createGroup = async (req, res) => {
  try {
    const group = await groupService.createGroup({
      name: req.body.name,
      description: req.body.description,
      admin: req.session.userId,
    });
    res.status(201).json(group);
  } catch (error) {
    res
      .status(error.status || 400)
      .json({ message: "Failed to create group", error: error.message });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await groupService.getGroupById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.json(group);
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: "Failed to fetch group", error: error.message });
  }
};

const getAllGroups = async (req, res) => {
  try {
    const groups = await groupService.getAllGroups();
    res.json(groups);
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: "Failed to fetch groups", error: error.message });
  }
};

const updateGroup = async (req, res) => {
  try {
    const updatedGroup = await groupService.updateGroup(
      req.params.id,
      req.body,
      req.session.userId
    );
    if (!updatedGroup) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.json(updatedGroup);
  } catch (error) {
    res
      .status(error.status || 403)
      .json({ message: "Failed to update group", error: error.message });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const deletedGroup = await groupService.deleteGroup(
      req.params.id,
      req.session.userId
    );
    if (!deletedGroup) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.status(204).send();
  } catch (error) {
    res
      .status(error.status || 403)
      .json({ message: "Failed to delete group", error: error.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const groupId = req.params.id;
    const { group, error } = await groupService.addMemberToGroup(
      groupId,
      userId,
      req.session.userId
    );
    if (error) {
      return res.status(400).json({ message: error });
    }
    res.json(group);
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: "Failed to add member", error: error.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const groupId = req.params.id;
    const currentUserId = req.session.userId;

    const result = await groupService.removeMemberFromGroup(
      groupId,
      userId,
      currentUserId
    );

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    res.status(200).json(result.group);
  } catch (error) {
    console.error("Error removing member:", error);
    res
      .status(error.status || 500)
      .json({ message: "Failed to remove member", error: error.message });
  }
};

const getGroupsByCurrentUser = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const groups = await Group.find({
      members: new mongoose.Types.ObjectId(userId),
    });

    res.status(200).json(groups);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to load user groups" });
  }
};

async function stats(req, res) {
  const { id: groupId } = req.params;
  // check objectID
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json({ message: 'Invalid group ID' });
  }

  try {
    // call getGroupStats
    const stats = await groupService.getGroupStats(groupId);
    return res.status(200).json(stats);
  } catch (err) {
    console.error('Error fetching group stats:', err);
    return res
      .status(err.status || 500)
      .json({ message: err.message || 'Server error fetching stats' });
  }
}

module.exports = {
  createGroup,
  getGroupById,
  getAllGroups,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  getGroupsByCurrentUser,
  stats,
};
