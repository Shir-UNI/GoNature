
const User = require('../models/User');

// Get user by ID (only if not deleted)
const getUserById = async (id) => {
  const user = await User.findOne({ _id: id, isDeleted: false }).select('-password');
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return user;
};

// Get all users (excluding deleted ones)
const getAllUsers = async () => {
  return await User.find({ isDeleted: false }).select('-password');
};

// Update user only if userId matches the session user and user is not deleted
const updateUser = async (id, updateData, currentUserId) => {
  if (id !== currentUserId) {
    const err = new Error('Unauthorized: You can only update your own profile');
    err.status = 403;
    throw err;
  }

  const user = await User.findOne({ _id: id, isDeleted: false });
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  if (updateData.username !== undefined) user.username = updateData.username.trim();
  if (updateData.email !== undefined) user.email = updateData.email.trim();
  if (updateData.profileImage !== undefined) user.profileImage = updateData.profileImage;

  return await user.save();
};

// Delete user only if userId matches the session user
const deleteUser = async (id, currentUserId) => {
  if (id !== currentUserId) {
    const err = new Error('Unauthorized: You can only delete your own account');
    err.status = 403;
    throw err;
  }

  // Check if user is an admin of any group
  const isAdmin = await Group.exists({ admin: id });
  if (isAdmin) {
    const err = new Error('Cannot delete user who is an admin of a group. Please transfer ownership first.');
    err.status = 403;
    throw err;
  }

  // Soft delete the user
  return await User.findByIdAndUpdate(id, { isDeleted: true });
};
module.exports = {
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser
};