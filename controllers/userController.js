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
    const updatedUser = await userService.updateUser(
      req.params.id,
      req.body,
      req.session.userId
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    const status = err.status || 500;
    res
      .status(status)
      .json({ message: "Failed to update user", error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id, req.session.userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    const status = err.status || 500;
    res
      .status(status)
      .json({ message: "Failed to delete user", error: err.message });
  }
};

// Get currently logged-in user
const getCurrentUser = async (req, res) => {
  console.log('Session userId:', req.session.userId); // test
  
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: Please log in' });
    }

    const user = await userService.getUserById(userId);
    res.status(200).json(user);
  } catch (err) {
    res.status(err.status || 400).json({ message: 'Failed to get user', error: err.message });
  }
};

module.exports = {
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  getCurrentUser,
};
