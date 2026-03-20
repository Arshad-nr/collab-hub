import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import SkillTag from './SkillTag';

const RequestCard = ({ request, showBookmark = true, onBookmarkToggle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interested, setInterested] = useState(
    request.interestedUsers?.some((u) => (u._id || u) === user?._id) || false
  );
  // Hide the button if user is already an accepted team member or is the poster
  const isTeamMember = request.acceptedMembers?.some((m) => (m._id || m) === user?._id) || false;
  const [bookmarked, setBookmarked] = useState(
    user?.bookmarks?.some((b) => (b._id || b) === request._id) || false
  );
  const [loading, setLoading] = useState(false);

  const handleInterest = async (e) => {
    e.stopPropagation();
    if (!user || loading) return;
    setLoading(true);
    try {
      await api.post(`/requests/${request._id}/interest`);
      setInterested(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await api.post(`/profile/bookmark/${request._id}`);
      setBookmarked((b) => !b);
      onBookmarkToggle?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const statusClass = {
    open: 'badge-open',
    'in-progress': 'badge-progress',
    completed: 'badge-completed',
  }[request.status] || 'badge-open';

  const deadline = request.deadline
    ? new Date(request.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A';

  return (
    <div
      className="card p-5 hover:border-gold-500 hover:shadow-primary-500/10 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(`/project/${request._id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-royal-900 font-semibold text-base leading-snug group-hover:text-primary-300 transition-colors line-clamp-2">
          {request.title}
        </h3>
        <span className={`${statusClass} flex-shrink-0`}>
          {request.status}
        </span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {request.skillsNeeded?.slice(0, 5).map((skill) => (
          <SkillTag key={skill} label={skill} />
        ))}
        {request.skillsNeeded?.length > 5 && (
          <span className="text-xs text-royal-400">+{request.skillsNeeded.length - 5} more</span>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-royal-400 mb-4">
        {request.deptPreferred && (
          <span className="flex items-center gap-1">
            🏛️ {request.deptPreferred}
          </span>
        )}
        <span className="flex items-center gap-1">👥 {request.teamSize} members</span>
        <span className="flex items-center gap-1">📅 {deadline}</span>
      </div>

      {/* Poster */}
      {request.postedBy && (
        <div className="flex items-center gap-2 mb-4">
          {request.postedBy.avatar ? (
            <img src={request.postedBy.avatar} alt={request.postedBy.name} className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-royal-600 to-royal-800 flex items-center justify-center text-gold-500 text-xs font-bold">
              {request.postedBy.name?.[0]?.toUpperCase()}
            </div>
          )}
          <span className="text-xs text-royal-500">
            by <Link to={`/profile/${request.postedBy._id}`} className="text-royal-600 hover:underline" onClick={e => e.stopPropagation()}>
              {request.postedBy.name}
            </Link>
            {request.postedBy.department && ` · ${request.postedBy.department}`}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {request.postedBy?._id !== user?._id && !isTeamMember && (
          <button
            onClick={handleInterest}
            disabled={interested || loading}
            className={`flex-1 text-sm py-2 rounded-lg font-semibold transition-all ${
              interested
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                : 'btn-primary'
            }`}
          >
            {interested ? '✓ Interested' : "I'm Interested"}
          </button>
        )}
        {showBookmark && user && (
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-lg border transition-all ${
              bookmarked
                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                : 'bg-cream-200 text-royal-500 border-gold-300 hover:text-yellow-400'
            }`}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            {bookmarked ? '🔖' : '📌'}
          </button>
        )}
      </div>
    </div>
  );
};

export default RequestCard;
