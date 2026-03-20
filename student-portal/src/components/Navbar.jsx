import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { api } from '../context/AuthContext';

// Connect to the backend socket (same origin in production)
let socket = null;

const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.PROD ? '/' : 'http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  // Load past announcements on mount
  useEffect(() => {
    if (!user) return;
    api.get('/announcements')
      .then(({ data }) => {
        setNotifications(data);
        setUnread(data.length);
      })
      .catch(() => {});
  }, [user]);

  // Real-time Socket.io listener
  useEffect(() => {
    if (!user) return;
    const s = getSocket();
    s.emit('joinNotifications');

    const handleAnnouncement = (announcement) => {
      // Filter by department if targetDept is set
      if (announcement.targetDept && announcement.targetDept !== user.department) return;

      setNotifications(prev => [announcement, ...prev]);
      setUnread(prev => prev + 1);
    };

    s.on('new-announcement', handleAnnouncement);
    return () => s.off('new-announcement', handleAnnouncement);
  }, [user]);

  const handleBellClick = () => {
    setOpen(o => !o);
    if (!open) setUnread(0); // mark as read when opened
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const timeAgo = (date) => {
    const mins = Math.floor((Date.now() - new Date(date)) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-cream-50/80 backdrop-blur-md border-b border-gold-300 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/browse" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-royal-600 to-royal-800 flex items-center justify-center shadow-lg">
              <span className="text-royal-900 text-sm font-bold">C</span>
            </div>
            <span className="text-royal-900 font-bold text-lg hidden sm:block">
              Collab <span className="text-royal-600">Hub</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {[
              { to: '/browse', label: 'Browse' },
              { to: '/board', label: 'Board' },
              { to: '/wall', label: 'Wall' },
              { to: '/bookmarks', label: 'Saves' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="px-3 py-2 rounded-lg text-sm font-medium text-royal-500 hover:text-royal-900 hover:bg-white/5 transition-all"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* User Info */}
          {user && (
            <div className="flex items-center gap-3">

              {/* 🔔 Bell Icon */}
              <div className="relative">
                <button
                  onClick={handleBellClick}
                  className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-royal-100 transition-colors text-royal-600"
                  title="Announcements"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M5.85 3.5a.75.75 0 0 0-1.117-1 9.719 9.719 0 0 0-2.348 4.876.75.75 0 0 0 1.479.248A8.219 8.219 0 0 1 5.85 3.5ZM19.267 2.5a.75.75 0 1 0-1.118 1 8.22 8.22 0 0 1 1.987 4.124.75.75 0 0 0 1.48-.248A9.72 9.72 0 0 0 19.266 2.5Z" />
                    <path fillRule="evenodd" d="M12 2.25A6.75 6.75 0 0 0 5.25 9v.75a8.217 8.217 0 0 1-2.119 5.52.75.75 0 0 0 .298 1.206c1.544.57 3.16.99 4.831 1.243a3.75 3.75 0 1 0 7.48 0 24.583 24.583 0 0 0 4.83-1.244.75.75 0 0 0 .298-1.205 8.217 8.217 0 0 1-2.118-5.52V9A6.75 6.75 0 0 0 12 2.25ZM9.75 18c0-.034 0-.067.002-.1a25.05 25.05 0 0 0 4.496 0l.002.1a2.25 2.25 0 1 1-4.5 0Z" clipRule="evenodd" />
                  </svg>
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </button>

                {/* Dropdown panel */}
                {open && (
                  <div className="absolute right-0 top-11 w-80 bg-white border border-gold-300 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gold-200 flex items-center justify-between bg-gradient-to-r from-royal-50 to-cream-100">
                      <span className="font-bold text-royal-900 text-sm tracking-wide">📢 Announcements</span>
                      <span className="text-xs text-royal-400">{notifications.length} total</span>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-cream-200">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-royal-400 text-sm">
                          <div className="text-3xl mb-2">🔔</div>
                          No announcements yet
                        </div>
                      ) : (
                        notifications.map((n, i) => (
                          <div key={n._id || i} className="px-4 py-3 hover:bg-cream-50 transition-colors">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-royal-900 text-sm leading-tight">{n.title}</p>
                              {n.targetDept && (
                                <span className="text-[10px] bg-royal-100 text-royal-600 px-2 py-0.5 rounded-full whitespace-nowrap font-medium flex-shrink-0">
                                  {n.targetDept}
                                </span>
                              )}
                            </div>
                            <p className="text-royal-500 text-xs mt-1 leading-relaxed">{n.message}</p>
                            <p className="text-royal-400 text-[10px] mt-1">{timeAgo(n.createdAt)}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to={`/profile/${user._id}`}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-gold-500"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-royal-600 to-royal-800 flex items-center justify-center text-gold-500 text-sm font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-royal-600 hidden md:block">
                  {user.name}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn-secondary text-sm py-1.5 px-3"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </nav>
  );
};

export default Navbar;
