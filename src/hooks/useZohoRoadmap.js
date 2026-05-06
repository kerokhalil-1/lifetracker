// State management for the Zoho Admin Roadmap — persisted in localStorage
import { useState, useCallback, useMemo } from 'react';
import { PHASES, TOTAL_TASKS } from '../data/zohoRoadmap.js';

const STORAGE_KEY = 'zoho_roadmap_v1';

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or private mode — silent fail
  }
};

// state shape: { [taskId]: { done: bool, doneAt: iso-string }, [phaseId + '_note']: string, [phaseId + '_collapsed']: bool }

const useZohoRoadmap = () => {
  const [state, setState] = useState(loadState);

  const updateState = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveState(next);
      return next;
    });
  }, []);

  // ─── Task completion ────────────────────────────────────────────────────────

  const toggleTask = useCallback((taskId) => {
    updateState((prev) => {
      const current = prev[taskId];
      if (current?.done) {
        const next = { ...prev };
        delete next[taskId];
        return next;
      }
      return { ...prev, [taskId]: { done: true, doneAt: new Date().toISOString() } };
    });
  }, [updateState]);

  const isTaskDone = useCallback((taskId) => Boolean(state[taskId]?.done), [state]);

  // ─── Phase notes ────────────────────────────────────────────────────────────

  const getNote = useCallback((phaseId) => state[`${phaseId}_note`] || '', [state]);

  const setNote = useCallback((phaseId, text) => {
    updateState((prev) => ({ ...prev, [`${phaseId}_note`]: text }));
  }, [updateState]);

  // ─── Phase collapsed state ──────────────────────────────────────────────────

  const isCollapsed = useCallback((phaseId) => Boolean(state[`${phaseId}_collapsed`]), [state]);

  const toggleCollapsed = useCallback((phaseId) => {
    updateState((prev) => ({ ...prev, [`${phaseId}_collapsed`]: !prev[`${phaseId}_collapsed`] }));
  }, [updateState]);

  const expandAll = useCallback(() => {
    updateState((prev) => {
      const next = { ...prev };
      PHASES.forEach((p) => { next[`${p.id}_collapsed`] = false; });
      return next;
    });
  }, [updateState]);

  const collapseAll = useCallback(() => {
    updateState((prev) => {
      const next = { ...prev };
      PHASES.forEach((p) => { next[`${p.id}_collapsed`] = true; });
      return next;
    });
  }, [updateState]);

  // ─── Statistics ─────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const totalDone = PHASES.reduce((sum, phase) =>
      sum + phase.tasks.filter((t) => state[t.id]?.done).length, 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const doneToday = Object.values(state)
      .filter((v) => v?.done && v.doneAt?.startsWith(todayStr)).length;

    const phaseStats = PHASES.map((phase) => {
      const done = phase.tasks.filter((t) => state[t.id]?.done).length;
      return { id: phase.id, done, total: phase.tasks.length, pct: Math.round((done / phase.tasks.length) * 100) };
    });

    // Next recommended task: first uncompleted task in first incomplete phase
    let nextTask = null;
    for (const phase of PHASES) {
      const undone = phase.tasks.find((t) => !state[t.id]?.done);
      if (undone) { nextTask = { phase, task: undone }; break; }
    }

    return { totalDone, totalTasks: TOTAL_TASKS, doneToday, phaseStats, nextTask };
  }, [state]);

  // ─── Reset ──────────────────────────────────────────────────────────────────

  const resetAll = useCallback(() => {
    updateState({});
  }, [updateState]);

  return {
    toggleTask,
    isTaskDone,
    getNote,
    setNote,
    isCollapsed,
    toggleCollapsed,
    expandAll,
    collapseAll,
    stats,
    resetAll,
  };
};

export default useZohoRoadmap;
