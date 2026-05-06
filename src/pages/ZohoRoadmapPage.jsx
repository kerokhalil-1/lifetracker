// Zoho Admin Learning Roadmap — full path from zero to certified admin
import { useState, useCallback, useRef } from 'react';
import { Search, X, ChevronsUpDown, RotateCcw } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import PhaseCard from '../components/zoho/PhaseCard.jsx';
import RoadmapSummary from '../components/zoho/RoadmapSummary.jsx';
import Button from '../components/ui/Button.jsx';
import useZohoRoadmap from '../hooks/useZohoRoadmap.js';
import { PHASES } from '../data/zohoRoadmap.js';

const FILTER_OPTIONS = [
  { value: 'all',        label: 'All tasks'    },
  { value: 'todo',       label: 'To do'        },
  { value: 'done',       label: 'Completed'    },
  { value: 'easy',       label: 'Easy'         },
  { value: 'medium',     label: 'Medium'       },
  { value: 'hard',       label: 'Hard'         },
];

const ZohoRoadmapPage = () => {
  const {
    toggleTask, isTaskDone, getNote, setNote,
    isCollapsed, toggleCollapsed, expandAll, collapseAll,
    stats, resetAll,
  } = useZohoRoadmap();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [confirmReset, setConfirmReset] = useState(false);
  const searchRef = useRef(null);

  // Jump to a phase by scrolling its card into view
  const jumpToPhase = useCallback((phaseId) => {
    const el = document.getElementById(phaseId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // If the phase is collapsed, expand it
      if (isCollapsed(phaseId)) {
        toggleCollapsed(phaseId);
      }
    }
  }, [isCollapsed, toggleCollapsed]);

  // Filter phase tasks for display — returns phase with filtered task list (or null to hide the phase)
  const filteredPhases = PHASES.map((phase) => {
    const tasks = phase.tasks.filter((task) => {
      const done = isTaskDone(task.id);

      // Filter tab
      if (filter === 'todo'   && done)              return false;
      if (filter === 'done'   && !done)             return false;
      if (filter === 'easy'   && task.difficulty !== 'easy')   return false;
      if (filter === 'medium' && task.difficulty !== 'medium') return false;
      if (filter === 'hard'   && task.difficulty !== 'hard')   return false;

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!task.title.toLowerCase().includes(q) && !task.description?.toLowerCase().includes(q)) {
          return false;
        }
      }

      return true;
    });

    return { ...phase, tasks };
  }).filter((p) => p.tasks.length > 0 || (!search.trim() && filter === 'all'));

  // When filtering, show all phases unfiltered (don't hide them when filter isn't all/blank)
  const hasFilter = filter !== 'all' || search.trim().length > 0;

  const handleReset = () => {
    if (confirmReset) {
      resetAll();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
    }
  };

  return (
    <PageWrapper title="Zoho Admin Roadmap">

      {/* Summary panel */}
      <RoadmapSummary stats={stats} onJumpToPhase={jumpToPhase} />

      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">

        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="w-full pl-8 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-300 placeholder:text-slate-300"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                filter === f.value
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Expand/Collapse + Reset */}
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={expandAll} data-perf-label="Expand all phases">
            <ChevronsUpDown size={13} /> All
          </Button>
          <Button
            variant={confirmReset ? 'danger' : 'secondary'}
            size="sm"
            onClick={handleReset}
            data-perf-label="Reset roadmap progress"
          >
            <RotateCcw size={13} />
            {confirmReset ? 'Confirm reset' : 'Reset'}
          </Button>
        </div>
      </div>

      {/* Phase cards */}
      <div className="space-y-4">
        {hasFilter && filteredPhases.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Search size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No tasks match your search or filter.</p>
            <button
              type="button"
              onClick={() => { setSearch(''); setFilter('all'); }}
              className="mt-2 text-sm text-sky-500 hover:text-sky-700"
            >
              Clear filters
            </button>
          </div>
        ) : (
          PHASES.map((phase, i) => {
            // Always render all phases when no filter — only hide in search/filter mode
            if (hasFilter && !filteredPhases.find((p) => p.id === phase.id)) return null;

            const displayPhase = hasFilter
              ? filteredPhases.find((p) => p.id === phase.id) || phase
              : phase;

            const phaseStat = stats.phaseStats[i];

            return (
              <PhaseCard
                key={phase.id}
                phase={displayPhase}
                phaseIndex={i}
                phaseStat={phaseStat}
                isCollapsed={isCollapsed(phase.id)}
                onToggleCollapsed={toggleCollapsed}
                isTaskDone={isTaskDone}
                onToggleTask={toggleTask}
                note={getNote(phase.id)}
                onSetNote={setNote}
              />
            );
          })
        )}
      </div>
    </PageWrapper>
  );
};

export default ZohoRoadmapPage;
