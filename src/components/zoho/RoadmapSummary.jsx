// Summary panel — overall progress, next task, today's completions
import PropTypes from 'prop-types';
import { ArrowRight, Flame, Target, CheckCheck } from 'lucide-react';
import Card from '../ui/Card.jsx';
import ProgressBar from '../ui/ProgressBar.jsx';
import { PHASES } from '../../data/zohoRoadmap.js';

const RoadmapSummary = ({ stats, onJumpToPhase }) => {
  const overallPct = stats.totalTasks > 0
    ? Math.round((stats.totalDone / stats.totalTasks) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

      {/* Overall progress */}
      <Card className="sm:col-span-3">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-base font-bold text-slate-800">Overall Progress</h2>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Flame size={14} className="text-amber-500" />
              <strong className="text-slate-800">{stats.doneToday}</strong> done today
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCheck size={14} className="text-green-500" />
              <strong className="text-slate-800">{stats.totalDone}</strong> / {stats.totalTasks} tasks
            </span>
          </div>
        </div>

        <ProgressBar
          value={stats.totalDone}
          max={stats.totalTasks}
          color={overallPct === 100 ? 'green' : overallPct >= 50 ? 'sky' : 'amber'}
          showLabel
          className="mb-4"
        />

        {/* Phase mini-bars */}
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
          {PHASES.map((phase, i) => {
            const ps = stats.phaseStats[i];
            const isComplete = ps.done === ps.total;
            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => onJumpToPhase(phase.id)}
                title={`Phase ${i + 1}: ${phase.title} — ${ps.done}/${ps.total}`}
                className="flex flex-col items-center gap-1 group"
              >
                <span className="text-lg">{isComplete ? '✅' : phase.icon}</span>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isComplete ? 'bg-green-400' : 'bg-sky-400'}`}
                    style={{ width: `${ps.pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-600 transition-colors hidden sm:block truncate w-full text-center">
                  P{i + 1}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Next task */}
      {stats.nextTask && (
        <Card className="sm:col-span-2 bg-sky-50 border border-sky-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
              <Target size={16} className="text-sky-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-0.5">Up Next</p>
              <p className="text-sm font-semibold text-slate-800 leading-snug">{stats.nextTask.task.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stats.nextTask.phase.title}</p>
              {stats.nextTask.task.description && (
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{stats.nextTask.task.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onJumpToPhase(stats.nextTask.phase.id)}
              className="flex-shrink-0 mt-0.5 p-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-600 transition-colors"
              aria-label="Jump to phase"
            >
              <ArrowRight size={14} />
            </button>
          </div>
        </Card>
      )}

      {/* Stats tile */}
      <Card>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Phases complete</span>
            <span className="text-sm font-bold text-slate-800">
              {stats.phaseStats.filter((p) => p.done === p.total).length} / {PHASES.length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Tasks remaining</span>
            <span className="text-sm font-bold text-slate-800">{stats.totalTasks - stats.totalDone}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Completed today</span>
            <span className={`text-sm font-bold ${stats.doneToday > 0 ? 'text-green-600' : 'text-slate-800'}`}>
              {stats.doneToday}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Overall</span>
            <span className={`text-sm font-bold ${overallPct === 100 ? 'text-green-600' : 'text-sky-600'}`}>
              {overallPct}%
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

RoadmapSummary.propTypes = {
  stats: PropTypes.shape({
    totalDone: PropTypes.number.isRequired,
    totalTasks: PropTypes.number.isRequired,
    doneToday: PropTypes.number.isRequired,
    phaseStats: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      done: PropTypes.number,
      total: PropTypes.number,
      pct: PropTypes.number,
    })).isRequired,
    nextTask: PropTypes.shape({
      phase: PropTypes.object,
      task: PropTypes.object,
    }),
  }).isRequired,
  onJumpToPhase: PropTypes.func.isRequired,
};

export default RoadmapSummary;
