// Groups sessions belonging to one calendar day and shows a smart daily digest
import { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, ChevronUp, Clock, Zap, Star, BookOpen, CheckCircle2, Circle } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import LinkifiedText from '../ui/LinkifiedText.jsx';
import SessionCard from './SessionCard.jsx';
import { formatDurationSec } from '../../utils/sessionUtils.js';
import { formatDisplay } from '../../utils/dateUtils.js';

// ─── Smart summariser (pure function) ────────────────────────────────────────
const buildSummary = (sessions) => {
  const totalSecs  = sessions.reduce((s, sess) => s + (sess.totalWorkSeconds || 0), 0);
  const courses    = [...new Set(sessions.map((s) => s.courseName).filter(Boolean))];
  const topics     = [...new Set(sessions.flatMap((s) => s.topicsCovered || []))];
  const allTags    = [...new Set(sessions.flatMap((s) => s.tags || []))];
  const nextSteps  = sessions.map((s) => s.nextStep).filter(Boolean);
  const keyNotes   = sessions.map((s) => s.keyNotes).filter(Boolean);
  const completed  = sessions.map((s) => s.completedWork).filter(Boolean);

  const focusRated = sessions.filter((s) => s.focusRating > 0);
  const avgFocus   = focusRated.length
    ? focusRated.reduce((s, sess) => s + sess.focusRating, 0) / focusRated.length
    : null;

  // Generate readable summary sentence
  const parts = [];
  parts.push(`Studied ${formatDurationSec(totalSecs)}`);
  if (courses.length === 1)     parts.push(`on ${courses[0]}`);
  else if (courses.length > 1)  parts.push(`across ${courses.join(' & ')}`);
  if (sessions.length > 1)      parts.push(`in ${sessions.length} sessions`);

  let sentence = parts.join(' ') + '.';
  if (topics.length > 0) {
    const preview = topics.slice(0, 3).join(', ') + (topics.length > 3 ? ` +${topics.length - 3} more` : '');
    sentence += ` Covered: ${preview}.`;
  }
  if (avgFocus !== null) {
    const word = avgFocus >= 4.5 ? 'Excellent' : avgFocus >= 3.5 ? 'Good' : avgFocus >= 2.5 ? 'Fair' : 'Low';
    sentence += ` ${word} focus (${avgFocus.toFixed(1)}/5).`;
  }

  return { totalSecs, courses, topics, allTags, nextSteps, keyNotes, completed, avgFocus, sentence };
};

// ─── Component ────────────────────────────────────────────────────────────────
const DaySummary = ({ dateStr, sessions, dayTasks, onEditSession }) => {
  const [expanded, setExpanded] = useState(true);
  const summary  = buildSummary(sessions);
  const isToday  = dateStr === new Date().toISOString().split('T')[0];
  const label    = isToday ? 'Today' : formatDisplay(dateStr);

  const doneTasks    = dayTasks.filter((t) => t.done);
  const pendingTasks = dayTasks.filter((t) => !t.done);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

      {/* Day header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-bold ${isToday ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'}`}>
          {label}
        </div>

        <div className="flex-1 flex items-center gap-4 flex-wrap min-w-0">
          <span className="flex items-center gap-1 text-sm font-semibold text-slate-700">
            <Clock size={14} className="text-slate-400" />
            {formatDurationSec(summary.totalSecs)}
          </span>
          {sessions.length > 1 && (
            <span className="text-xs text-slate-400">{sessions.length} sessions</span>
          )}
          {summary.avgFocus !== null && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Star size={12} className="text-amber-400" />
              {summary.avgFocus.toFixed(1)}/5 focus
            </span>
          )}
          {dayTasks.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <CheckCircle2 size={12} className="text-green-400" />
              {doneTasks.length}/{dayTasks.length} tasks
            </span>
          )}
          {summary.courses.length > 0 && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400 truncate">
              <BookOpen size={12} />
              {summary.courses.slice(0, 2).join(', ')}{summary.courses.length > 2 ? ` +${summary.courses.length - 2}` : ''}
            </span>
          )}
        </div>

        <span className="flex-shrink-0 text-slate-400">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-slate-100">

          {/* Smart summary digest */}
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 space-y-3">

            {/* Summary sentence */}
            <p className="text-sm text-slate-700 leading-relaxed">
              <span className="mr-1">📖</span>{summary.sentence}
            </p>

            {/* Tasks for this day */}
            {dayTasks.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Tasks</p>
                <div className="flex flex-col gap-1">
                  {doneTasks.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 text-xs text-slate-500">
                      <CheckCircle2 size={13} className="text-green-500 flex-shrink-0" />
                      <span className="line-through">{t.title}</span>
                      {t.subject && <span className="text-slate-400">· {t.subject}</span>}
                    </div>
                  ))}
                  {pendingTasks.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 text-xs text-slate-400">
                      <Circle size={13} className="flex-shrink-0" />
                      <span>{t.title}</span>
                      {t.subject && <span>· {t.subject}</span>}
                      {!isToday && <span className="text-amber-500 font-medium ml-1">not done</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Topics covered */}
            {summary.topics.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Topics covered</p>
                <div className="flex flex-wrap gap-1.5">
                  {summary.topics.map((t, i) => (
                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* What you completed */}
            {summary.completed.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">What you completed</p>
                <ul className="space-y-0.5">
                  {summary.completed.map((c, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span className="whitespace-pre-wrap"><LinkifiedText text={c} /></span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key notes */}
            {summary.keyNotes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Key notes</p>
                <ul className="space-y-0.5">
                  {summary.keyNotes.map((n, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                      <span className="text-amber-500 mt-0.5">★</span>
                      <span className="whitespace-pre-wrap"><LinkifiedText text={n} /></span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next steps */}
            {summary.nextSteps.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Next steps</p>
                <ul className="space-y-0.5">
                  {summary.nextSteps.map((n, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                      <Zap size={11} className="text-sky-500 mt-0.5 flex-shrink-0" />
                      <span className="whitespace-pre-wrap"><LinkifiedText text={n} /></span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            {summary.allTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {summary.allTags.map((tag) => <Badge key={tag} color="slate">{tag}</Badge>)}
              </div>
            )}
          </div>

          {/* Individual session cards */}
          <div className="p-4 flex flex-col gap-3">
            {sessions.map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                onEdit={onEditSession}
                showDate={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

DaySummary.propTypes = {
  dateStr:       PropTypes.string.isRequired,
  sessions:      PropTypes.array.isRequired,
  dayTasks:      PropTypes.array,
  onEditSession: PropTypes.func.isRequired,
};

DaySummary.defaultProps = {
  dayTasks: [],
};

export default DaySummary;
