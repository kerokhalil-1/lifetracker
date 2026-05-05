// Displays the current study streak with a flame icon
import PropTypes from 'prop-types';
import { Flame } from 'lucide-react';
import en from '../../locales/en.js';

const StreakWidget = ({ streak }) => (
  <div className="flex items-center gap-2">
    <Flame size={20} className={streak > 0 ? 'text-orange-500' : 'text-slate-300'} />
    <span className="text-2xl font-bold text-slate-800">{streak}</span>
    <span className="text-sm text-slate-500">{en.common.days} streak</span>
  </div>
);

StreakWidget.propTypes = {
  streak: PropTypes.number.isRequired,
};

export default StreakWidget;
