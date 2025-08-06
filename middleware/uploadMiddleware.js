const multer = require('multer');
const path = require('path');

// COMMON STORAGE
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profileImage') {
      cb(null, 'public/uploads/profiles');
    } else if (file.fieldname === 'media') {
      cb(null, 'public/uploads/posts');
    } else {
      cb(null, 'public/uploads/others');
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// PROFILE IMAGE FILTER
const profileImageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png/;
  const isValidExt = allowed.test(path.extname(file.originalname).toLowerCase());
  const isValidMime = allowed.test(file.mimetype);
  if (isValidExt && isValidMime) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpeg, .jpg, and .png files are allowed for profile images'));
  }
};

// POST MEDIA FILTER
const postMediaFilter = (req, file, cb) => {
  const imageTypes = /jpeg|jpg|png/;
  const videoTypes = /mp4|mov|avi|webm/;

  const ext = path.extname(file.originalname).toLowerCase().slice(1); // remove the dot
  const mime = file.mimetype;

  const isImage = imageTypes.test(ext) && imageTypes.test(mime);
  const isVideo = videoTypes.test(ext) && videoTypes.test(mime);

  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(new Error('Only image (jpeg, jpg, png) and video (mp4, mov, avi, webm) files are allowed for posts'));
  }
};

const attachMediaUrl = (req, res, next) => {
  if (req.file) {
    const filePath = `/uploads/posts/${req.file.filename}`;
    req.body.media = filePath; // תמיד נכניס את זה לשדה media
  }

  next();
};

// EXPORT TWO UPLOADERS

// Single image for registration
const uploadProfileImage = multer({ storage, fileFilter: profileImageFilter });

// Single media file for post (image or video)
const uploadPostMedia = multer({ storage, fileFilter: postMediaFilter });

module.exports = {
  uploadProfileImage,
  uploadPostMedia,
  attachMediaUrl
};
