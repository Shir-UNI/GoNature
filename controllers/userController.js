const userService = require("../services/userService");

const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    const status = err.status || 500;
    res
      .status(status)
      .json({ message: "Failed to get user", error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    const status = err.status || 500;
    res
      .status(status)
      .json({ message: "Failed to get users", error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };

    // If a new profile image was uploaded, override the image path
    if (req.file) {
      updates.profileImage = `/uploads/profiles/${req.file.filename}`;
    }

    const updatedUser = await userService.updateUser(
      req.params.id,
      updates,
      req.session.userId
    );

    res.status(200).json(updatedUser);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({
      message: "Failed to update user",
      error: err.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id, req.session.userId);

    // Destroy session after user deletion
    req.session.destroy((err) => {
      if (err) {
        console.error("Failed to destroy session after user deletion:", err);
        return res
          .status(500)
          .json({ message: "User deleted but failed to end session" });
      }

      res.clearCookie("connect.sid"); // Optional: clear session cookie
      res.status(200).json({ message: "User deleted successfully" });
    });
  } catch (err) {
    const status = err.status || 500;
    res
      .status(status)
      .json({ message: "Failed to delete user", error: err.message });
  }
};

// Get currently logged-in user
const getCurrentUser = async (req, res) => {
  if (!req.session.userId) {
    return res.status(400).json({ message: "User ID is missing from session" });
  }
  try {
    const user = await userService.getUserById(req.session.userId);
    res.status(200).json(user);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = {
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  getCurrentUser,
};
