// Tab switcher component
import PropTypes from 'prop-types';

const Tabs = ({ tabs, activeTab, onChange }) => (
  <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
    {tabs.map((tab) => (
      <button
        key={tab.value}
        type="button"
        onClick={() => onChange(tab.value)}
        data-perf-label={`Tab: ${tab.label}`}
        className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all focus:outline-none ${
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
  onChange: PropTypes.func.isRequired,
};

export default Tabs;
