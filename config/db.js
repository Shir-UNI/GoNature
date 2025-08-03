const mongoose = require('mongoose');
require('custom-env').env(process.env.NODE_ENV, './config');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ DB Connection Error:', error);
  }
};

module.exports = connectDB;