const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { verifyToken } = require('../middleware/auth.middleware');
const User = require('../models/User.model');

const router = express.Router();

// TODO: Add Cloudinary key — configure using env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage — buffer is uploaded to Cloudinary directly
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

// POST /api/upload/avatar — upload profile avatar
router.post('/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Upload buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'ich-avatars',
          transformation: [
            { width: 300, height: 300, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Save avatar URL to user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: result.secure_url },
      { new: true }
    ).select('-password');

    res.json({ message: 'Avatar uploaded.', avatar: result.secure_url, user });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ message: err.message || 'Upload failed.' });
  }
});

module.exports = router;
