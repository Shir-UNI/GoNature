const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }

  // If the request expects HTML (from browser), redirect to login page
  if (req.accepts('html')) {
    return res.redirect('/login');
  }

  // If the request is AJAX / API
  return res.status(401).json({ message: 'Unauthorized: Please log in' }); 
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

const redirectIfAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect("/feed");
  }
  next();
};

module.exports = {
  isAuthenticated,
  redirectIfAuthenticated,
  checkUserNotDeleted,
};
