const Group = require('../models/Group');
const Post = require('../models/Post');

const getUserFeed = async (userId) => {
  // Find all groups the user is a member of
  const userGroups = await Group.find({ members: userId });

  // Extract the group IDs
  const groupIds = userGroups.map(group => group._id);

  // Find posts from those groups, sorted by date descending
  const posts = await Post.find({ group: { $in: groupIds } })
    .sort({ createdAt: -1 })
    .populate('user', 'profileImage')
    .populate('group', 'name')
    .lean();

   // Filter out posts by deleted users
  const visiblePosts = posts.filter(post => post.user && !post.user.isDeleted);

  return visiblePosts;
};

module.exports = {
  getUserFeed
};
