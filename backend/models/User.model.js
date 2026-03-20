const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
  },
  department: {
    type: String,
    trim: true,
  },
  year: {
    type: Number,
    min: 1,
    max: 4,
  },
  skills: {
    type: [String],
    default: [],
  },
  bio: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  endorsements: [
    {
      skill: { type: String },
      count: { type: Number, default: 0 },
    },
  ],
  bookmarks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CollabRequest',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
