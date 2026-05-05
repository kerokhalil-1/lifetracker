// Global error log — collects all app errors and persists them to localStorage
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

const STORAGE_KEY = 'lifetracker_error_log';
const MAX_ERRORS = 100;

const ErrorLogContext = createContext(null);

export const useErrorLog = () => useContext(ErrorLogContext);

// Build a structured error entry from any caught value
const buildEntry = (source, error, extra = {}) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  timestamp: new Date().toISOString(),
  source,
  message: error?.message || String(error),
  stack: error?.stack || null,
  ...extra,
});

export const ErrorLogProvider = ({ children }) => {
  const [errors, setErrors] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });

  // Persist every change to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(errors.slice(0, MAX_ERRORS)));
    } catch { /* storage full — ignore */ }
  }, [errors]);

  const addError = useCallback((source, error, extra = {}) => {
    const entry = buildEntry(source, error, extra);
    setErrors((prev) => [entry, ...prev].slice(0, MAX_ERRORS));
    return entry;
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Catch unhandled JS errors and unhandled promise rejections globally
  useEffect(() => {
    const onError = (event) => {
      addError('window.onerror', { message: event.message, stack: event.error?.stack }, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };
    const onUnhandled = (event) => {
      const err = event.reason;
      addError('UnhandledRejection', err instanceof Error ? err : { message: String(err) });
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandled);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandled);
    };
  }, [addError]);

  return (
    <ErrorLogContext.Provider value={{ errors, addError, clearErrors }}>
      {children}
    </ErrorLogContext.Provider>
  );
};

ErrorLogProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
