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

const addMemberToGroup = async (groupId, userId, adminId) => {
  const group = await Group.findById(groupId);
  if (!group) return { error: 'Group not found' };
  if (group.admin.toString() !== adminId) return { error: 'Unauthorized: Only the admin can add members' };

  const userExists = await User.exists({ _id: userId });
  if (!userExists) return { error: 'User does not exist' };

  if (group.members.includes(userId)) {
    return { error: 'User is already a member of this group' };
  }

  group.members.push(userId);
  await group.save();
  return { group };
};

const removeMemberFromGroup = async (groupId, userId, adminId) => {
  const group = await Group.findById(groupId);
  if (!group) return null;
  if (group.admin.toString() !== adminId) throw new Error('Unauthorized: Only the admin can remove members');

  group.members = group.members.filter(memberId => memberId.toString() !== userId);
  await group.save();
  return group;
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
