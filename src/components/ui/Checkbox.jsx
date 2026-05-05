// Checkbox with an accessible label
import PropTypes from 'prop-types';

const Checkbox = ({ checked, onChange, label, id, disabled = false, className = '' }) => {
  const checkId = id || `cb-${label?.replace(/\s+/g, '-')}`;

  return (
    <label htmlFor={checkId} className={`flex items-center gap-2.5 cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        id={checkId}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
      <span className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors flex-shrink-0 ${checked ? 'bg-sky-600 border-sky-600' : 'border-slate-300 group-hover:border-sky-400'}`}>
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      {label && (
        <span className={`text-sm ${checked ? 'line-through text-slate-400' : 'text-slate-700'}`}>
          {label}
        </span>
      )}
    </label>
  );
};

Checkbox.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  id: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Checkbox;
