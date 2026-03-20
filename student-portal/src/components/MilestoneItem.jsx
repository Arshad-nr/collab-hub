const MilestoneItem = ({ milestone, onToggle }) => {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer group
        ${milestone.done
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : 'bg-cream-200 border-gold-300 hover:border-gold-500/30'
        }`}
      onClick={() => onToggle?.(milestone._id)}
    >
      {/* Custom checkbox */}
      <div className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-all
        ${milestone.done
          ? 'bg-emerald-500 border-emerald-500'
          : 'border-gray-500 group-hover:border-gold-500'
        }`}>
        {milestone.done && <span className="text-royal-900 text-xs">✓</span>}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium transition-all ${milestone.done ? 'line-through text-royal-400' : 'text-royal-700'}`}>
          {milestone.title}
        </p>
        {milestone.dueDate && (
          <p className="text-xs text-royal-400 mt-0.5">
            Due: {new Date(milestone.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </p>
        )}
      </div>

      {milestone.done && (
        <span className="text-xs text-emerald-400 font-medium">Done</span>
      )}
    </div>
  );
};

export default MilestoneItem;
