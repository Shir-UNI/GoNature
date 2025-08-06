const searchService = require('../services/searchService');

const searchUsersAndGroups = async (req, res) => {
  try {
    const { q } = req.query;
    const results = await searchService.searchUsersAndGroups(q);
    res.json(results);
  } catch (err) {
    console.error('Search error:', err);
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
};

module.exports = {
  searchUsersAndGroups,
};
