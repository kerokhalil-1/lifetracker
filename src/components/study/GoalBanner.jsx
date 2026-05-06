// Daily study goal progress bar — shows today's total vs the target
import PropTypes from 'prop-types';
import { Target } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar.jsx';
import { secondsToMinutes, formatDurationSec } from '../../utils/sessionUtils.js';
import { DEFAULTS } from '../../constants/defaults.js';
import en from '../../locales/en.js';

const GoalBanner = ({ todayWorkSeconds, activeSessionSeconds = 0 }) => {
  const goal = DEFAULTS.DAILY_STUDY_GOAL_MINUTES;
  const doneMinutes = secondsToMinutes(todayWorkSeconds + activeSessionSeconds);
  const reached = doneMinutes >= goal; // bug #18: removed unused pct variable (ProgressBar computes it internally)

  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium text-slate-600">
          <Target size={14} className="text-sky-500" />
          {en.study.dailyGoal}: {goal}m
        </span>
        {reached ? (
          <span className="text-green-600 font-semibold">{en.study.goalReached}</span>
        ) : (
          <span className="text-slate-500">
            {formatDurationSec(todayWorkSeconds + activeSessionSeconds)} {en.study.todayStudied}
          </span>
        )}
      </div>
      <ProgressBar value={doneMinutes} max={goal} showLabel={false} color={reached ? 'green' : 'sky'} />
    </div>
  );
};

GoalBanner.propTypes = {
  todayWorkSeconds: PropTypes.number.isRequired,
  activeSessionSeconds: PropTypes.number,
};

export default GoalBanner;
