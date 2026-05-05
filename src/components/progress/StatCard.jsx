// A small stat display card with label, value, and optional icon
import PropTypes from 'prop-types';
import Card from '../ui/Card.jsx';

const StatCard = ({ label, value, sub, icon: Icon, color = 'sky' }) => {
  const colorMap = {
    sky: 'text-sky-600 bg-sky-50',
    green: 'text-green-600 bg-green-50',
    amber: 'text-amber-600 bg-amber-50',
    purple: 'text-purple-600 bg-purple-50',
  };

  return (
    <Card className="flex-1 min-w-0">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={`p-2 rounded-lg ${colorMap[color]}`}>
            <Icon size={18} />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs text-slate-500 truncate">{label}</p>
          <p className="text-xl font-bold text-slate-800">{value ?? '—'}</p>
          {sub && <p className="text-xs text-slate-400">{sub}</p>}
        </div>
      </div>
    </Card>
  );
};

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sub: PropTypes.string,
  icon: PropTypes.elementType,
  color: PropTypes.oneOf(['sky', 'green', 'amber', 'purple']),
};

export default StatCard;
