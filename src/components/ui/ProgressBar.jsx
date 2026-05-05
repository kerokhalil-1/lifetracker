// Horizontal progress bar with optional percentage label
import PropTypes from 'prop-types';

const colorClass = {
  sky: 'bg-sky-500',
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
};

const ProgressBar = ({ value, max = 100, showLabel = true, color = 'sky', className = '' }) => {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass[color] || colorClass.sky}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <span className="text-xs font-medium text-slate-500 w-9 text-right">{pct}%</span>}
    </div>
  );
};

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number,
  showLabel: PropTypes.bool,
  color: PropTypes.oneOf(['sky', 'green', 'amber', 'red']),
  className: PropTypes.string,
};

export default ProgressBar;
