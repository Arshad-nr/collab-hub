import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import SkillTag from '../components/SkillTag';
import RequestCard from '../components/RequestCard';

const DEPARTMENTS = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'MBA', 'MCA', 'IT', 'CHEM'];

const Profile = () => {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [editForm, setEditForm] = useState({});

  const isOwn = id === user?._id;
  const [avatarLoading, setAvatarLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get(`/profile/${id}`);
      setProfileData(data.user);
      setProjects(data.projects || []);
      setEditForm({
        name: data.user.name || '',
        bio: data.user.bio || '',
        skills: data.user.skills?.join(', ') || '',
        department: data.user.department || 'CSE',
        year: data.user.year || 1,
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, [id]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await api.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfileData(prev => ({ ...prev, avatar: data.avatar }));
      updateUser({ avatar: data.avatar });
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const { data } = await api.put('/profile', {
        ...editForm,
        year: Number(editForm.year),
        skills: editForm.skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      setProfileData(data.user);
      updateUser(data.user);
      setEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleEndorse = async (skill) => {
    try {
      const { data } = await api.post(`/profile/${id}/endorse`, { skill });
      setProfileData(prev => ({ ...prev, endorsements: data.endorsements }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to endorse.');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profileData) return <div className="text-center py-24 text-red-400">User not found.</div>;

  const getEndorsementCount = (skill) => {
    return profileData.endorsements?.find(e => e.skill === skill)?.count || 0;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <button onClick={() => navigate(-1)} className="text-royal-500 hover:text-royal-900 text-sm flex items-center gap-1 transition-colors">← Back</button>

      {/* Profile Card */}
      <div className="card p-6">
        <div className="flex items-start gap-6 flex-wrap">
          {/* Avatar */}
          <div className="flex-shrink-0 relative">
            {profileData.avatar ? (
              <img src={profileData.avatar} alt={profileData.name} className="w-24 h-24 rounded-2xl object-cover ring-4 ring-gold-500/40" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-royal-600 to-royal-800 flex items-center justify-center text-gold-500 text-4xl font-bold">
                {profileData.name?.[0]?.toUpperCase()}
              </div>
            )}
            {/* Upload overlay — only for own profile */}
            {isOwn && (
              <label
                className="absolute inset-0 flex items-center justify-center rounded-2xl cursor-pointer bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
                title="Change photo"
              >
                {avatarLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-white text-xs font-semibold">📷 Change</span>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {!editing ? (
              <>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-royal-900">{profileData.name}</h1>
                  {isOwn && (
                    <button onClick={() => setEditing(true)} className="btn-secondary text-xs py-1 px-3">Edit Profile</button>
                  )}
                </div>
                <p className="text-royal-500 text-sm mt-1">
                  {profileData.department && <span>{profileData.department}</span>}
                  {profileData.year && <span> · Year {profileData.year}</span>}
                </p>
                {profileData.bio && <p className="text-royal-600 text-sm mt-3 leading-relaxed">{profileData.bio}</p>}
              </>
            ) : (
              <form onSubmit={handleSave} className="space-y-3 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Name</label>
                    <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="input text-sm" required />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label">Dept</label>
                      <select value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} className="input text-sm">
                        {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Year</label>
                      <select value={editForm.year} onChange={e => setEditForm({...editForm, year: e.target.value})} className="input text-sm">
                        {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="label">Bio</label>
                  <textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} rows={2} className="input text-sm resize-none" placeholder="Tell others about yourself..." />
                </div>
                <div>
                  <label className="label">Skills (comma-separated)</label>
                  <input value={editForm.skills} onChange={e => setEditForm({...editForm, skills: e.target.value})} className="input text-sm" placeholder="React, Python, IoT..." />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={saveLoading} className="btn-primary text-sm py-2">
                    {saveLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="btn-secondary text-sm py-2">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Skills + Endorsements */}
        {profileData.skills?.length > 0 && !editing && (
          <div className="mt-6 border-t border-gold-300 pt-4">
            <h3 className="text-royal-900 font-medium text-sm mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profileData.skills.map(skill => (
                <div key={skill} className="flex items-center gap-1.5 bg-cream-200 rounded-lg px-3 py-1.5 border border-gold-300">
                  <SkillTag label={skill} />
                  {getEndorsementCount(skill) > 0 && (
                    <span className="text-xs text-yellow-400 font-semibold">+{getEndorsementCount(skill)}</span>
                  )}
                  {!isOwn && (
                    <button
                      onClick={() => handleEndorse(skill)}
                      className="text-xs text-royal-400 hover:text-royal-600 transition-colors ml-1"
                      title={`Endorse ${skill}`}
                    >
                      👍
                    </button>
                  )}
                </div>
              ))}
            </div>
            {!isOwn && <p className="text-xs text-gold-500 mt-2">Click 👍 to endorse a skill</p>}
          </div>
        )}
      </div>

      {/* Posted Projects */}
      {projects.length > 0 && (
        <div>
          <h2 className="text-royal-900 font-semibold text-lg mb-4">Projects Posted</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map(req => <RequestCard key={req._id} request={req} showBookmark={!!user && !isOwn} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
