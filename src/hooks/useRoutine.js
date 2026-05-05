// Hook for loading and managing today's routine data
import { useState, useEffect, useCallback } from 'react';
import { today } from '../utils/dateUtils.js';
import { initRoutineDay, writeRoutineItems, addFlexibleItem, getRecentRoutineDays } from '../services/routineService.js';
import { getSettings } from '../services/sleepService.js';
import { useErrorLog } from '../context/ErrorLogContext.jsx';

const calcScore = (fixedItems, flexibleItems) => {
  const all = [...fixedItems, ...flexibleItems];
  return all.length ? Math.round((all.filter((i) => i.done).length / all.length) * 100) : 0;
};

const useRoutine = (dateStr = today()) => {
  const [routineDay, setRoutineDay] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addError } = useErrorLog();

  // Full load — only runs on mount and after addItem
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const settings = await getSettings();
      const [data, hist] = await Promise.all([
        initRoutineDay(dateStr, settings.fixedRoutineItems || []),
        getRecentRoutineDays(30),
      ]);
      setRoutineDay(data);
      setHistory(hist);
    } catch (err) {
      setError(err.message);
      addError('useRoutine', err);
    } finally {
      setLoading(false);
    }
  }, [dateStr, addError]);

  useEffect(() => { load(); }, [load]);

  // Optimistic toggle — updates local state instantly, writes to Firestore in background
  // Never re-fetches: avoids getSettings + initRoutineDay + getRecentRoutineDays on every click
  const toggleItem = useCallback(async (type, itemId, done) => {
    if (!routineDay) return;
    const field = type === 'fixed' ? 'fixedItems' : 'flexibleItems';
    const updatedField = routineDay[field].map((item) =>
      item.id === itemId ? { ...item, done } : item
    );
    const fixedItems = type === 'fixed' ? updatedField : routineDay.fixedItems;
    const flexibleItems = type === 'flexible' ? updatedField : routineDay.flexibleItems;
    const completionScore = calcScore(fixedItems, flexibleItems);

    // Apply instantly — no waiting for Firestore
    const optimistic = { ...routineDay, fixedItems, flexibleItems, completionScore };
    setRoutineDay(optimistic);

    try {
      await writeRoutineItems(dateStr, field, updatedField, completionScore);
    } catch (err) {
      // Revert on failure
      setRoutineDay(routineDay);
      setError(err.message);
      addError('useRoutine.toggleItem', err);
    }
  }, [routineDay, dateStr, addError]);

  const addItem = useCallback(async (title) => {
    try {
      const item = { id: `flex-${Date.now()}`, title, done: false };
      await addFlexibleItem(dateStr, item);
      // Only reload day data (not history) after adding a new item
      const settings = await getSettings();
      const data = await initRoutineDay(dateStr, settings.fixedRoutineItems || []);
      setRoutineDay(data);
    } catch (err) {
      setError(err.message);
      addError('useRoutine.addItem', err);
    }
  }, [dateStr, addError]);

  return { routineDay, history, loading, error, toggleItem, addItem, reload: load };
};

export default useRoutine;
