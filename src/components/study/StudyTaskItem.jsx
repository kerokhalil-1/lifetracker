// Single study task row with checkbox, subject badge, and delete button
import PropTypes from 'prop-types';
import { Trash2 } from 'lucide-react';
import Checkbox from '../ui/Checkbox.jsx';
import Badge from '../ui/Badge.jsx';

const StudyTaskItem = ({ task, onToggle, onDelete }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
    <Checkbox
      checked={task.done}
      onChange={(e) => onToggle(task.id, e.target.checked)}
      label={task.title}
      id={`task-${task.id}`}
    />
    {task.subject && <Badge color="sky">{task.subject}</Badge>}
    {task.estimatedMinutes > 0 && (
      <span className="text-xs text-slate-400 ml-auto">{task.estimatedMinutes} min</span>
    )}
    <button
      onClick={() => onDelete(task.id)}
      className="p-1 text-slate-300 hover:text-red-400 transition-colors ml-1 flex-shrink-0"
      aria-label="Delete task"
    >
      <Trash2 size={14} />
    </button>
  </div>
);

StudyTaskItem.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    done: PropTypes.bool.isRequired,
    subject: PropTypes.string,
    estimatedMinutes: PropTypes.number,
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default StudyTaskItem;
