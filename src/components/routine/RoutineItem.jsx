// Single routine checklist item with toggle support
import PropTypes from 'prop-types';
import Checkbox from '../ui/Checkbox.jsx';

const RoutineItem = ({ item, onToggle }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
    <Checkbox
      checked={item.done}
      onChange={(e) => onToggle(item.id, e.target.checked)}
      label={item.title}
      id={`ri-${item.id}`}
    />
  </div>
);

RoutineItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    done: PropTypes.bool.isRequired,
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default RoutineItem;
