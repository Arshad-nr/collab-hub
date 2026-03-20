const Message = require('../models/Message.model');

let _io = null;

const initSocket = (io) => {
  _io = io;

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // All authenticated clients join a global notifications room
    socket.on('joinNotifications', () => {
      socket.join('notifications');
      console.log(`🔔 Socket ${socket.id} joined notifications room`);
    });

    // Client emits 'joinProject' with projectId to enter a chat room
    socket.on('joinProject', (projectId) => {
      socket.join(projectId);
      console.log(`📦 Socket ${socket.id} joined room: ${projectId}`);
    });

    // Client emits 'sendMessage' with { projectId, senderId, senderName, senderAvatar, text }
    socket.on('sendMessage', async (data) => {
      try {
        const { projectId, senderId, senderName, senderAvatar, text } = data;

        // Save message to MongoDB
        const Message_ = require('../models/Message.model');
        const message = new Message_({
          projectId,
          sender: senderId,
          text,
        });
        await message.save();

        // Broadcast to all in the room, including populated sender info
        const payload = {
          _id: message._id,
          projectId,
          sender: {
            _id: senderId,
            name: senderName,
            avatar: senderAvatar,
          },
          text,
          createdAt: message.createdAt,
        };

        io.to(projectId).emit('receiveMessage', payload);
      } catch (err) {
        console.error('Socket sendMessage error:', err);
        socket.emit('error', { message: 'Failed to send message.' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};

// Call this from any route to broadcast a real-time event
const getIo = () => _io;

module.exports = { initSocket, getIo };

