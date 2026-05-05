// React context layer over the perfLog singleton — drives the UI
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { perfLog } from '../utils/perfLog.js';

const PerfContext = createContext(null);
export const usePerf = () => useContext(PerfContext);

export const PerfProvider = ({ children }) => {
  const [entries, setEntries] = useState(() => perfLog.getEntries());
  const location = useLocation();

  // Keep state in sync with the singleton
  useEffect(() => perfLog.subscribe(setEntries), []);

  // Track every route navigation — measure from the moment location changes
  const navStartRef = { current: null };
  useEffect(() => {
    const start = performance.now();
    const label = `Navigate → ${location.pathname}`;
    // Record the navigation event itself immediately
    perfLog.record({ label, type: 'navigation', duration: Math.round(performance.now() - start), status: 'ok' });
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track every meaningful click — capture the target label
  useEffect(() => {
    const handler = (e) => {
      const el = e.target.closest('button, a, [role="button"], label');
      if (!el) return;
      const label =
        el.getAttribute('aria-label') ||
        el.getAttribute('title') ||
        el.textContent?.trim().slice(0, 60) ||
        el.tagName;
      if (!label || label.length < 1) return;
      perfLog.record({ label: `Click: "${label}"`, type: 'interaction', duration: 0, status: 'ok' });
    };
    document.addEventListener('click', handler, { capture: true });
    return () => document.removeEventListener('click', handler, { capture: true });
  }, []);

  // Record browser-reported Web Vitals via PerformanceObserver
  useEffect(() => {
    const observers = [];

    const observe = (type, fn) => {
      try {
        const obs = new PerformanceObserver((list) => list.getEntries().forEach(fn));
        obs.observe({ type, buffered: true });
        observers.push(obs);
      } catch { /* unsupported */ }
    };

    observe('navigation', (e) => {
      perfLog.record({ label: 'Page load (domComplete)', type: 'browser', duration: Math.round(e.domComplete), status: 'ok' });
      perfLog.record({ label: 'DOM interactive', type: 'browser', duration: Math.round(e.domInteractive), status: 'ok' });
      perfLog.record({ label: 'DNS lookup', type: 'browser', duration: Math.round(e.domainLookupEnd - e.domainLookupStart), status: 'ok' });
    });

    observe('largest-contentful-paint', (e) => {
      perfLog.record({ label: 'LCP (Largest Contentful Paint)', type: 'browser', duration: Math.round(e.startTime), status: e.startTime < 2500 ? 'ok' : e.startTime < 4000 ? 'warn' : 'error' });
    });

    observe('layout-shift', (e) => {
      if (e.hadRecentInput) return;
      perfLog.record({ label: `Layout shift (CLS score: ${e.value.toFixed(4)})`, type: 'browser', duration: Math.round(e.value * 1000), status: e.value < 0.1 ? 'ok' : 'warn' });
    });

    observe('longtask', (e) => {
      perfLog.record({ label: `Long task blocked UI for ${Math.round(e.duration)}ms`, type: 'browser', duration: Math.round(e.duration), status: 'error' });
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const clear = useCallback(() => perfLog.clear(), []);

  return (
    <PerfContext.Provider value={{ entries, clear }}>
      {children}
    </PerfContext.Provider>
  );
};

PerfProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
