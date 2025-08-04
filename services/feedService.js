const Group = require('../models/Group');
const Post = require('../models/Post');
const User = require('../models/User');

const getFeedForUser = async (userId) => {
  // Get all groups the user is a member of
  const userGroups = await Group.find({ members: userId }).select('_id');
  const groupIds = userGroups.map(group => group._id);

  // Get all posts from those groups, newest first
  const posts = await Post.find({ group: { $in: groupIds } })
    .populate('user', 'username profileImage') // populate user data
    .populate('group', 'name') // populate group name
    .sort({ createdAt: -1 });

  return posts;
};

module.exports = {
  getFeedForUser
};
