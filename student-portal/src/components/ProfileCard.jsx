import { Link } from 'react-router-dom';
import SkillTag from './SkillTag';

const ProfileCard = ({ user }) => {
  if (!user) return null;

  return (
    <div className="card p-4 flex items-center gap-4">
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-gold-500 flex-shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-royal-600 to-royal-800 flex items-center justify-center text-gold-500 text-xl font-bold flex-shrink-0">
          {user.name?.[0]?.toUpperCase()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <Link to={`/profile/${user._id}`} className="text-royal-900 font-semibold hover:text-royal-600 transition-colors">
          {user.name}
        </Link>
        <p className="text-xs text-royal-500 mt-0.5">
          {user.department && `${user.department}`}{user.year && ` · Year ${user.year}`}
        </p>
        {user.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {user.skills.slice(0, 3).map((skill) => (
              <SkillTag key={skill} label={skill} />
            ))}
            {user.skills.length > 3 && (
              <span className="text-xs text-royal-400">+{user.skills.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
