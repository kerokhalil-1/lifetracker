// Displays the overall routine completion score with a progress bar
import PropTypes from 'prop-types';
import ProgressBar from '../ui/ProgressBar.jsx';
import en from '../../locales/en.js';

const RoutineScore = ({ score }) => {
  const color = score >= 80 ? 'green' : score >= 50 ? 'amber' : 'red';
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">{en.routine.score}</span>
        <span className={`text-2xl font-bold ${score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
          {score}%
        </span>
      </div>
      <ProgressBar value={score} color={color} />
    </div>
  );
};

RoutineScore.propTypes = {
  score: PropTypes.number.isRequired,
};

export default RoutineScore;
