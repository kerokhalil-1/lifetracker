// Tab switcher component — horizontal scroll on mobile so labels never wrap
import PropTypes from 'prop-types';

const Tabs = ({ tabs, activeTab, onChange }) => (
  <div className="flex gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto scrollbar-none">
    {tabs.map((tab) => (
      <button
        key={tab.value}
        type="button"
        onClick={() => onChange(tab.value)}
        data-perf-label={`Tab: ${tab.label}`}
        className={`flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all focus:outline-none whitespace-nowrap ${
          activeTab === tab.value
            ? 'bg-white text-slate-800 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  activeTab: PropTypes.string.isRequired,
  onChange:  PropTypes.func.isRequired,
};

export default Tabs;
