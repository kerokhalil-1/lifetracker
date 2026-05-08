// Hook for loading and editing past study sessions + tasks for the history tab
import { useState, useEffect, useCallback } from 'react';
import { listRecentSessions, updateSession, invalidateSessionsCache } from '../services/sessionService.js';
import { listTasksByDate } from '../services/studyService.js';
import { useErrorLog } from '../context/ErrorLogContext.jsx';
import { today } from '../utils/dateUtils.js';

const useSessionHistory = () => {
  const [sessions, setSessions]     = useState([]);
  const [tasksByDate, setTasksByDate] = useState({}); // { dateStr: Task[] }
  const [loading, setLoading]       = useState(true);
  const { addError } = useErrorLog();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const list = await listRecentSessions(50);
      setSessions(list);

      // Fetch tasks for every unique date that appears in the session history.
      // listTasksByDate is cached per date (5-min TTL) so repeat navigations are free.
      const dates = [...new Set(list.map((s) => s.date).filter(Boolean))];
      const taskArrays = await Promise.all(dates.map((d) => listTasksByDate(d)));
      const map = Object.fromEntries(dates.map((d, i) => [d, taskArrays[i]]));
      setTasksByDate(map);
    } catch (err) {
      addError('useSessionHistory', err);
    } finally {
      setLoading(false);
    }
  }, [addError]);

  useEffect(() => { load(); }, [load]);

  // Edit a finished session — optimistic local update + cache bust
  const editSession = useCallback(async (id, updates) => {
    try {
      await updateSession(id, updates);
      invalidateSessionsCache();
      setSessions((prev) =>
        prev.map((s) => s.id === id ? { ...s, ...updates } : s)
      );
    } catch (err) {
      addError('useSessionHistory.editSession', err);
      throw err;
    }
  }, [addError]);

  // Total work seconds across finished sessions today (for goal banner)
  const todayWorkSeconds = sessions
    .filter((s) => s.status === 'finished' && s.date === today())
    .reduce((sum, s) => sum + (s.totalWorkSeconds || 0), 0);

  return { sessions, tasksByDate, loading, todayWorkSeconds, reload: load, editSession };
};

export default useSessionHistory;
