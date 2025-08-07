const User = require('../models/User');
const Group = require('../models/Group');

async function getSuggestedFriends(userId, limit = 10) {
  // 1. find groups current user belongs to
  const myGroups = await Group.find({ members: userId }).select('_id');
  const groupIds = myGroups.map(g => g._id);

  // 2. aggregate users sharing these groups
  const suggested = await User.aggregate([
    { $match: { _id: { $ne: require('mongoose').Types.ObjectId(userId) } } },
    { $lookup: {
        from: 'groups',
        let: { uid: '$_id' },
        pipeline: [
          { $match: { members: { $in: ['$$uid'] } } },
          { $match: { _id: { $in: groupIds } } }
        ],
        as: 'sharedGroups'
      }
    },
    { $addFields: { mutualGroupsCount: { $size: '$sharedGroups' } } },
    { $match: { mutualGroupsCount: { $gt: 0 } } },
    { $sort: { mutualGroupsCount: -1 } },
    { $limit: limit },
    { $project: { name: 1, avatarUrl: 1, mutualGroupsCount: 1 } }
  ]);

  return suggested;
}

module.exports = {
  getSuggestedFriends
};

// controllers/feedController.js
const feedService = require('../services/feedService');
const postService = require('../services/postService'); // your existing post logic

/**
 * Render feed page with posts and suggested friends
 */
exports.getFeed = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // fetch user's feed posts (via your existing service)
    const posts = await postService.getFeedPosts(userId);

    // fetch friend suggestions
    const suggestedFriends = await feedService.getSuggestedFriends(userId, 10);

    // render EJS
    res.render('feed', {
      user: req.user,
      posts,
      suggestedFriends,
      googleMapsApiKey: process.env.GOOGLE_MAPS_KEY
    });
  } catch (err) {
    next(err);
  }
};
