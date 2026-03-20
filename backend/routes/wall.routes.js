const express = require('express');
const CollabRequest = require('../models/CollabRequest.model');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/wall — all published projects
router.get('/', async (req, res) => {
  try {
    const published = await CollabRequest.find({ isPublished: true })
      .populate('postedBy', 'name avatar department')
      .populate('acceptedMembers', 'name avatar department')
      .sort({ createdAt: -1 });
    res.json(published);
  } catch (err) {
    console.error('Wall fetch error:', err);
    res.status(500).json({ message: 'Server error fetching wall.' });
  }
});

// PUT /api/wall/:id/publish — publish a completed project
router.put('/:id/publish', verifyToken, async (req, res) => {
  try {
    const request = await CollabRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });

    if (request.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the poster can publish this project.' });
    }

    request.isPublished = true;
    request.publishedOutcome = req.body.publishedOutcome || '';
    await request.save();

    res.json({ message: 'Project published to wall.', request });
  } catch (err) {
    console.error('Publish error:', err);
    res.status(500).json({ message: 'Server error publishing project.' });
  }
});

module.exports = router;
