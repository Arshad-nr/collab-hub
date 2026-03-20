const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Helper: generate JWT and set HTTP-only cookie
const sendTokenCookie = (res, user) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department, year, skills } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      department,
      year,
      skills: Array.isArray(skills) ? skills : [],
    });

    await user.save();

    sendTokenCookie(res, user);

    const { password: _, ...userObj } = user.toObject();
    res.status(201).json({ message: 'Registered successfully.', user: userObj });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    sendTokenCookie(res, user);

    const { password: _, ...userObj } = user.toObject();
    res.json({ message: 'Logged in successfully.', user: userObj });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
  res.json({ message: 'Logged out successfully.' });
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('bookmarks');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ message: 'Server error fetching user.' });
  }
});

module.exports = router;
