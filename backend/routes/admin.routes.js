const express = require('express');
const User = require('../models/User.model');
const CollabRequest = require('../models/CollabRequest.model');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

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

// POST /api/admin/announcements — log announcement (no model; can be extended)
router.post('/announcements', async (req, res) => {
  try {
    const { title, message, targetDept } = req.body;
    console.log('📢 Announcement:', { title, message, targetDept, postedAt: new Date() });
    res.status(201).json({ message: 'Announcement posted successfully.', announcement: { title, message, targetDept } });
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
