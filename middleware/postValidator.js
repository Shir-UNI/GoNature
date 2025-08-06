const validateCreatePost = (req, res, next) => {
  let { content, type, media, location } = req.body;

  const hasContent = content && typeof content === 'string' && content.trim() !== '';
  const hasMedia = typeof media === 'string' && media.trim() !== '';
  if (!hasContent && !hasMedia) {
    return res.status(400).json({ message: 'Post must include either content or media' });
  }

  if (!['text', 'image', 'video'].includes(type)) {
    return res.status(400).json({ message: 'Invalid post type' });
  }

  if ((type === 'image' || type === 'video') && !hasMedia) {
    return res.status(400).json({ message: 'Media URL is required for image/video posts' });
  }

  if (typeof location === 'string') {
    try {
      location = JSON.parse(location);
      req.body.location = location;
    } catch (e) {
      return res.status(400).json({ message: 'Invalid JSON format for location' });
    }
  }

  if (location) {
    const { type: locType, coordinates } = location;
    if (locType !== 'Point' || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ message: 'Invalid location format' });
    }
  }

  next();
};
const validateUpdatePost = (req, res, next) => {
  const { content, type, media, location } = req.body;

  if (type && !['text', 'image', 'video'].includes(type)) {
    return res.status(400).json({ message: 'Invalid post type' });
  }

  if (type && (type === 'image' || type === 'video')) {
    const hasMedia = typeof media === 'string' && media.trim() !== '';
    if (!hasMedia) {
      return res.status(400).json({ message: 'Media URL is required for image/video posts' });
    }
  }

  const hasContent = typeof content === 'string';
  const hasMedia = typeof media === 'string' && media.trim() !== '';
  if (hasContent && content.trim() === '' && !hasMedia) {
    return res.status(400).json({ message: 'Post cannot have empty content unless media is provided' });
  }

  if (location) {
    const { type: locType, coordinates } = location;
    if (locType !== 'Point' || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ message: 'Invalid location format' });
    }
  }

  next();
};

module.exports = {
  validateCreatePost,
  validateUpdatePost
};