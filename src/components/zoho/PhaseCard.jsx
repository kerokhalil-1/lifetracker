// Collapsible phase section card for the Zoho roadmap
import { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, ChevronUp, ExternalLink, Pencil, Check, Trophy } from 'lucide-react';
import Card from '../ui/Card.jsx';
import ProgressBar from '../ui/ProgressBar.jsx';
import TaskItem from './TaskItem.jsx';
import { PHASE_COLOR_META } from '../../data/zohoRoadmap.js';

const PhaseCard = ({ phase, phaseIndex, phaseStat, isCollapsed, onToggleCollapsed, isTaskDone, onToggleTask, note, onSetNote }) => {
  const [editingNote, setEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState(note);
  const colors = PHASE_COLOR_META[phase.color] || PHASE_COLOR_META.sky;
  const isComplete = phaseStat.done === phaseStat.total;

  const handleSaveNote = () => {
    onSetNote(phase.id, noteValue);
    setEditingNote(false);
  };

  return (
    <div id={phase.id} className="scroll-mt-4">
    <Card
      padding={false}
      className={`border-2 transition-all ${
        isComplete ? 'border-green-300' : colors.border
      }`}
    >
      {/* Phase header — click to collapse */}
      <button
        type="button"
        className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors rounded-t-xl ${colors.bg}`}
        onClick={() => onToggleCollapsed(phase.id)}
        aria-expanded={!isCollapsed}
        aria-controls={`phase-body-${phase.id}`}
      >
        {/* Phase icon + number */}
        <span className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg ${colors.icon}`}>
          {isComplete ? '✅' : phase.icon}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Phase {phaseIndex + 1}
            </span>
            {isComplete && (
              <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                <Trophy size={11} /> Complete
              </span>
            )}
          </div>
          <h3 className={`text-base font-bold ${colors.text}`}>{phase.title}</h3>
        </div>

        {/* Progress pill + chevron */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`text-sm font-bold tabular-nums ${isComplete ? 'text-green-600' : 'text-slate-600'}`}>
            {phaseStat.done}/{phaseStat.total}
          </span>
          {isCollapsed
            ? <ChevronDown size={18} className="text-slate-400" />
            : <ChevronUp size={18} className="text-slate-400" />
          }
        </div>
      </button>

      {/* Progress bar */}
      <div className="px-5 pb-1 pt-0">
        <ProgressBar
          value={phaseStat.done}
          max={phaseStat.total}
          color={isComplete ? 'green' : colors.bar}
          showLabel={false}
          className="h-1.5"
        />
      </div>

      {/* Collapsible body */}
      {!isCollapsed && (
        <div id={`phase-body-${phase.id}`} className="px-5 pb-5 pt-3 space-y-4">
          {/* Description */}
          <p className="text-sm text-slate-500 leading-relaxed">{phase.description}</p>

          {/* Task list */}
          <div className="space-y-2">
            {phase.tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                done={isTaskDone(task.id)}
                onToggle={onToggleTask}
              />
            ))}
          </div>

          {/* Resources */}
          {phase.resources && phase.resources.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Resources</p>
              <div className="flex flex-wrap gap-2">
                {phase.resources.map((r) => (
                  <a
                    key={r.url}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-xs font-medium text-slate-600 transition-colors"
                  >
                    <ExternalLink size={11} />
                    {r.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Practice project */}
          {phase.practiceProject && (
            <div className={`rounded-xl px-4 py-3 ${colors.bg} border ${colors.border}`}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Practice Project</p>
              <p className="text-sm text-slate-700 leading-relaxed">{phase.practiceProject}</p>
            </div>
          )}

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Notes</p>
              {!editingNote && (
                <button
                  type="button"
                  onClick={() => { setNoteValue(note); setEditingNote(true); }}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Pencil size={11} /> Edit
                </button>
              )}
            </div>
            {editingNote ? (
              <div className="space-y-2">
                <textarea
                  autoFocus
                  value={noteValue}
                  onChange={(e) => setNoteValue(e.target.value)}
                  placeholder="Add notes, links, or reminders for this phase…"
                  rows={3}
                  className="w-full text-sm text-slate-700 bg-white border border-slate-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-sky-300 placeholder:text-slate-300"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold transition-colors"
                  >
                    <Check size={12} /> Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingNote(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 min-h-[40px] cursor-text whitespace-pre-wrap"
                onClick={() => { setNoteValue(note); setEditingNote(true); }}
              >
                {note || <span className="text-slate-300 italic">Click to add notes…</span>}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
    </div>
  );
};

PhaseCard.propTypes = {
  phase: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    tasks: PropTypes.array.isRequired,
    resources: PropTypes.array,
    practiceProject: PropTypes.string,
  }).isRequired,
  phaseIndex: PropTypes.number.isRequired,
  phaseStat: PropTypes.shape({
    done: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    pct: PropTypes.number.isRequired,
  }).isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  onToggleCollapsed: PropTypes.func.isRequired,
  isTaskDone: PropTypes.func.isRequired,
  onToggleTask: PropTypes.func.isRequired,
  note: PropTypes.string.isRequired,
  onSetNote: PropTypes.func.isRequired,
};

export default PhaseCard;
