import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import SkillTag from '../components/SkillTag';
import MilestoneItem from '../components/MilestoneItem';
import TeamChat from '../components/TeamChat';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Milestone form
  const [mForm, setMForm] = useState({ title: '', dueDate: '' });
  const [mLoading, setMLoading] = useState(false);

  // Publish form
  const [outcome, setOutcome] = useState('');
  const [publishing, setPublishing] = useState(false);

  // Status update
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/requests/${id}`);
      setProject(data);
    } catch {
      setError('Failed to load project.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProject(); }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !project) return (
    <div className="text-center py-24 text-red-400">{error || 'Project not found.'}</div>
  );

  const isPoster = project.postedBy?._id === user?._id;
  const isMember = project.acceptedMembers?.some(m => m._id === user?._id);
  const canSeeTeamSection = isPoster || isMember;

  const totalMilestones = project.milestones?.length || 0;
  const doneMilestones = project.milestones?.filter(m => m.done).length || 0;
  const progress = totalMilestones > 0 ? Math.round((doneMilestones / totalMilestones) * 100) : 0;

  const handleAccept = async (userId) => {
    try {
      await api.put(`/requests/${id}/accept/${userId}`);
      fetchProject();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleReject = async (userId) => {
    try {
      await api.put(`/requests/${id}/reject/${userId}`);
      fetchProject();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleMilestoneToggle = async (mid) => {
    try {
      await api.put(`/requests/${id}/milestones/${mid}`);
      fetchProject();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    setMLoading(true);
    try {
      await api.post(`/requests/${id}/milestones`, mForm);
      setMForm({ title: '', dueDate: '' });
      fetchProject();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
    finally { setMLoading(false); }
  };

  const handleStatusUpdate = async () => {
    const next = { open: 'in-progress', 'in-progress': 'completed' };
    const newStatus = next[project.status];
    if (!newStatus) return;
    setStatusLoading(true);
    try {
      await api.put(`/requests/${id}/status`, { status: newStatus });
      fetchProject();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
    finally { setStatusLoading(false); }
  };

  const handlePublish = async () => {
    if (!outcome.trim()) return alert('Please enter an outcome.');
    setPublishing(true);
    try {
      await api.put(`/wall/${id}/publish`, { publishedOutcome: outcome });
      fetchProject();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
    finally { setPublishing(false); }
  };

  const statusBadge = { open: 'badge-open', 'in-progress': 'badge-progress', completed: 'badge-completed' };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="text-royal-500 hover:text-royal-900 text-sm flex items-center gap-1 transition-colors">
        ← Back
      </button>

      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-royal-900">{project.title}</h1>
              <span className={statusBadge[project.status]}>{project.status}</span>
              {project.isPublished && <span className="badge-completed">Published</span>}
            </div>
            {project.postedBy && (
              <p className="text-sm text-royal-500">
                by <Link to={`/profile/${project.postedBy._id}`} className="text-royal-600 hover:underline">{project.postedBy.name}</Link>
                {project.postedBy.department && ` · ${project.postedBy.department}`}
              </p>
            )}
          </div>
          {isPoster && project.status !== 'completed' && (
            <button onClick={handleStatusUpdate} disabled={statusLoading} className="btn-secondary text-sm">
              {statusLoading ? '...' : `→ Mark ${project.status === 'open' ? 'In Progress' : 'Completed'}`}
            </button>
          )}
        </div>

        <p className="text-royal-600 leading-relaxed mb-4">{project.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.skillsNeeded?.map(s => <SkillTag key={s} label={s} />)}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-royal-400">
          {project.deptPreferred && <span>🏛️ Preferred: {project.deptPreferred}</span>}
          <span>👥 Team size: {project.teamSize}</span>
          <span>📅 Deadline: {new Date(project.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Team Members */}
      {project.acceptedMembers?.length > 0 && (
        <div className="card p-6">
          <h2 className="text-royal-900 font-semibold text-lg mb-4">Team Members</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[project.postedBy, ...project.acceptedMembers].filter(Boolean).map(m => (
              <Link key={m._id} to={`/profile/${m._id}`} className="flex items-center gap-3 bg-cream-200 rounded-xl p-3 hover:bg-dark-600 transition-colors border border-white/5">
                {m.avatar ? (
                  <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-600 to-royal-800 flex items-center justify-center text-gold-500 font-bold">
                    {m.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-royal-900 text-sm font-medium">{m.name}</p>
                  <p className="text-royal-400 text-xs">{m.department}</p>
                </div>
                {m._id === project.postedBy?._id && <span className="ml-auto text-xs text-royal-600 font-medium">Poster</span>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Interested Users — poster only */}
      {isPoster && project.interestedUsers?.length > 0 && (
        <div className="card p-6">
          <h2 className="text-royal-900 font-semibold text-lg mb-4">
            Interested ({project.interestedUsers.length})
          </h2>
          <div className="space-y-3">
            {project.interestedUsers.map(u => (
              <div key={u._id} className="flex items-center gap-3 bg-cream-200 rounded-xl p-3 border border-white/5">
                {u.avatar ? (
                  <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-royal-600 to-royal-800 flex items-center justify-center text-gold-500 text-sm font-bold">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <Link to={`/profile/${u._id}`} className="text-royal-900 text-sm font-medium hover:text-royal-600 transition-colors">{u.name}</Link>
                  <p className="text-royal-400 text-xs">{u.department} {u.year && `· Year ${u.year}`}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {u.skills?.slice(0, 3).map(s => <SkillTag key={s} label={s} />)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(u._id)} className="btn-primary text-xs py-1.5 px-3">Accept</button>
                  <button onClick={() => handleReject(u._id)} className="btn-danger text-xs py-1.5 px-3">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestones + Chat — team members + poster */}
      {canSeeTeamSection && (
        <>
          {/* Milestones */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-royal-900 font-semibold text-lg">Milestones</h2>
              {totalMilestones > 0 && (
                <span className="text-sm text-royal-500">{doneMilestones}/{totalMilestones} done</span>
              )}
            </div>

            {totalMilestones > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-royal-400 mb-1">
                  <span>Progress</span><span>{progress}%</span>
                </div>
                <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-royal-600 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="space-y-2 mb-4">
              {project.milestones?.length === 0 && (
                <p className="text-royal-400 text-sm text-center py-4">No milestones yet. Add your first one!</p>
              )}
              {project.milestones?.map(m => (
                <MilestoneItem key={m._id} milestone={m} onToggle={handleMilestoneToggle} />
              ))}
            </div>

            {/* Add Milestone Form */}
            <form onSubmit={handleAddMilestone} className="flex gap-2 flex-wrap border-t border-gold-300 pt-4">
              <input
                value={mForm.title}
                onChange={e => setMForm({...mForm, title: e.target.value})}
                placeholder="New milestone title..."
                required
                className="input flex-1 min-w-40 text-sm py-2"
              />
              <input
                type="date"
                value={mForm.dueDate}
                onChange={e => setMForm({...mForm, dueDate: e.target.value})}
                className="input w-40 text-sm py-2"
              />
              <button type="submit" disabled={mLoading} className="btn-primary text-sm py-2 px-4">
                {mLoading ? '...' : '+ Add'}
              </button>
            </form>
          </div>

          {/* Team Chat */}
          <div className="card overflow-hidden">
            <TeamChat projectId={id} currentUser={user} />
          </div>
        </>
      )}

      {/* Publish to Wall — poster + completed */}
      {isPoster && project.status === 'completed' && !project.isPublished && (
        <div className="card p-6 border-gold-500/30">
          <h2 className="text-royal-900 font-semibold text-lg mb-3">🚀 Publish to Wall</h2>
          <p className="text-royal-500 text-sm mb-4">Share your project's outcome with the community.</p>
          <textarea
            value={outcome}
            onChange={e => setOutcome(e.target.value)}
            placeholder="Describe what you built, the impact, and anything you learned..."
            rows={3}
            className="input resize-none mb-3"
          />
          <button onClick={handlePublish} disabled={publishing} className="btn-primary">
            {publishing ? 'Publishing...' : '🌟 Publish Project'}
          </button>
        </div>
      )}
      {project.isPublished && (
        <div className="card p-6 border-emerald-500/30 bg-emerald-500/5">
          <h2 className="text-emerald-400 font-semibold text-lg mb-2">✅ Published on Wall</h2>
          <p className="text-royal-600 text-sm">{project.publishedOutcome}</p>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
