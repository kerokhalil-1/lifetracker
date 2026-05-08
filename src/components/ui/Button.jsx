// Reusable button with primary, secondary, ghost, and danger variants
import PropTypes from 'prop-types';

const variantClasses = {
  primary:   'bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400',
  ghost:     'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400',
  danger:    'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

// ...rest forwards data-perf-label, aria-*, and any other HTML attrs to the <button>
const Button = ({ children, variant = 'primary', size = 'md', disabled = false, onClick, type = 'button', className = '', ...rest }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    {...rest}
  >
    {children}
  </button>
);

Button.propTypes = {
  children:  PropTypes.node.isRequired,
  variant:   PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger']),
  size:      PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled:  PropTypes.bool,
  onClick:   PropTypes.func,
  type:      PropTypes.string,
  className: PropTypes.string,
};

export default Button;
