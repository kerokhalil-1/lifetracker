// Live timer display — shows work clock, break clock, and session stats
import PropTypes from 'prop-types';
import { BookOpen } from 'lucide-react';
import { formatClock, formatDurationSec } from '../../utils/sessionUtils.js';
import en from '../../locales/en.js';

const StatPill = ({ label, value }) => (
  <div className="flex flex-col items-center px-4 py-2 bg-slate-50 rounded-xl">
    <span className="text-lg font-bold text-slate-800">{value}</span>
    <span className="text-xs text-slate-400 mt-0.5">{label}</span>
  </div>
);

StatPill.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

const SessionTimer = ({ session, elapsedWork, elapsedBreak, status }) => {
  const isPaused = status === 'paused';
  const totalBreakSeconds = (session?.totalBreakSeconds || 0) + (isPaused ? elapsedBreak : 0);
  const pauseCount = session?.pauseCount || 0;

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Course name */}
      <div className="flex items-center gap-2 text-slate-500">
        <BookOpen size={16} />
        <span className="text-sm font-medium">{session?.courseName}</span>
      </div>

      {/* Main clock */}
      <div className="flex flex-col items-center">
        <div
          className={`text-6xl font-mono font-bold tabular-nums transition-colors ${
            isPaused ? 'text-amber-500' : 'text-sky-600'
          }`}
        >
          {formatClock(elapsedWork)}
        </div>
        <span className={`text-xs font-semibold uppercase tracking-widest mt-2 ${isPaused ? 'text-amber-400' : 'text-sky-400'}`}>
          {isPaused ? en.study.sessionPaused : en.study.sessionRunning}
        </span>
      </div>

      {/* Break clock — only shown while paused */}
      {isPaused && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
          <span className="text-xs text-amber-600 font-medium">{en.study.currentBreak}</span>
          <span className="text-sm font-mono font-bold text-amber-700">{formatClock(elapsedBreak)}</span>
        </div>
      )}

      {/* Session stat pills */}
      <div className="flex gap-3 flex-wrap justify-center">
        <StatPill label={en.study.breakTime} value={formatDurationSec(totalBreakSeconds)} />
        <StatPill label={en.study.pauseCount} value={String(isPaused ? pauseCount + 1 : pauseCount)} />
        <StatPill
          label={en.study.workTime}
          value={formatDurationSec(elapsedWork)}
        />
      </div>
    </div>
  );
};

SessionTimer.propTypes = {
  session: PropTypes.shape({
    courseName: PropTypes.string,
    pauseCount: PropTypes.number,
    totalBreakSeconds: PropTypes.number,
  }),
  elapsedWork: PropTypes.number.isRequired,
  elapsedBreak: PropTypes.number.isRequired,
  status: PropTypes.oneOf(['running', 'paused', 'finishing']).isRequired,
};

export default SessionTimer;
