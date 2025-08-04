const mongoose = require('mongoose');

const Group = require('../models/Group');
const User = require('../models/User');

const createGroup = async ({ name, description, admin }) => {
  const group = new Group({
    name: name.trim(),
    description: description?.trim(),
    admin,
    members: [admin] // Add creator as first member
  });
  return await group.save();
};

const getGroupById = async (id) => {
  try {
    return await Group.findById(id).populate('admin').populate('members');
  } catch (error) {
    return null;
  }
};

const getAllGroups = async () => {
  return await Group.find({}).populate('admin').populate('members');
};

const updateGroup = async (id, updateData, adminId) => {
  const group = await Group.findById(id);
  if (!group) return null;
  if (group.admin.toString() !== adminId) {
    throw new Error('Unauthorized: Only the admin can update this group');
  }

  if (updateData.name !== undefined) group.name = updateData.name.trim();
  if (updateData.description !== undefined) group.description = updateData.description.trim();
  if (updateData.members !== undefined) group.members = updateData.members;
  if (updateData.admin !== undefined) group.admin = updateData.admin;

  return await group.save();
};

const addMemberToGroup = async (groupId, userIdToAdd, currentUserId) => {
  const group = await Group.findById(groupId);
  if (!group) return { error: 'Group not found' };

  const isAdmin = group.admin.toString() === currentUserId;
  const isAddingSelf = userIdToAdd === currentUserId;

  // Authorization check
  if (!isAdmin && !isAddingSelf) {
    return { error: 'Unauthorized: You can only add yourself to a group' };
  }

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(userIdToAdd)) {
    return { error: 'Invalid user ID format' };
  }

  const userExists = await User.exists({ _id: userIdToAdd });
  if (!userExists) {
    return { error: 'User does not exist' };
  }

  if (group.members.includes(userIdToAdd)) {
    return { error: 'User is already a member of this group' };
  }

  group.members.push(userIdToAdd);
  await group.save();
  return { group };
};

const removeMemberFromGroup = async (groupId, userIdToRemove, currentUserId) => {
  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(userIdToRemove)) {
    return { error: 'Invalid user ID format' };
  }

  const group = await Group.findById(groupId);
  if (!group) return { error: 'Group not found' };

  const isAdmin = group.admin.toString() === currentUserId;
  const isRemovingSelf = userIdToRemove === currentUserId;

  // Authorization check
  if (!isAdmin && !isRemovingSelf) {
    return { error: 'Unauthorized: You can only remove yourself from the group' };
  }

  // Prevent removing the admin
  if (group.admin.toString() === userIdToRemove) {
    return { error: 'Cannot remove the admin from the group' };
  }

  const userExists = await User.exists({ _id: userIdToRemove });
  if (!userExists) {
    return { error: 'User does not exist' };
  }

  const isMember = group.members.some(memberId => memberId.toString() === userIdToRemove);
  if (!isMember) {
    return { error: 'User is not a member of this group' };
  }

  group.members = group.members.filter(memberId => memberId.toString() !== userIdToRemove);
  await group.save();
  return { group };
};

const deleteGroup = async (id, adminId) => {
  const group = await Group.findById(id);
  if (!group) return null;
  if (group.admin.toString() !== adminId) throw new Error('Unauthorized: Only the admin can delete this group');
  return await Group.findByIdAndDelete(id);
};

module.exports = {
  createGroup,
  getGroupById,
  getAllGroups,
  updateGroup,
  addMemberToGroup,
  removeMemberFromGroup,
  deleteGroup
};
