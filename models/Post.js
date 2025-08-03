const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  content: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 1000
  },
  media: {
    type: String
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video'],
    default: 'text'
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      validate: {
        validator: function (val) {
          return !this.location || (Array.isArray(val) && val.length === 2);
        },
        message: 'Coordinates must be an array of [longitude, latitude]'
      }
    }
  }
}, {
  timestamps: true
});

postSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Post', postSchema);
