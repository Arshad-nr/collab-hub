import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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
    </nav>
  );
};

export default Navbar;
