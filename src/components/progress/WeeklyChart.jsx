// Bar chart of routine completion % over the current week using Recharts
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatDayAbbr } from '../../utils/dateUtils.js';

const WeeklyChart = ({ data }) => {
  const chartData = data.map(({ day, score }) => ({
    day: formatDayAbbr(day),
    score,
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={chartData} barSize={28}>
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
        <Tooltip formatter={(v) => [`${v}%`, 'Score']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.score >= 80 ? '#22c55e' : entry.score >= 50 ? '#f59e0b' : entry.score > 0 ? '#ef4444' : '#e2e8f0'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

WeeklyChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    day: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
  })).isRequired,
};

export default WeeklyChart;
