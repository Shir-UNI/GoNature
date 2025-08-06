const Group = require("../models/Group");
const Post = require("../models/Post");

const getUserFeed = async (userId) => {
  if (!userId) {
    const err = new Error("User ID is required");
    err.status = 400;
    throw err;
  }

  // Find all groups the user is a member of
  const userGroups = await Group.find({ members: userId });
  const groupIds = userGroups.map((group) => group._id);

  // Get the list of followed users
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  const followedUserIds = user.following || [];
  const feedAuthorIds = [...followedUserIds.map((id) => id.toString()), userId];

  // Fetch posts from:
  // - groups the user is in
  // - OR users they follow (including self)
  const posts = await Post.find({
    $or: [{ group: { $in: groupIds } }, { user: { $in: feedAuthorIds } }],
  })
    .sort({ createdAt: -1 })
    .populate("user", "username profileImage isDeleted")
    .populate("group", "name")
    .lean();

  // Filter deleted users
  const visiblePosts = posts.filter(
    (post) => post.user && !post.user.isDeleted
  );

  // Remove duplicates by post._id
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
