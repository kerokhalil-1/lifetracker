// Module-level performance log singleton — accessible from services (outside React)
// Services call perfLog.record(); the React context subscribes to updates.

const STORAGE_KEY = 'lifetracker_perf_log';
const MAX_ENTRIES = 300;

let entries = (() => {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
})();

let listeners = [];

const persist = () => {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES))); } catch { /* full */ }
};

const notify = () => { listeners.forEach((fn) => fn([...entries])); };

export const perfLog = {
  record(entry) {
    const full = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    entries = [full, ...entries].slice(0, MAX_ENTRIES);
    persist();
    notify();
    return full;
  },

  // Replace the most recent entry whose label matches — used for LCP which fires multiple times
  upsert(label, entry) {
    const idx = entries.findIndex((e) => e.label === label);
    const full = {
      id: idx >= 0 ? entries[idx].id : `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    if (idx >= 0) {
      entries = entries.map((e, i) => (i === idx ? full : e));
    } else {
      entries = [full, ...entries].slice(0, MAX_ENTRIES);
    }
    persist();
    notify();
  },

  getEntries() { return [...entries]; },

  subscribe(fn) {
    listeners.push(fn);
    return () => { listeners = listeners.filter((l) => l !== fn); };
  },

  clear() {
    entries = [];
    sessionStorage.removeItem(STORAGE_KEY);
    notify();
  },
};

// Wraps any async fn, records its duration and outcome under a label
export const timed = async (label, type, fn) => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = Math.round(performance.now() - start);
    perfLog.record({ label, type, duration, status: 'ok' });
    return result;
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    perfLog.record({ label, type, duration, status: 'error', error: err?.message });
    throw err;
  }
};
