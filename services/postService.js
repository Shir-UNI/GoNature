const mongoose = require('mongoose');

const Post = require("../models/Post");
const Group = require("../models/Group");

const { postToFacebook } = require('./facebookService.js');

const createPost = async ({ user, content, media, type, group, location }) => {
  if (!user || !content || !group) {
    throw new Error("User, content, and group are required");
  }

  // Check if the group exists
  const groupDoc = await Group.findById(group);
  if (!groupDoc) {
    const err = new Error("Group not found");
    err.status = 404;
    throw err;
  }
 
  // Check if the user is a member of the group
  const isMember = groupDoc.members.some(
    (memberId) => memberId.toString() === user.toString()
  );
  if (!isMember) {
    const err = new Error("User is not a member of the group");
    err.status = 403;
    throw err;
  }

  // Create post
  const post = new Post({
    user,
    content,
    type,
    group,
    location,
    media: media || undefined,
  });

  postToFacebook(post)
    .catch(e => console.error('FB integration failed:', e));

  return await post.save();
};

const getPostById = async (id, includeDeletedUsers = false) => {
  try {
    const post = await Post.findById(id)
      .populate("user", "username profileImage isDeleted")
      .populate("group", "name");

    if (!post) return null;

    if (!includeDeletedUsers && (!post.user || post.user.isDeleted)) {
      return null;
    }

    return post;
  } catch (error) {
    return null;
  }
};

const getAllPosts = async (includeDeletedUsers = false) => {
  const posts = await Post.find({})
    .populate("user", "username profileImage isDeleted")
    .populate("group", "name")
    .sort({ createdAt: -1 })
    .lean();

  if (!includeDeletedUsers) {
    return posts.filter(post => post.user && !post.user.isDeleted);
  }

  return posts;
};


const updatePost = async (id, userId, updateData) => {
  const post = await Post.findById(id);
  if (!post) {
    throw new Error("Post not found");
  }

  // Only the post creator can update it
  if (post.user.toString() !== userId) {
    const err = new Error("Unauthorized: You can only update your own posts");
    err.status = 403;
    throw err;
  }

  // Allow only certain fields to be updated
  const allowedFields = ["content", "type", "media", "location", "group"];
  for (const key of Object.keys(updateData)) {
    if (allowedFields.includes(key)) {
      post[key] = updateData[key];
    }
  }

  // Handle media field depending on type
  if (updateData.type === "image") {
    post.imageUrl = updateData.media;
    post.videoUrl = undefined;
  } else if (updateData.type === "video") {
    post.videoUrl = updateData.media;
    post.imageUrl = undefined;
  } else {
    post.imageUrl = undefined;
    post.videoUrl = undefined;
  }

  return await post.save();
};

const deletePost = async (id, userId) => {
  const post = await Post.findById(id);
  if (!post) {
    throw new Error("Post not found");
  }

  // Only the post creator can delete it
  if (post.user.toString() !== userId) {
    const err = new Error("Unauthorized: You can only delete your own posts");
    err.status = 403;
    throw err;
  }

  return await Post.findByIdAndDelete(id);
};

const getPostsByUser = async (userId) => {
  try {
    const posts = await Post.find({ user: userId })
      .populate("group", "name") // get group name for the D3 chart
      .populate("user", "username profileImage") // in case it's needed
      .sort({ createdAt: -1 });
    return posts;
  } catch (err) {
    const error = new Error("Failed to fetch posts by user");
    error.status = 500;
    throw error;
  }
};

const aggregatePostsPerMonth = async (userId, fromDate) => {
  return Post.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: fromDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 }
    }
  ]);
};

const getPostsByGroup = async (groupId) => {
  try {
    const posts = await Post.find({ group: groupId })
      .populate('user', 'username profileImage')
      .sort({ createdAt: -1 })
      .exec();
    return posts;
  } catch (err) {
    const error = new Error('Failed to fetch posts by group');
    error.status = 500;
    throw error;
  }
};


module.exports = {
  createPost,
  getPostById,
  getAllPosts,
  updatePost,
  deletePost,
  getPostsByUser,
  aggregatePostsPerMonth,
  getPostsByGroup,
};
