const postService = require('../services/postService');
const mongoose = require('mongoose');

const createPost = async (req, res) => {
  try {
    const userId = req.session.userId;

    const post = await postService.createPost({
      ...req.body,
      user: userId
    });

    res.status(201).json(post);

  } catch (error) {
    // Handle invalid ObjectId (e.g., malformed group ID)
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid group ID' });
    }

    // Handle known service-level errors
    const status = error.status || 500;
    const message = error.message || 'Failed to create post';

    console.error('Create post error:', message);
    res.status(status).json({ message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await postService.getAllPosts();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve posts', error: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await postService.getPostById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve post', error: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const updated = await postService.updatePost(req.params.id, req.session.userId, req.body);
    if (!updated) return res.status(403).json({ message: 'You are not allowed to edit this post' });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update post', error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const deleted = await postService.deletePost(req.params.id, userId);
    if (!deleted) return res.status(403).json({ message: 'You are not allowed to delete this post' });

    res.status(200).json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete post', error: error.message });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost
};
