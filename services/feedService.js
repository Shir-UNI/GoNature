const Group = require("../models/Group");
const Post = require("../models/Post");
const User = require("../models/User");

const getUserFeed = async (userId) => {
  if (!userId) {
    const err = new Error("User ID is required");
    err.status = 400;
    throw err;
  }

  // Load user's groups
  let userGroups;
  try {
    userGroups = await Group.find({ members: userId });
  } catch (err) {
    throw err;
  }

  const groupIds = userGroups.map((group) => group._id);

  // Load user to get following list
  let user;
  try {
    user = await User.findById(userId);
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
  } catch (err) {
    throw err;
  }

  const followedUserIds = user.following || [];
  const feedAuthorIds = [...followedUserIds.map((id) => id.toString()), userId];

  // Load posts from groups or followed users
  let posts = [];
  try {
    posts = await Post.find({
      $or: [{ group: { $in: groupIds } }, { user: { $in: feedAuthorIds } }],
    })
      .sort({ createdAt: -1 })
      .populate("user", "username profileImage isDeleted")
      .populate("group", "name")
      .lean();
  } catch (err) {
    throw err;
  }

  // Filter deleted users
  const visiblePosts = posts.filter((post) => {
    const show = post.user && !post.user.isDeleted;
    if (!show) {
      console.warn("⚠️ Post skipped from deleted or missing user:", post._id);
    }
    return show;
  });

  // Deduplicate posts
  const uniquePostsMap = new Map();
  for (const post of visiblePosts) {
    uniquePostsMap.set(post._id.toString(), post);
  }

  const uniquePosts = Array.from(uniquePostsMap.values());

  return uniquePosts;
};

module.exports = {
  getUserFeed,
};
