const express = require('express');
const Message = require('../models/Message.model');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/messages/:projectId — get all messages for a project
router.get('/:projectId', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ projectId: req.params.projectId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ message: 'Server error fetching messages.' });
  }
});

// POST /api/messages/:projectId — save a new message (Socket.io handles broadcast separately)
router.post('/:projectId', verifyToken, async (req, res) => {
  try {
    const { text } = req.body;

    const message = new Message({
      projectId: req.params.projectId,
      sender: req.user.id,
      text,
    });

    await message.save();
    await message.populate('sender', 'name avatar');
    res.status(201).json(message);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Server error sending message.' });
  }
});

module.exports = router;
