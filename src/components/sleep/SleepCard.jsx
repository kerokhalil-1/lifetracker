// Color-coded card showing a single night's sleep summary
import PropTypes from 'prop-types';
import { formatDisplay } from '../../utils/dateUtils.js';
import { formatDuration } from '../../utils/timeUtils.js';
import Rating from '../ui/Rating.jsx';

const SleepCard = ({ log }) => {
  const statusColor = log.hitTarget
    ? 'bg-green-50 border-green-200'
    : log.totalHours >= (log.targetHours || 7)
    ? 'bg-amber-50 border-amber-200'
    : 'bg-red-50 border-red-200';

  return (
    <div className={`rounded-xl border p-4 ${statusColor}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-700">{formatDisplay(log.date)}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${log.hitTarget ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {log.hitTarget ? 'Hit target' : 'Missed'}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-slate-600">
        <span>{log.sleepTime} → {log.wakeTime}</span>
        <span className="font-medium">{formatDuration(log.totalHours)}</span>
      </div>
      <div className="flex gap-4 mt-2">
        <Rating value={log.quality || 0} max={5} readOnly />
        <Rating value={log.morningEnergy || 0} max={5} readOnly />
      </div>
    </div>
  );
};

SleepCard.propTypes = {
  log: PropTypes.shape({
    date: PropTypes.string.isRequired,
    sleepTime: PropTypes.string,
    wakeTime: PropTypes.string,
    totalHours: PropTypes.number,
    quality: PropTypes.number,
    morningEnergy: PropTypes.number,
    hitTarget: PropTypes.bool,
    targetHours: PropTypes.number,
  }).isRequired,
};

export default SleepCard;
