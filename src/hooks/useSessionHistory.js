// Hook for loading past study sessions for the history tab
import { useState, useEffect, useCallback } from 'react';
import { listRecentSessions } from '../services/sessionService.js';
import { useErrorLog } from '../context/ErrorLogContext.jsx';
import { today } from '../utils/dateUtils.js';

const useSessionHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addError } = useErrorLog();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const list = await listRecentSessions(30);
      setSessions(list);
    } catch (err) {
      addError('useSessionHistory', err);
    } finally {
      setLoading(false);
    }
  }, [addError]);

  useEffect(() => { load(); }, [load]);

  // Total work seconds across all finished sessions today (for goal banner)
  const todayWorkSeconds = sessions
    .filter((s) => s.status === 'finished' && s.date === today())
    .reduce((sum, s) => sum + (s.totalWorkSeconds || 0), 0);

  return { sessions, loading, todayWorkSeconds, reload: load };
};

export default useSessionHistory;
