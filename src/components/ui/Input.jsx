// Reusable input supporting text, number, time, and textarea types
import PropTypes from 'prop-types';

const baseClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition';

const Input = ({ type = 'text', value, onChange, placeholder, label, id, min, max, rows, disabled = false, className = '' }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-600">
          {label}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          id={inputId}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows || 3}
          disabled={disabled}
          className={`${baseClass} resize-none ${className}`}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          max={max}
          disabled={disabled}
          className={`${baseClass} ${className}`}
        />
      )}
    </div>
  );
};

Input.propTypes = {
  type: PropTypes.oneOf(['text', 'number', 'time', 'date', 'textarea']),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  id: PropTypes.string,
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rows: PropTypes.number,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Input;
