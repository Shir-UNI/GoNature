
const Group = require('../models/Group');

const createGroup = async ({ name, description, creatorId }) => {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new Error('Group name is required');
  }

  const group = new Group({
    name: name.trim(),
    description: description?.trim(),
    admin: creatorId,
    members: [creatorId]
  });

  return await group.save();
};

const getGroupById = async (id) => {
  try {
    return await Group.findById(id).populate('members');
  } catch (error) {
    return null;
  }
};

const getAllGroups = async () => {
  return await Group.find({}).populate('members').sort({ createdAt: -1 });
};

const updateGroup = async (id, updateData) => {
  const group = await Group.findById(id);
  if (!group) return null;

  // Update group name if provided
  if (updateData.name !== undefined) {
    group.name = updateData.name.trim();
  }

  // Update group description if provided
  if (updateData.description !== undefined) {
    group.description = updateData.description.trim();
  }

  // Update members if provided
  if (updateData.members !== undefined) {
    group.members = updateData.members;
  }

  // Update admin if provided
  if (updateData.admin !== undefined) {
    const adminId = updateData.admin.toString();
    const memberIds = group.members.map(m => m.toString());

    // Ensure the new admin is a member of the group
    if (!memberIds.includes(adminId)) {
      throw new Error('New admin must be a member of the group');
    }

    group.admin = updateData.admin;
  }

  // Save and return the updated group
  return await group.save();
};


// Add a member to the group if not already added
const addMemberToGroup = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group) return null;
  if (!group.members.includes(userId)) {
    group.members.push(userId);
    await group.save();
  }
  return group;
};

// Remove a member from the group if they exist
const removeMemberFromGroup = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group) return null;
  group.members = group.members.filter(memberId => memberId.toString() !== userId);
  await group.save();
  return group;
};

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
