// middleware/groupValidator.js

const validateCreateGroup = (req, res, next) => {
  const { name, description } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'Group name is required and must be a non-empty string' });
  }

  if (description && typeof description !== 'string') {
    return res.status(400).json({ message: 'Description must be a string' });
  }

  next();
};

const validateUpdateGroup = (req, res, next) => {
  const { name, description, admin, members } = req.body;

  if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    return res.status(400).json({ message: 'Group name must be a non-empty string if provided' });
  }

  if (description !== undefined && typeof description !== 'string') {
    return res.status(400).json({ message: 'Description must be a string if provided' });
  }

  if (admin !== undefined && typeof admin !== 'string') {
    return res.status(400).json({ message: 'Admin must be a valid user ID string' });
  }

  if (members !== undefined && !Array.isArray(members)) {
    return res.status(400).json({ message: 'Members must be an array of user IDs' });
  }

  next();
};

module.exports = {
  validateCreateGroup,
  validateUpdateGroup
};
