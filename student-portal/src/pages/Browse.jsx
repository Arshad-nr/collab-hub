import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import RequestCard from '../components/RequestCard';

const DEPARTMENTS = ['All', 'CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'MBA', 'MCA', 'IT'];

const Browse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data } = await api.get('/requests');
        setRequests(data);
      } catch (err) {
        console.error('Failed to fetch requests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Skill-match score
  const getMatchScore = (req) => {
    if (!user?.skills?.length) return 0;
    const userSkillsLower = user.skills.map(s => s.toLowerCase());
    return req.skillsNeeded.filter(s => userSkillsLower.includes(s.toLowerCase())).length;
  };

  // Filter + sort
  // Only show requests with no deptPreferred when 'All' is selected
  const filtered = requests
    .filter(r => {
      const matchesDept = dept === 'All' || r.deptPreferred === dept;
      const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
      return matchesDept && matchesSearch;
    })
    .sort((a, b) => getMatchScore(b) - getMatchScore(a));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-royal-900">Browse Requests</h1>
          <p className="text-royal-500 text-sm mt-1">Find your next collaboration</p>
        </div>
        <button onClick={() => navigate('/post')} className="btn-primary flex items-center gap-2">
          <span>+</span> Post a Request
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input flex-1"
        />
        <select
          value={dept}
          onChange={e => setDept(e.target.value)}
          className="input w-full sm:w-48"
        >
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
        </select>
      </div>

      {/* Smart match banner */}
      {user?.skills?.length > 0 && (
        <div className="mb-6 bg-royal-500/10 border border-gold-500/30 rounded-xl px-4 py-3 text-sm text-primary-300 flex items-center gap-2">
          <span>✨</span>
          <span>Requests matching your skills (<strong>{user.skills.join(', ')}</strong>) appear first</span>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-royal-400">
          <span className="text-4xl mb-3 block">🔍</span>
          <p className="text-lg font-medium text-royal-500">No requests found</p>
          <p className="text-sm mt-1">Try adjusting your filters or post a new request!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(req => {
            const score = getMatchScore(req);
            return (
              <div key={req._id} className="relative">
                {score > 0 && (
                  <div className="absolute -top-2 -right-2 z-10 bg-primary-500 text-royal-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                    {score} match{score > 1 ? 'es' : ''}
                  </div>
                )}
                <RequestCard request={req} showBookmark />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Browse;
