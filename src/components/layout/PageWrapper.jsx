// Consistent page container with padding and max-width
import PropTypes from 'prop-types';

const PageWrapper = ({ children, title }) => (
  <main className="lg:ml-56 min-h-screen bg-slate-50 pb-20 lg:pb-8">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {title && (
        <h1 className="text-2xl font-bold text-slate-800 mb-6">{title}</h1>
      )}
      {children}
    </div>
  </main>
);

PageWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
};

export default PageWrapper;
