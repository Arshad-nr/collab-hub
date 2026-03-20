const express = require('express');
const User = require('../models/User.model');
const CollabRequest = require('../models/CollabRequest.model');
const Announcement = require('../models/Announcement.model');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { getIo } = require('../socket/socket');

const router = express.Router();

// All admin routes require auth + admin role
router.use(verifyToken, requireRole('admin'));

// GET /api/admin/users — all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Admin get users error:', err);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
});

// PUT /api/admin/users/:id/role — update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'Role updated.', user });
  } catch (err) {
    console.error('Admin update role error:', err);
    res.status(500).json({ message: 'Server error updating role.' });
  }
});

// POST /api/admin/announcements — save to DB and broadcast via Socket.io
router.post('/announcements', async (req, res) => {
  try {
    const { title, message, targetDept } = req.body;

    // Save to MongoDB
    const announcement = await Announcement.create({
      title,
      message,
      targetDept: targetDept || '',
      postedBy: req.user._id,
    });

    // Real-time broadcast to all students in the notifications room
    const io = getIo();
    if (io) {
      io.to('notifications').emit('new-announcement', {
        _id: announcement._id,
        title: announcement.title,
        message: announcement.message,
        targetDept: announcement.targetDept,
        createdAt: announcement.createdAt,
      });
    }

    console.log(`📢 Announcement broadcast: "${title}" → ${targetDept || 'All'}`);
    res.status(201).json({ message: 'Announcement posted.', announcement });
  } catch (err) {
    console.error('Admin announcement error:', err);
    res.status(500).json({ message: 'Server error posting announcement.' });
  }
});

// GET /api/admin/projects — all requests with full team details
router.get('/projects', async (req, res) => {
  try {
    const projects = await CollabRequest.find()
      .populate('postedBy', 'name avatar department email')
      .populate('acceptedMembers', 'name avatar department')
      .populate('interestedUsers', 'name avatar department')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error('Admin get projects error:', err);
    res.status(500).json({ message: 'Server error fetching projects.' });
  }
});

module.exports = router;
