import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';

const DEPARTMENTS = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'MBA', 'MCA', 'IT', 'CHEM'];

const PostRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    skillsNeeded: '',
    deptPreferred: '',
    teamSize: 3,
    deadline: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/requests', {
        ...form,
        teamSize: Number(form.teamSize),
        skillsNeeded: form.skillsNeeded.split(',').map(s => s.trim()).filter(Boolean),
      });
      navigate('/board');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <button onClick={() => navigate(-1)} className="text-royal-500 hover:text-royal-900 text-sm mb-4 flex items-center gap-1 transition-colors">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-royal-900">Post a Collaboration Request</h1>
        <p className="text-royal-500 text-sm mt-1">Let others know what you're building</p>
      </div>

      <div className="card p-6">
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Project Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required className="input" placeholder="Smart Irrigation System using IoT..." />
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={4} className="input resize-none" placeholder="Describe what you're building, what help you need, and any relevant details..." />
          </div>

          <div>
            <label className="label">Skills Needed * <span className="text-gold-500">(comma-separated)</span></label>
            <input name="skillsNeeded" value={form.skillsNeeded} onChange={handleChange} required className="input" placeholder="React, IoT, Circuit Design, Python..." />
            {form.skillsNeeded && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.skillsNeeded.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                  <span key={s} className="bg-primary-500/20 text-primary-300 text-xs px-2 py-0.5 rounded-full border border-gold-500/30">{s}</span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Preferred Department</label>
              <select name="deptPreferred" value={form.deptPreferred} onChange={handleChange} className="input">
                <option value="">Any</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Team Size *</label>
              <input type="number" name="teamSize" value={form.teamSize} onChange={handleChange} min={2} max={10} required className="input" />
            </div>
            <div>
              <label className="label">Deadline *</label>
              <input type="date" name="deadline" value={form.deadline} onChange={handleChange} required className="input" min={new Date().toISOString().split('T')[0]} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Posting...
              </span>
            ) : '🚀 Post Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostRequest;
