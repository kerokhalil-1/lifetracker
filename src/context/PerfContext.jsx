// React context layer over the perfLog singleton — drives the UI
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { perfLog } from '../utils/perfLog.js';

const PerfContext = createContext(null);
export const usePerf = () => useContext(PerfContext);

export const PerfProvider = ({ children }) => {
  const [entries, setEntries] = useState(() => perfLog.getEntries());
  const location = useLocation();
  // Track which one-shot browser events we've already recorded to prevent duplicates
  const recordedBrowserEvents = useRef(new Set());

  // Keep state in sync with the singleton
  useEffect(() => perfLog.subscribe(setEntries), []);

  // Track every route navigation
  useEffect(() => {
    perfLog.record({ label: `Navigate → ${location.pathname}`, type: 'navigation', duration: 0, status: 'ok' });
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

  // Record browser Web Vitals once per page load — guard against duplicate observer fires
  useEffect(() => {
    const observers = [];
    const rec = recordedBrowserEvents.current;

    const once = (key, fn) => {
      if (rec.has(key)) return;
      rec.add(key);
      fn();
    };

    const observe = (type, handler) => {
      try {
        const obs = new PerformanceObserver((list) => list.getEntries().forEach(handler));
        obs.observe({ type, buffered: true });
        observers.push(obs);
      } catch { /* browser doesn't support this type */ }
    };

    observe('navigation', (e) => {
      once('nav-domComplete',   () => perfLog.record({ label: 'Page load (domComplete)', type: 'browser', duration: Math.round(e.domComplete), status: 'ok' }));
      once('nav-domInteractive',() => perfLog.record({ label: 'DOM interactive',         type: 'browser', duration: Math.round(e.domInteractive), status: 'ok' }));
      once('nav-dns',           () => perfLog.record({ label: 'DNS lookup',              type: 'browser', duration: Math.round(e.domainLookupEnd - e.domainLookupStart), status: 'ok' }));
    });

    observe('largest-contentful-paint', (e) => {
      // LCP fires multiple times; only keep the last one (largest value seen)
      const key = 'lcp';
      rec.delete(key); // allow overwrite with latest
      once(key, () => {});
      perfLog.record({ label: 'LCP (Largest Contentful Paint)', type: 'browser', duration: Math.round(e.startTime), status: e.startTime < 2500 ? 'ok' : e.startTime < 4000 ? 'warn' : 'error' });
    });

    // Debounce layout-shift: group rapid sequential shifts into one entry
    let shiftTimer = null;
    let shiftAccum = 0;
    observe('layout-shift', (e) => {
      if (e.hadRecentInput) return;
      shiftAccum += e.value;
      clearTimeout(shiftTimer);
      shiftTimer = setTimeout(() => {
        const v = shiftAccum;
        shiftAccum = 0;
        perfLog.record({ label: `Layout shift (CLS: ${v.toFixed(4)})`, type: 'browser', duration: Math.round(v * 1000), status: v < 0.1 ? 'ok' : 'warn' });
      }, 200);
    });

    observe('longtask', (e) => {
      perfLog.record({ label: `Long task blocked UI for ${Math.round(e.duration)}ms`, type: 'browser', duration: Math.round(e.duration), status: 'error' });
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []); // runs once per mount

  const clear = useCallback(() => {
    recordedBrowserEvents.current.clear();
    perfLog.clear();
  }, []);

  return (
    <PerfContext.Provider value={{ entries, clear }}>
      {children}
    </PerfContext.Provider>
  );
};

PerfProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
