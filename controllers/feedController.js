const feedService = require('../services/feedService');

const getFeed = async (req, res) => {
  try {
    const userId = req.session.userId;
    const posts = await feedService.getUserFeed(userId);
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load feed', error: err.message });
  }
};

module.exports = {
  getFeed
};
