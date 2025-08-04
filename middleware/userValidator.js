const validateUpdateUser = (req, res, next) => {
  const { username, email, profileImage } = req.body;

  if (username && typeof username !== 'string') {
    return res.status(400).json({ message: 'Username must be a string' });
  }

  if (email && typeof email !== 'string') {
    return res.status(400).json({ message: 'Email must be a string' });
  }

  if (profileImage && typeof profileImage !== 'string') {
    return res.status(400).json({ message: 'Profile image URL must be a string' });
  }

  next();
};


module.exports = {
  validateUpdateUser,
  validateDeleteUser
};