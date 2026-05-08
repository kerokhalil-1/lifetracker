// Compact task checklist shown during an active study session
import PropTypes from 'prop-types';
import { CheckCircle2, Circle, ListTodo } from 'lucide-react';

const SessionTasksPanel = ({ tasks, onToggle }) => {
  if (!tasks || tasks.length === 0) return null;

  const done  = tasks.filter((t) => t.done).length;
  const total = tasks.length;

  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <ListTodo size={13} /> Today&apos;s Tasks
        </span>
        <span className="text-xs text-slate-400 tabular-nums">{done}/{total} done</span>
      </div>

      <div className="flex flex-col gap-1.5">
        {tasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => onToggle(task.id, !task.done)}
            className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors w-full ${
              task.done
                ? 'bg-green-50 hover:bg-green-100'
                : 'bg-slate-50 hover:bg-slate-100'
            }`}
          >
            {task.done
              ? <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
              : <Circle size={15} className="text-slate-300 group-hover:text-slate-400 flex-shrink-0 transition-colors" />
            }
            <span className={`text-sm flex-1 truncate ${task.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
              {task.title}
            </span>
            {task.subject && (
              <span className="text-xs text-slate-400 flex-shrink-0 hidden sm:block">{task.subject}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

SessionTasksPanel.propTypes = {
  tasks:    PropTypes.arrayOf(PropTypes.shape({
    id:      PropTypes.string.isRequired,
    title:   PropTypes.string.isRequired,
    subject: PropTypes.string,
    done:    PropTypes.bool.isRequired,
  })).isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default SessionTasksPanel;
