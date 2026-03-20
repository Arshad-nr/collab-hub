const express = require('express');
const User = require('../models/User.model');
const CollabRequest = require('../models/CollabRequest.model');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/profile/:id — get user profile + their posted requests
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const projects = await CollabRequest.find({ postedBy: req.params.id }).sort({ createdAt: -1 });

    res.json({ user, projects });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
});

// PUT /api/profile — update own profile
router.put('/', verifyToken, async (req, res) => {
  try {
    const { name, bio, skills, department, year, avatar } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, skills, department, year, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated.', user: updated });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
});

// POST /api/profile/:id/endorse — endorse a skill
router.post('/:id/endorse', verifyToken, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot endorse yourself.' });
    }

    const { skill } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const existingEndorsement = user.endorsements.find((e) => e.skill === skill);
    if (existingEndorsement) {
      existingEndorsement.count += 1;
    } else {
      user.endorsements.push({ skill, count: 1 });
    }

    await user.save();
    res.json({ message: 'Skill endorsed.', endorsements: user.endorsements });
  } catch (err) {
    console.error('Endorse error:', err);
    res.status(500).json({ message: 'Server error endorsing skill.' });
  }
});

// POST /api/profile/bookmark/:reqId — toggle bookmark
router.post('/bookmark/:reqId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const reqId = req.params.reqId;
    const alreadyBookmarked = user.bookmarks.some((b) => b.toString() === reqId);

    if (alreadyBookmarked) {
      user.bookmarks = user.bookmarks.filter((b) => b.toString() !== reqId);
    } else {
      user.bookmarks.push(reqId);
    }

    await user.save();
    res.json({
      message: alreadyBookmarked ? 'Bookmark removed.' : 'Bookmark added.',
      bookmarks: user.bookmarks,
    });
  } catch (err) {
    console.error('Bookmark error:', err);
    res.status(500).json({ message: 'Server error toggling bookmark.' });
  }
});

module.exports = router;
