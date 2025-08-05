const authService = require('../services/authService');

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const profileImage = req.file ? `/uploads/profiles/${req.file.filename}` : '/public/images/profile-default.png';
    
    await authService.registerUser({ username, email, password, profileImage });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Registration failed', error: err.message });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.loginUser({ email, password });

    req.session.userId = user._id;
    res.status(200).json({ message: 'Login successful', userId: user._id });
  } catch (err) {
    res.status(401).json({ message: 'Login failed', error: err.message });
  }
};

const logoutUser = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logout successful' });
  });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser
};
