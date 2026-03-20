const express = require('express');
const CollabRequest = require('../models/CollabRequest.model');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/requests — all requests, sorted newest first
router.get('/', async (req, res) => {
  try {
    const requests = await CollabRequest.find()
      .populate('postedBy', 'name avatar department')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error('Get requests error:', err);
    res.status(500).json({ message: 'Server error fetching requests.' });
  }
});

// POST /api/requests — create new request
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, skillsNeeded, deptPreferred, teamSize, deadline } = req.body;

    const request = new CollabRequest({
      title,
      description,
      skillsNeeded: Array.isArray(skillsNeeded) ? skillsNeeded : skillsNeeded.split(',').map(s => s.trim()),
      deptPreferred,
      teamSize,
      deadline,
      postedBy: req.user.id,
    });

    await request.save();
    await request.populate('postedBy', 'name avatar department');
    res.status(201).json(request);
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ message: 'Server error creating request.' });
  }
});

// GET /api/requests/:id — single request with full team data
router.get('/:id', async (req, res) => {
  try {
    const request = await CollabRequest.findById(req.params.id)
      .populate('postedBy', 'name avatar department skills')
      .populate('acceptedMembers', 'name avatar department year skills')
      .populate('interestedUsers', 'name avatar department year skills');

    if (!request) return res.status(404).json({ message: 'Request not found.' });
    res.json(request);
  } catch (err) {
    console.error('Get request error:', err);
    res.status(500).json({ message: 'Server error fetching request.' });
  }
});

// POST /api/requests/:id/interest — show interest
router.post('/:id/interest', verifyToken, async (req, res) => {
  try {
    const request = await CollabRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });

    const alreadyInterested = request.interestedUsers.some(
      (u) => u.toString() === req.user.id
    );
    const alreadyAccepted = request.acceptedMembers.some(
      (u) => u.toString() === req.user.id
    );

    if (alreadyInterested || alreadyAccepted) {
      return res.status(400).json({ message: 'Already marked interest or already a member.' });
    }

    if (request.postedBy.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot show interest in your own request.' });
    }

    request.interestedUsers.push(req.user.id);
    await request.save();
    res.json({ message: 'Interest recorded.' });
  } catch (err) {
    console.error('Interest error:', err);
    res.status(500).json({ message: 'Server error recording interest.' });
  }
});

// PUT /api/requests/:id/accept/:userId — accept a user
router.put('/:id/accept/:userId', verifyToken, async (req, res) => {
  try {
    const request = await CollabRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });

    if (request.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the poster can accept members.' });
    }

    const { userId } = req.params;
    request.interestedUsers = request.interestedUsers.filter(
      (u) => u.toString() !== userId
    );
    const alreadyAccepted = request.acceptedMembers.some(
      (u) => u.toString() === userId
    );
    if (!alreadyAccepted) {
      request.acceptedMembers.push(userId);
    }
    if (request.status === 'open') {
      request.status = 'in-progress';
    }

    await request.save();
    await request.populate('acceptedMembers', 'name avatar department');
    res.json({ message: 'User accepted.', request });
  } catch (err) {
    console.error('Accept error:', err);
    res.status(500).json({ message: 'Server error accepting user.' });
  }
});

// PUT /api/requests/:id/reject/:userId — reject a user
router.put('/:id/reject/:userId', verifyToken, async (req, res) => {
  try {
    const request = await CollabRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });

    if (request.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the poster can reject members.' });
    }

    request.interestedUsers = request.interestedUsers.filter(
      (u) => u.toString() !== req.params.userId
    );
    await request.save();
    res.json({ message: 'User rejected.' });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ message: 'Server error rejecting user.' });
  }
});

// PUT /api/requests/:id/status — update request status
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const request = await CollabRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });

    if (request.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the poster can update status.' });
    }

    const validStatuses = ['open', 'in-progress', 'completed'];
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    request.status = req.body.status;
    await request.save();
    res.json({ message: 'Status updated.', status: request.status });
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ message: 'Server error updating status.' });
  }
});

// POST /api/requests/:id/milestones — add new milestone
router.post('/:id/milestones', verifyToken, async (req, res) => {
  try {
    const request = await CollabRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });

    const { title, dueDate } = req.body;
    request.milestones.push({ title, done: false, dueDate });
    await request.save();
    res.status(201).json({ message: 'Milestone added.', milestones: request.milestones });
  } catch (err) {
    console.error('Add milestone error:', err);
    res.status(500).json({ message: 'Server error adding milestone.' });
  }
});

// PUT /api/requests/:id/milestones/:mid — toggle milestone done
router.put('/:id/milestones/:mid', verifyToken, async (req, res) => {
  try {
    const request = await CollabRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });

    const milestone = request.milestones.id(req.params.mid);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found.' });

    milestone.done = !milestone.done;
    await request.save();
    res.json({ message: 'Milestone toggled.', milestones: request.milestones });
  } catch (err) {
    console.error('Toggle milestone error:', err);
    res.status(500).json({ message: 'Server error toggling milestone.' });
  }
});

module.exports = router;
