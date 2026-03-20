import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import RequestCard from '../components/RequestCard';

const Bookmarks = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    try {
      // Get current user with populated bookmarks
      const { data } = await api.get('/auth/me');
      updateUser(data);
      // Populate each bookmark by fetching full request
      const populatedBookmarks = await Promise.all(
        (data.bookmarks || []).map(async (b) => {
          try {
            const res = await api.get(`/requests/${b._id || b}`);
            return res.data;
          } catch {
            return null;
          }
        })
      );
      setBookmarks(populatedBookmarks.filter(Boolean));
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookmarks(); }, []);

  const handleUnbookmark = async (reqId) => {
    try {
      await api.post(`/profile/bookmark/${reqId}`);
      setBookmarks(prev => prev.filter(b => b._id !== reqId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove bookmark.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-royal-900">Saved Requests</h1>
        <p className="text-royal-500 text-sm mt-1">
          {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-24 text-royal-400">
          <span className="text-5xl block mb-4">📌</span>
          <p className="text-lg font-medium text-royal-500">No saved requests yet</p>
          <p className="text-sm mt-1">Bookmark requests from Browse to find them here later</p>
          <button onClick={() => navigate('/browse')} className="btn-primary mt-6">Browse Requests</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {bookmarks.map(req => (
            <div key={req._id} className="relative">
              <RequestCard
                request={req}
                showBookmark={true}
                onBookmarkToggle={() => handleUnbookmark(req._id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
