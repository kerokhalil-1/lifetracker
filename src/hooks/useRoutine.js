// Hook for loading and managing today's routine data
import { useState, useEffect, useCallback } from 'react';
import { today } from '../utils/dateUtils.js';
import { getRoutineDay, saveRoutineDay, updateRoutineItem, addFlexibleItem, initRoutineDay, getRecentRoutineDays } from '../services/routineService.js';
import { getSettings } from '../services/sleepService.js';

const useRoutine = (dateStr = today()) => {
  const [routineDay, setRoutineDay] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const settings = await getSettings();
      const fixed = settings.fixedRoutineItems || [];
      const data = await initRoutineDay(dateStr, fixed);
      setRoutineDay(data);
      const hist = await getRecentRoutineDays(30);
      setHistory(hist);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  useEffect(() => { load(); }, [load]);

  const toggleItem = async (type, itemId, done) => {
    try {
      await updateRoutineItem(dateStr, type, itemId, done);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const addItem = async (title) => {
    try {
      const item = { id: `flex-${Date.now()}`, title, done: false };
      await addFlexibleItem(dateStr, item);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return { routineDay, history, loading, error, toggleItem, addItem, reload: load };
};

export default useRoutine;
