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

const updateGroup = async (id, updateData) => {
  const group = await Group.findById(id);
  if (!group) return null;

  if (updateData.name !== undefined) group.name = updateData.name.trim();
  if (updateData.description !== undefined) group.description = updateData.description.trim();
  if (updateData.members !== undefined) group.members = updateData.members;
  if (updateData.admin !== undefined) group.admin = updateData.admin;

  return await group.save();
};

// Add a member to the group if not already added
const addMemberToGroup = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group) return { error: 'Group not found' };

  const userExists = await User.exists({ _id: userId });
  if (!userExists) return { error: 'User does not exist' };

  if (group.members.includes(userId)) {
    return { error: 'User is already a member of this group' };
  }

  group.members.push(userId);
  await group.save();
  return { group };
};

// Remove a member from the group if they exist
const removeMemberFromGroup = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group) return null;
  group.members = group.members.filter(memberId => memberId.toString() !== userId);
  await group.save();
  return group;
};

// Delete a group by ID
const deleteGroup = async (id) => {
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
