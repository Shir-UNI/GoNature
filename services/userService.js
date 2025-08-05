
const User = require('../models/User');

// Get user by ID
const getUserById = async (id) => {
  return await User.findById(id).select('-password'); // exclude password from response
};

// Get all users
const getAllUsers = async () => {
  return await User.find().select('-password'); // exclude passwords
};

// Update user only if userId matches the session user
const updateUser = async (id, updateData, currentUserId) => {
  if (id !== currentUserId) {
    throw new Error('Unauthorized: You can only update your own profile');
  }

  const user = await User.findById(id);
  if (!user) return null;

  if (updateData.username !== undefined) user.username = updateData.username.trim();
  if (updateData.email !== undefined) user.email = updateData.email.trim();
  if (updateData.profileImage !== undefined) user.profileImage = updateData.profileImage;

  return await user.save();
};

// Delete user only if userId matches the session user
const deleteUser = async (id, currentUserId) => {
  if (id !== currentUserId) {
    throw new Error('Unauthorized: You can only delete your own account');
  }

  return await User.findByIdAndUpdate(id, { isDeleted: true });
};

module.exports = {
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser
};