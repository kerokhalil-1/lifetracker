// Hook for loading and managing sleep logs and settings
import { useState, useEffect, useCallback } from 'react';
import { saveSleepLog, getSleepLog, getLast7Nights, getSettings, saveSettings } from '../services/sleepService.js';
import { today } from '../utils/dateUtils.js';

const useSleep = () => {
  const [todayLog, setTodayLog] = useState(null);
  const [last7, setLast7] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [log, nights, s] = await Promise.all([
        getSleepLog(today()),
        getLast7Nights(7),
        getSettings(),
      ]);
      setTodayLog(log);
      setLast7(nights);
      setSettings(s);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const logSleep = async (logData) => {
    try {
      await saveSleepLog(today(), logData);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      await saveSettings(newSettings);
      setSettings(newSettings);
    } catch (err) {
      setError(err.message);
    }
  };

  return { todayLog, last7, settings, loading, error, logSleep, updateSettings, reload: load };
};

export default useSleep;
