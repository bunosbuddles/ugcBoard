const mongoose = require('mongoose');

// Creator Schema
const creatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  socialHandles: {
    instagram: String,
    tiktok: String,
    youtube: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  notes: String
});

module.exports = mongoose.model('Creator', creatorSchema);
