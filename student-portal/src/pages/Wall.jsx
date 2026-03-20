import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import SkillTag from '../components/SkillTag';

const Wall = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWall = async () => {
      try {
        const { data } = await api.get('/wall');
        setProjects(data);
      } catch (err) {
        console.error('Failed to load wall:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWall();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <div className="text-center mb-12 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-primary-600/20 blur-3xl rounded-full pointer-events-none" />
        <h1 className="text-4xl font-black text-royal-900 relative">
          Project <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">Showcase Wall</span>
        </h1>
        <p className="text-royal-500 mt-3 text-lg">Completed projects by our student community</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-24">
          <span className="text-5xl block mb-4">🏗️</span>
          <p className="text-royal-500 text-lg font-medium">No published projects yet</p>
          <p className="text-gold-500 text-sm mt-2">Complete a project and publish it to see it here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map(project => (
            <Link
              key={project._id}
              to={`/project/${project._id}`}
              className="card p-6 hover:border-gold-500 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 group block"
            >
              {/* Status badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="badge-completed">✅ Completed</span>
                <span className="text-xs text-gold-500">
                  {new Date(project.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-royal-900 font-bold text-lg leading-snug mb-2 group-hover:text-primary-300 transition-colors">
                {project.title}
              </h3>

              {/* Outcome */}
              {project.publishedOutcome && (
                <p className="text-royal-500 text-sm leading-relaxed mb-4 line-clamp-3">
                  {project.publishedOutcome}
                </p>
              )}

              {/* Skills */}
              <div className="flex flex-wrap gap-1 mb-4">
                {project.skillsNeeded?.slice(0, 4).map(s => <SkillTag key={s} label={s} />)}
              </div>

              {/* Team Members */}
              {project.acceptedMembers?.length > 0 && (
                <div className="border-t border-gold-300 pt-4">
                  <p className="text-xs text-royal-400 mb-2">Team</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[project.postedBy, ...project.acceptedMembers].filter(Boolean).map((m, i) => (
                      <div key={m._id} className="flex items-center gap-1.5" style={{ zIndex: 10 - i }}>
                        {m.avatar ? (
                          <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover ring-2 ring-cream-50 -ml-2 first:ml-0" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-royal-600 to-royal-800 flex items-center justify-center text-gold-500 text-xs font-bold ring-2 ring-cream-50 -ml-2 first:ml-0">
                            {m.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                    ))}
                    <span className="text-xs text-royal-400 ml-2">
                      {[project.postedBy, ...project.acceptedMembers].filter(Boolean).map(m => m.name).join(', ')}
                    </span>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wall;
