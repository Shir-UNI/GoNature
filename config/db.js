// config/db.js
const mongoose = require('mongoose');
require('custom-env').env();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ DB Connection Error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
