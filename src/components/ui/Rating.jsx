// 1–5 dot/star rating selector
import PropTypes from 'prop-types';

const Rating = ({ value, onChange, max = 5, label, readOnly = false }) => (
  <div className="flex flex-col gap-1">
    {label && <span className="text-xs font-medium text-slate-600">{label}</span>}
    <div className="flex gap-1.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange(n)}
          className={`w-7 h-7 rounded-full border-2 transition-colors focus:outline-none ${
            n <= value
              ? 'bg-sky-500 border-sky-500'
              : 'bg-white border-slate-300 hover:border-sky-400'
          } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
          aria-label={`${n} of ${max}`}
        />
      ))}
    </div>
  </div>
);

Rating.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func,
  max: PropTypes.number,
  label: PropTypes.string,
  readOnly: PropTypes.bool,
};

export default Rating;
