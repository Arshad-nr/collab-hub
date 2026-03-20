import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'MBA', 'MCA', 'IT', 'CHEM', 'BIO'];

const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', password: '', department: 'CSE', year: 1, skills: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register({
          ...form,
          year: Number(form.year),
          skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        });
      } else {
        await login(form.email, form.password);
      }
      navigate('/browse');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cream-100 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-royal-600 to-royal-800 shadow-2xl mb-4">
            <span className="text-royal-900 text-3xl font-black">C</span>
          </div>
          <h1 className="text-3xl font-bold text-royal-900">Collab Hub</h1>
          <p className="text-royal-500 mt-1 text-sm">Inter-Department Collaboration Platform</p>
        </div>

        <div className="card p-8">
          {/* Toggle */}
          <div className="flex rounded-lg bg-cream-200 p-1 mb-6">
            <button
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${!isRegister ? 'bg-primary-600 text-royal-900 shadow' : 'text-royal-500 hover:text-royal-900'}`}
            >Login</button>
            <button
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${isRegister ? 'bg-primary-600 text-royal-900 shadow' : 'text-royal-500 hover:text-royal-900'}`}
            >Register</button>
          </div>

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="label">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} required className="input" placeholder="Your full name" />
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required className="input" placeholder="you@college.edu" />
            </div>

            <div>
              <label className="label">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required className="input" placeholder="••••••••" />
            </div>

            {isRegister && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Department</label>
                    <select name="department" value={form.department} onChange={handleChange} className="input">
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Year</label>
                    <select name="year" value={form.year} onChange={handleChange} className="input">
                      {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Skills <span className="text-gold-500">(comma-separated)</span></label>
                  <input name="skills" value={form.skills} onChange={handleChange} className="input" placeholder="React, Node.js, Python..." />
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isRegister ? 'Creating account...' : 'Logging in...'}
                </span>
              ) : isRegister ? 'Create Account' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
