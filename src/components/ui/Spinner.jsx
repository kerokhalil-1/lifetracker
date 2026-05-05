// Loading spinner indicator
import PropTypes from 'prop-types';
import en from '../../locales/en.js';

const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} border-2 border-slate-200 border-t-sky-500 rounded-full animate-spin`}
        role="status"
        aria-label={en.common.loading}
      />
    </div>
  );
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default Spinner;
