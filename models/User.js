const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profileImage: {
      type: String,
      default: "/public/uploads/profiles/default.png",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    interests: [String],
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
