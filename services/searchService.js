const User = require('../models/User');
const Group = require('../models/Group');

/**
 * Search users and groups by a keyword
 * @param {string} query
 * @returns {Promise<{ users: Array, groups: Array }>}
 */
const searchUsersAndGroups = async (query) => {
  if (!query || query.trim().length < 2) {
    const error = new Error('Search query must be at least 2 characters');
    error.status = 400;
    throw error;
  }

  const regex = new RegExp(query.trim(), 'i');

  const [users, groups] = await Promise.all([
    User.find({ username: regex }).select('_id username profileImage').limit(5),
    Group.find({ name: regex }).select('_id name').limit(5),
  ]);

  return { users, groups };
};

module.exports = {
  searchUsersAndGroups,
};
