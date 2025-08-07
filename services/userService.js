const User = require("../models/User");
const Group = require("../models/Group");

// Get user by ID (only if not deleted)
const getUserById = async (id) => {
  const user = await User.findOne({ _id: id, isDeleted: false })
    .select("-password")
    .populate({
      path: "following",
      match: { isDeleted: false }, 
      select: "username profileImage", 
    })
    .lean();

  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  return user;
};

// Get all users (excluding deleted ones)
const getAllUsers = async () => {
  return await User.find({ isDeleted: false }).select("-password");
};

// Update user only if userId matches the session user and user is not deleted
const updateUser = async (id, updateData, currentUserId) => {
  if (id !== currentUserId) {
    const err = new Error("Unauthorized: You can only update your own profile");
    err.status = 403;
    throw err;
  }

  const user = await User.findOne({ _id: id, isDeleted: false });
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  if (updateData.username !== undefined)
    user.username = updateData.username.trim();
  if (updateData.email !== undefined) user.email = updateData.email.trim();
  if (updateData.profileImage !== undefined)
    user.profileImage = updateData.profileImage;

  return await user.save();
};

// Delete user only if userId matches the session user and user is not an admin
const deleteUser = async (id, currentUserId) => {
  if (id !== currentUserId) {
    const err = new Error("Unauthorized: You can only delete your own account");
    err.status = 403;
    throw err;
  }

  // Check if user exists and is not already deleted
  const user = await User.findById(id);
  if (!user || user.isDeleted) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  // Check if user is an admin of any group
  const isAdminOfActive = await Group.exists({
    admin: id,
    isDeleted: false,       // רק קבוצות שעדיין פעילות
  });
  if (isAdminOfActive) {
    const err = new Error(
      "Cannot delete user who is an admin of an active group. Please transfer ownership or delete the group first."
    );
    err.status = 403;
    throw err;
  }


  // Soft delete the user
  return await User.findByIdAndUpdate(id, { isDeleted: true });
};

const followUser = async (targetUserId, currentUserId) => {
  if (targetUserId === currentUserId) {
    const err = new Error("You cannot follow yourself");
    err.status = 400;
    throw err;
  }

  const currentUser = await User.findById(currentUserId);
  const targetUser = await User.findById(targetUserId);

  if (
    !currentUser ||
    currentUser.isDeleted ||
    !targetUser ||
    targetUser.isDeleted
  ) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  if (currentUser.following.includes(targetUserId)) {
    const err = new Error("Already following this user");
    err.status = 400;
    throw err;
  }

  currentUser.following.push(targetUserId);
  await currentUser.save();
};

const unfollowUser = async (targetUserId, currentUserId) => {
  const currentUser = await User.findById(currentUserId);

  if (!currentUser || currentUser.isDeleted) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  currentUser.following = currentUser.following.filter(
    (id) => id.toString() !== targetUserId
  );

  await currentUser.save();
};

module.exports = {
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  followUser,
  unfollowUser,
};
