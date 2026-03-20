import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import RequestCard from '../components/RequestCard';

const COLUMNS = [
  { key: 'open', label: 'Open', icon: '🟢', cls: 'border-emerald-500/30' },
  { key: 'in-progress', label: 'In Progress', icon: '🟡', cls: 'border-yellow-500/30' },
  { key: 'completed', label: 'Completed', icon: '🏁', cls: 'border-gold-500/30' },
];

const ProjectBoard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        // Fetch all requests and filter on frontend
        const { data } = await api.get('/requests');
        const mine = data.filter(r =>
          r.postedBy?._id === user?._id ||
          r.acceptedMembers?.some(m => (m._id || m) === user?._id)
        );
        setRequests(mine);
      } catch (err) {
        console.error('Failed to fetch board:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-royal-900">My Project Board</h1>
          <p className="text-royal-500 text-sm mt-1">Your collaborations organized by status</p>
        </div>
        <button onClick={() => navigate('/post')} className="btn-primary">+ New Request</button>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-24 text-royal-400">
          <span className="text-5xl mb-4 block">📋</span>
          <p className="text-lg font-medium text-royal-500">No projects yet</p>
          <p className="text-sm mt-1">Post a request or get accepted to a team to see your board</p>
          <button onClick={() => navigate('/post')} className="btn-primary mt-6">Post Your First Request</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map(col => {
            const colItems = requests.filter(r => r.status === col.key);
            return (
              <div key={col.key} className={`card border-t-2 ${col.cls} p-4`}>
                <div className="flex items-center gap-2 mb-4">
                  <span>{col.icon}</span>
                  <h2 className="font-semibold text-royal-900">{col.label}</h2>
                  <span className="ml-auto bg-cream-200 text-royal-500 text-xs px-2 py-0.5 rounded-full">
                    {colItems.length}
                  </span>
                </div>
                {colItems.length === 0 ? (
                  <div className="text-center py-8 text-gold-500 text-sm">No projects here</div>
                ) : (
                  <div className="space-y-3">
                    {colItems.map(req => (
                      <div key={req._id} onClick={() => navigate(`/project/${req._id}`)} className="cursor-pointer">
                        <RequestCard request={req} showBookmark={false} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectBoard;
