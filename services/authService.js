const bcrypt = require('bcrypt');
const User = require('../models/User');

const registerUser = async ({ username, email, password, profileImage }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    profileImage
  });

  await newUser.save();
  return newUser;
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid email or password');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Invalid email or password');

  return user;
};

module.exports = {
  registerUser,
  loginUser
};
