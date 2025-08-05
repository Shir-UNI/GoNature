const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }
};

const checkUserNotDeleted = async (req, res, next) => {
  const user = await User.findById(req.session.userId);
  if (!user || user.isDeleted) {
    return res
      .status(403)
      .json({ message: "User account is deleted or inactive" });
  }
  next();
};

module.exports = { isAuthenticated, checkUserNotDeleted };
