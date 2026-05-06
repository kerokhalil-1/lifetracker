// GitHub-style heatmap grid for monthly routine consistency
import PropTypes from 'prop-types';
import { formatDisplay } from '../../utils/dateUtils.js'; // bug #15: merged duplicate imports, removed unused formatDayAbbr

const MonthlyChart = ({ data }) => (
  <div className="flex flex-wrap gap-1">
    {data.map(({ day, score }) => {
      const bg = score === null
        ? 'bg-slate-100'
        : score >= 80
        ? 'bg-green-400'
        : score >= 50
        ? 'bg-amber-400'
        : score > 0
        ? 'bg-red-400'
        : 'bg-slate-200';

      return (
        <div
          key={day}
          title={`${formatDisplay(day)}: ${score !== null ? score + '%' : 'no data'}`}
          className={`w-6 h-6 rounded-sm ${bg} cursor-default`}
        />
      );
    })}
  </div>
);

MonthlyChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    day: PropTypes.string.isRequired,
    score: PropTypes.number,
  })).isRequired,
};

export default MonthlyChart;
