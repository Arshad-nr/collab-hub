import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { api } from '../context/AuthContext';

const TeamChat = ({ projectId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    // Fetch message history
    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/messages/${projectId}`);
        setMessages(data);
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();

    // Connect Socket.io
    socketRef.current = io('/', { withCredentials: true });
    socketRef.current.emit('joinProject', projectId);

    // Listen for incoming messages
    socketRef.current.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [projectId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !socketRef.current) return;

    socketRef.current.emit('sendMessage', {
      projectId,
      senderId: currentUser._id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar || '',
      text: text.trim(),
    });

    setText('');
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-96 card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gold-300 bg-cream-200/50">
        <h3 className="text-royal-900 font-semibold text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Team Chat
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-royal-400 text-sm mt-8">No messages yet. Say hello! 👋</p>
        ) : (
          messages.map((msg) => {
            const isOwn = (msg.sender?._id || msg.sender) === currentUser._id;
            return (
              <div key={msg._id} className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                {msg.sender?.avatar ? (
                  <img src={msg.sender.avatar} alt={msg.sender.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-royal-600 to-royal-800 flex items-center justify-center text-gold-500 text-xs font-bold flex-shrink-0">
                    {(msg.sender?.name || 'U')[0].toUpperCase()}
                  </div>
                )}

                {/* Bubble */}
                <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                  {!isOwn && <span className="text-xs text-royal-400 px-1">{msg.sender?.name}</span>}
                  <div className={`px-3 py-2 rounded-2xl text-sm ${
                    isOwn
                      ? 'bg-primary-600 text-royal-900 rounded-br-sm'
                      : 'bg-cream-200 text-royal-700 rounded-bl-sm border border-gold-300'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-xs text-gold-500 px-1">{formatTime(msg.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-gold-300 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="input flex-1 text-sm py-2"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="btn-primary px-4 py-2 text-sm"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default TeamChat;
