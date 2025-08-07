const mongoose = require("mongoose");

const validateRegistration = (req, res, next) => {
  const { username, email, password, profileImage } = req.body;

  // Validate username
  if (!username || typeof username !== "string") {
    return res
      .status(400)
      .json({ message: "Username is required and must be a string" });
  }
   const trimmedUsername = username.trim();
  if (username.trim().length < 3 || username.trim().length > 20) {
    return res
      .status(400)
      .json({ message: "Username must be between 3 and 20 characters" });
  }
  // Validate only letters and spaces (Unicode letters supported)
  if (!/^[\p{L}\s]+$/u.test(trimmedUsername)) {
    return res
      .status(400)
      .json({ message: "Username can only contain letters and spaces" });
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== "string" || !emailRegex.test(email)) {
    return res.status(400).json({ message: "A valid email is required" });
  }

  // Validate password
  if (!password || typeof password !== "string") {
    return res
      .status(400)
      .json({ message: "Password is required and must be a string" });
  }
  if (password.length < 6 || password.length > 50) {
    return res
      .status(400)
      .json({ message: "Password must be between 6 and 50 characters" });
  }

  // Optional: Validate profileImage (if provided)
  if (profileImage && typeof profileImage !== "string") {
    return res
      .status(400)
      .json({ message: "Profile image must be a string (URL)" });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== "string" || !emailRegex.test(email)) {
    return res.status(400).json({ message: "A valid email is required" });
  }

  // Validate password
  if (!password || typeof password !== "string") {
    return res
      .status(400)
      .json({ message: "Password is required and must be a string" });
  }

  next();
};

const validateUpdateUser = (req, res, next) => {
  const { username, email, password, profileImage } = req.body;

  // Validate username if provided
  if (username !== undefined) {
    if (typeof username !== "string") {
      return res.status(400).json({ message: "Username must be a string" });
    }
    if (username.trim().length < 3 || username.trim().length > 20) {
      return res
        .status(400)
        .json({ message: "Username must be between 3 and 20 characters" });
    }
  }

  // Validate email if provided
  if (email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== "string" || !emailRegex.test(email)) {
      return res.status(400).json({ message: "A valid email is required" });
    }
  }

  // Validate password if provided
  if (password !== undefined) {
    if (typeof password !== "string") {
      return res.status(400).json({ message: "Password must be a string" });
    }
    if (password.length < 6 || password.length > 50) {
      return res
        .status(400)
        .json({ message: "Password must be between 6 and 50 characters" });
    }
  }

  // Validate profileImage if provided
  if (profileImage !== undefined && typeof profileImage !== "string") {
    return res
      .status(400)
      .json({ message: "Profile image must be a string (URL)" });
  }

  next();
};

const validateUserIdParam = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateUpdateUser,
  validateUserIdParam,
};
