const mongoose = require('mongoose');

const CollabRequestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  skillsNeeded: {
    type: [String],
    required: true,
  },
  deptPreferred: {
    type: String,
    default: '',
  },
  teamSize: {
    type: Number,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  interestedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  acceptedMembers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed'],
    default: 'open',
  },
  milestones: [
    {
      title: { type: String, required: true },
      done: { type: Boolean, default: false },
      dueDate: { type: Date },
    },
  ],
  isPublished: {
    type: Boolean,
    default: false,
  },
  publishedOutcome: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('CollabRequest', CollabRequestSchema);
