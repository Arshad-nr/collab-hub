const express = require('express');
const Announcement = require('../models/Announcement.model');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/announcements — fetch recent announcements (any logged-in user)
router.get('/', verifyToken, async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('postedBy', 'name');
    res.json(announcements);
  } catch (err) {
    console.error('Get announcements error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
