// Colored tag badge for labels and categories
import PropTypes from 'prop-types';

const variantClasses = {
  sky: 'bg-sky-100 text-sky-700',
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  slate: 'bg-slate-100 text-slate-600',
  purple: 'bg-purple-100 text-purple-700',
};

const Badge = ({ children, color = 'slate', className = '' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variantClasses[color] || variantClasses.slate} ${className}`}>
    {children}
  </span>
);

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.oneOf(['sky', 'green', 'amber', 'red', 'slate', 'purple']),
  className: PropTypes.string,
};

export default Badge;
