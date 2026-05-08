// Hook for loading and editing past study sessions (history tab)
import { useState, useEffect, useCallback } from 'react';
import { listRecentSessions, updateSession, invalidateSessionsCache } from '../services/sessionService.js';
import { useErrorLog } from '../context/ErrorLogContext.jsx';
import { today } from '../utils/dateUtils.js';

const useSessionHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addError } = useErrorLog();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const list = await listRecentSessions(50);
      setSessions(list);
    } catch (err) {
      addError('useSessionHistory', err);
    } finally {
      setLoading(false);
    }
  }, [addError]);

  useEffect(() => { load(); }, [load]);

  // Edit a finished session — bust cache so next load is fresh
  const editSession = useCallback(async (id, updates) => {
    try {
      await updateSession(id, updates);
      invalidateSessionsCache();
      // Optimistically update local state for instant feedback
      setSessions((prev) =>
        prev.map((s) => s.id === id ? { ...s, ...updates } : s)
      );
    } catch (err) {
      addError('useSessionHistory.editSession', err);
      throw err; // rethrow so EditSessionModal can show the error
    }
  }, [addError]);

  // Total work seconds across all finished sessions today (for goal banner)
  const todayWorkSeconds = sessions
    .filter((s) => s.status === 'finished' && s.date === today())
    .reduce((sum, s) => sum + (s.totalWorkSeconds || 0), 0);

  return { sessions, loading, todayWorkSeconds, reload: load, editSession };
};

export default useSessionHistory;
