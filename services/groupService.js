const mongoose = require("mongoose");
const Group = require("../models/Group");
const User = require("../models/User");

// Create a new group with the current user as admin and first member
const createGroup = async ({ name, description, admin }) => {
  const group = new Group({
    name: name.trim(),
    description: description?.trim(),
    admin,
    members: [admin], // Add creator as first member
  });
  return await group.save();
};

// Get group by ID, excluding deleted users
const getGroupById = async (id) => {
  const group = await Group.findById(id)
    .populate({ path: "admin", match: { isDeleted: false } })
    .populate({ path: "members", match: { isDeleted: false } });

  if (!group) {
    const err = new Error("Group not found");
    err.status = 404;
    throw err;
  }

  return group;
};

// Get all groups, excluding deleted users
const getAllGroups = async () => {
  return await Group.find({})
    .populate({ path: "admin", match: { isDeleted: false } })
    .populate({ path: "members", match: { isDeleted: false } });
};

// Update group if the current user is the admin
const updateGroup = async (id, updateData, adminId) => {
  const group = await Group.findById(id);
  if (!group) {
    const err = new Error("Group not found");
    err.status = 404;
    throw err;
  }

  if (group.admin.toString() !== adminId) {
    const err = new Error("Unauthorized: Only the admin can update this group");
    err.status = 403;
    throw err;
  }

  if (updateData.name !== undefined) group.name = updateData.name.trim();
  if (updateData.description !== undefined)
    group.description = updateData.description.trim();
  if (updateData.members !== undefined) group.members = updateData.members;
  if (updateData.admin !== undefined) group.admin = updateData.admin;

  return await group.save();
};

// Add member to group, only by admin or self
const addMemberToGroup = async (groupId, userIdToAdd, currentUserId) => {
  if (!mongoose.Types.ObjectId.isValid(userIdToAdd)) {
    const err = new Error("Invalid user ID format");
    err.status = 400;
    throw err;
  }

  const group = await Group.findById(groupId);
  if (!group) {
    const err = new Error("Group not found");
    err.status = 404;
    throw err;
  }

  const isAdmin = group.admin.toString() === currentUserId;
  const isAddingSelf = userIdToAdd === currentUserId;

  if (!isAdmin && !isAddingSelf) {
    const err = new Error("Unauthorized: You can only add yourself to a group");
    err.status = 403;
    throw err;
  }

  const userExists = await User.exists({ _id: userIdToAdd });
  if (!userExists) {
    const err = new Error("User does not exist");
    err.status = 404;
    throw err;
  }

  if (group.members.includes(userIdToAdd)) {
    const err = new Error("User is already a member of this group");
    err.status = 400;
    throw err;
  }

  group.members.push(userIdToAdd);
  await group.save();
  return group;
};

// Remove member from group, only by admin or self, cannot remove admin
const removeMemberFromGroup = async (
  groupId,
  userIdToRemove,
  currentUserId
) => {
  if (!mongoose.Types.ObjectId.isValid(userIdToRemove)) {
    const err = new Error("Invalid user ID format");
    err.status = 400;
    throw err;
  }

  const group = await Group.findById(groupId);
  if (!group) {
    const err = new Error("Group not found");
    err.status = 404;
    throw err;
  }

  const isAdmin = group.admin.toString() === currentUserId;
  const isRemovingSelf = userIdToRemove === currentUserId;

  if (!isAdmin && !isRemovingSelf) {
    const err = new Error(
      "Unauthorized: You can only remove yourself from the group"
    );
    err.status = 403;
    throw err;
  }

  if (group.admin.toString() === userIdToRemove) {
    const err = new Error("Cannot remove the admin from the group");
    err.status = 400;
    throw err;
  }

  const userExists = await User.exists({ _id: userIdToRemove });
  if (!userExists) {
    const err = new Error("User does not exist");
    err.status = 404;
    throw err;
  }

  const isMember = group.members.some(
    (memberId) => memberId.toString() === userIdToRemove
  );
  if (!isMember) {
    const err = new Error("User is not a member of this group");
    err.status = 400;
    throw err;
  }

  group.members = group.members.filter(
    (memberId) => memberId.toString() !== userIdToRemove
  );
  await group.save();
  return group;
};

// Delete group if the current user is the admin
const deleteGroup = async (id, adminId) => {
  const group = await Group.findById(id);
  if (!group) {
    const err = new Error("Group not found");
    err.status = 404;
    throw err;
  }

  if (group.admin.toString() !== adminId) {
    const err = new Error("Unauthorized: Only the admin can delete this group");
    err.status = 403;
    throw err;
  }

  return await Group.findByIdAndDelete(id);
};

const getGroupsByUserId = async (userId) => {
  return await Group.find({ members: userId }); // assuming "members" is an array of user IDs
};

module.exports = {
  createGroup,
  getGroupById,
  getAllGroups,
  updateGroup,
  addMemberToGroup,
  removeMemberFromGroup,
  deleteGroup,
  getGroupsByUserId
};
