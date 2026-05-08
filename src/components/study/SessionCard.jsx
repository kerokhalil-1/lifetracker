// Displays a single past study session in the history list
import { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, ChevronUp, BookOpen, Clock, Coffee, Pause, Pencil } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import EditSessionModal from './EditSessionModal.jsx';
import { formatDurationSec, getSessionStats } from '../../utils/sessionUtils.js';
import { formatDisplay } from '../../utils/dateUtils.js';
import en from '../../locales/en.js';

// showDate=false when rendered inside a DayGroup (date already shown in the header)
const SessionCard = ({ session, onEdit, showDate = true }) => {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const stats = getSessionStats(session);
  const dateLabel = session.date ? formatDisplay(session.date) : '';

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header row */}
        <div className="flex items-stretch">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex-1 flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left focus:outline-none min-w-0"
          >
            <BookOpen size={18} className="text-sky-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-slate-800 truncate">{session.courseName}</span>
                {showDate && <span className="text-xs text-slate-400">{dateLabel}</span>}
              </div>
              {/* Compact stats row */}
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock size={12} /> {formatDurationSec(session.totalWorkSeconds)}
                </span>
                {stats.pauseCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Pause size={12} /> {stats.pauseCount} {en.study.sessionPauses}
                  </span>
                )}
                {stats.breakMin > 0 && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Coffee size={12} /> {stats.breakMin}m {en.study.sessionBreak}
                  </span>
                )}
              </div>
              {/* Topics preview */}
              {session.topicsCovered?.length > 0 && (
                <p className="text-xs text-slate-500 mt-1 truncate">
                  {session.topicsCovered.slice(0, 3).join(' · ')}
                </p>
              )}
            </div>
            <span className="text-slate-400 shrink-0 mt-0.5">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>

          {/* Edit button */}
          {onEdit && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center px-3 border-l border-slate-100 text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-colors"
              aria-label="Edit session"
            >
              <Pencil size={15} />
            </button>
          )}
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="px-4 pb-4 border-t border-slate-100 flex flex-col gap-3 pt-3">
            {session.topicsCovered?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">{en.study.topicsCovered}</p>
                <ul className="list-disc list-inside text-sm text-slate-700 space-y-0.5">
                  {session.topicsCovered.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            )}
            {session.details && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">{en.study.details}</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{session.details}</p>
              </div>
            )}
            {session.keyNotes && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">{en.study.keyNotes}</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{session.keyNotes}</p>
              </div>
            )}
            {session.completedWork && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">{en.study.completedWork}</p>
                <p className="text-sm text-slate-700">{session.completedWork}</p>
              </div>
            )}
            {session.remainingWork && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">{en.study.remainingWork}</p>
                <p className="text-sm text-slate-700">{session.remainingWork}</p>
              </div>
            )}
            {session.nextStep && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">{en.study.nextStep}</p>
                <p className="text-sm text-slate-700">{session.nextStep}</p>
              </div>
            )}
            <div className="flex items-center gap-4 flex-wrap">
              {session.difficulty > 0 && (
                <span className="text-xs text-slate-500">{en.study.difficulty}: {session.difficulty}/5</span>
              )}
              {session.focusRating > 0 && (
                <span className="text-xs text-slate-500">{en.study.focusRating}: {session.focusRating}/5</span>
              )}
            </div>
            {session.tags?.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {session.tags.map((tag) => <Badge key={tag} color="sky">{tag}</Badge>)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {onEdit && editing && (
        <EditSessionModal
          session={session}
          isOpen={editing}
          onClose={() => setEditing(false)}
          onSave={onEdit}
        />
      )}
    </>
  );
};

SessionCard.propTypes = {
  session: PropTypes.shape({
    id: PropTypes.string,
    courseName: PropTypes.string,
    date: PropTypes.string,
    totalWorkSeconds: PropTypes.number,
    totalBreakSeconds: PropTypes.number,
    pauseCount: PropTypes.number,
    topicsCovered: PropTypes.arrayOf(PropTypes.string),
    details: PropTypes.string,
    keyNotes: PropTypes.string,
    completedWork: PropTypes.string,
    remainingWork: PropTypes.string,
    nextStep: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    difficulty: PropTypes.number,
    focusRating: PropTypes.number,
  }).isRequired,
  onEdit:   PropTypes.func,
  showDate: PropTypes.bool,
};

export default SessionCard;
