const Group = require("../models/Group");
const Post = require("../models/Post");

const getUserFeed = async (userId) => {
  // Validate userId
  if (!userId) {
    const err = new Error("User ID is required");
    err.status = 400;
    throw err;
  }

  // Find all groups the user is a member of
  const userGroups = await Group.find({ members: userId });

  // If user is not a member of any groups, return empty feed
  if (!userGroups || userGroups.length === 0) return [];

  // Extract the group IDs
  const groupIds = userGroups.map((group) => group._id);

  // Find posts from those groups, sorted by date descending
  const posts = await Post.find({ group: { $in: groupIds } })
    .sort({ createdAt: -1 })
    .populate("user", "username profileImage isDeleted")
    .populate("group", "name")
    .lean();

  // Filter out posts by deleted users
  const visiblePosts = posts.filter(
    (post) => post.user && !post.user.isDeleted
  );

  return visiblePosts;
};

module.exports = {
  getUserFeed,
};
