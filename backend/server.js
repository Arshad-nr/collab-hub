require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const { initSocket } = require('./socket/socket');

// Route imports
const authRoutes = require('./routes/auth.routes');
const requestRoutes = require('./routes/request.routes');
const profileRoutes = require('./routes/profile.routes');
const messageRoutes = require('./routes/message.routes');
const wallRoutes = require('./routes/wall.routes');
const adminRoutes = require('./routes/admin.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();
const server = http.createServer(app);

const ALLOWED_ORIGINS = ['http://localhost:5173', 'http://localhost:4200'];

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/wall', wallRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// ── Static file serving ─────────────────────────────────────────────────────
const PUBLIC = path.join(__dirname, 'public');

// Landing page at root
app.get('/', (req, res) => res.sendFile(path.join(PUBLIC, 'landing.html')));

// Angular admin portal at /admin/
app.use('/admin', express.static(path.join(PUBLIC, 'admin')));
app.get('/admin/*', (req, res) =>
  res.sendFile(path.join(PUBLIC, 'admin', 'index.html'))
);

// React student portal at /student/
app.use('/student', express.static(path.join(PUBLIC, 'student')));
app.get('/student/*', (req, res) =>
  res.sendFile(path.join(PUBLIC, 'student', 'index.html'))
);

// ── Socket.io ───────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
initSocket(io);

// ── MongoDB + Server start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
