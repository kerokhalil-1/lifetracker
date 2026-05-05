// Reusable card container with optional header, footer, and shadow
import PropTypes from 'prop-types';

const Card = ({ children, header, footer, shadow = true, className = '', padding = true }) => (
  <div className={`bg-white rounded-xl border border-slate-200 ${shadow ? 'shadow-sm' : ''} ${className}`}>
    {header && (
      <div className="px-5 py-3.5 border-b border-slate-100 font-medium text-slate-700 text-sm">
        {header}
      </div>
    )}
    <div className={padding ? 'p-5' : ''}>
      {children}
    </div>
    {footer && (
      <div className="px-5 py-3 border-t border-slate-100 text-sm text-slate-500">
        {footer}
      </div>
    )}
  </div>
);

Card.propTypes = {
  children: PropTypes.node.isRequired,
  header: PropTypes.node,
  footer: PropTypes.node,
  shadow: PropTypes.bool,
  className: PropTypes.string,
  padding: PropTypes.bool,
};

export default Card;
