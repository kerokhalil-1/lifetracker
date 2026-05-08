// Individual task row in the Zoho roadmap
import PropTypes from 'prop-types';
import { ExternalLink, CheckCircle2, Circle } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import { DIFFICULTY_META } from '../../data/zohoRoadmap.js';

const TaskItem = ({ task, done, onToggle }) => {
  const diff = DIFFICULTY_META[task.difficulty] || DIFFICULTY_META.medium;

  return (
    <div
      className={`group flex items-start gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer select-none ${
        done
          ? 'bg-green-50 border-green-200 opacity-80'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
      onClick={() => onToggle(task.id)}
      role="checkbox"
      aria-checked={done}
      tabIndex={0}
      data-perf-label={`${done ? 'Uncheck' : 'Check'} task: ${task.title}`}
      onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && onToggle(task.id)}
    >
      {/* Checkbox icon */}
      <span className="mt-0.5 flex-shrink-0">
        {done
          ? <CheckCircle2 size={18} className="text-green-500" />
          : <Circle size={18} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
        }
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-medium ${done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
            {task.title}
          </span>
          <Badge color={diff.color}>{diff.label}</Badge>
        </div>
        {task.description && (
          <p className={`text-xs mt-0.5 leading-relaxed ${done ? 'text-slate-400' : 'text-slate-500'}`}>
            {task.description}
          </p>
        )}
      </div>

      {/* External link if present */}
      {task.url && (
        <a
          href={task.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0 mt-0.5 text-slate-400 hover:text-sky-500 transition-colors"
          aria-label="Open resource"
        >
          <ExternalLink size={14} />
        </a>
      )}
    </div>
  );
};

TaskItem.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    difficulty: PropTypes.oneOf(['easy', 'medium', 'hard']).isRequired,
    url: PropTypes.string,
  }).isRequired,
  done: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default TaskItem;
