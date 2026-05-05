// Core hook — owns the session state machine and the live timer
import { useState, useEffect, useRef, useCallback } from 'react';
import { today } from '../utils/dateUtils.js';
import { computeElapsedWork, computeElapsedBreak } from '../utils/sessionUtils.js';
import {
  createSession, updateSession, getActiveSession, nowTimestamp, invalidateSessionsCache,
} from '../services/sessionService.js';
import { updateCourse } from '../services/courseService.js';
import { useErrorLog } from '../context/ErrorLogContext.jsx';

// Valid statuses: 'idle' | 'loading' | 'running' | 'paused' | 'finishing' | 'finished'
const useSession = () => {
  const [status, setStatus] = useState('loading');
  const [sessionId, setSessionId] = useState(null);
  const [session, setSession] = useState(null);
  const [elapsedWork, setElapsedWork] = useState(0);
  const [elapsedBreak, setElapsedBreak] = useState(0);
  const { addError } = useErrorLog();

  // Restore any active session that was left open before a page refresh
  useEffect(() => {
    (async () => {
      try {
        const active = await getActiveSession();
        if (active) {
          setSessionId(active.id);
          setSession(active);
          setElapsedWork(computeElapsedWork(active));
          setElapsedBreak(computeElapsedBreak(active));
          setStatus(active.status); // 'running' or 'paused'
        } else {
          setStatus('idle');
        }
      } catch (err) {
        addError('useSession.restore', err);
        setStatus('idle');
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Tick work time every second while running
  useEffect(() => {
    if (status !== 'running') return;
    const id = setInterval(() => setElapsedWork((w) => w + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  // Tick break time every second while paused
  useEffect(() => {
    if (status !== 'paused') return;
    const id = setInterval(() => setElapsedBreak((b) => b + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  // Begin a new study session for the given course
  const startSession = useCallback(async (courseId, courseName) => {
    try {
      const started = nowTimestamp();
      const data = {
        courseId,
        courseName,
        status: 'running',
        startedAt: started,
        lastResumedAt: started,
        pausedAt: null,
        finishedAt: null,
        totalWorkSeconds: 0,
        totalBreakSeconds: 0,
        pauseCount: 0,
        breakSessions: [],
        date: today(),
      };
      const id = await createSession(data);
      setSessionId(id);
      setSession({ ...data, id });
      setElapsedWork(0);
      setElapsedBreak(0);
      setStatus('running');
    } catch (err) {
      addError('useSession.startSession', err);
    }
  }, [addError]);

  // Pause the running session — saves accumulated work time to Firestore
  const pauseSession = useCallback(async () => {
    if (!sessionId || status !== 'running') return;
    try {
      const pausedAt = nowTimestamp();
      const updates = {
        status: 'paused',
        pausedAt,
        totalWorkSeconds: elapsedWork,
        pauseCount: (session.pauseCount || 0) + 1,
      };
      await updateSession(sessionId, updates);
      setSession((s) => ({ ...s, ...updates }));
      setElapsedBreak(0);
      setStatus('paused');
    } catch (err) {
      addError('useSession.pauseSession', err);
    }
  }, [sessionId, status, elapsedWork, session, addError]);

  // Resume a paused session — records the break interval in Firestore
  const resumeSession = useCallback(async () => {
    if (!sessionId || status !== 'paused') return;
    try {
      const resumedAt = nowTimestamp();
      const breakEntry = {
        pausedAt: session.pausedAt,
        resumedAt,
        breakSeconds: elapsedBreak,
      };
      const updates = {
        status: 'running',
        pausedAt: null,
        lastResumedAt: resumedAt,
        totalBreakSeconds: (session.totalBreakSeconds || 0) + elapsedBreak,
        breakSessions: [...(session.breakSessions || []), breakEntry],
      };
      await updateSession(sessionId, updates);
      setSession((s) => ({ ...s, ...updates }));
      setElapsedBreak(0);
      setStatus('running');
    } catch (err) {
      addError('useSession.resumeSession', err);
    }
  }, [sessionId, status, elapsedBreak, session, addError]);

  // Switch to the finish form — stops the timer, waits for form submission
  const requestFinish = useCallback(() => {
    if (status !== 'running' && status !== 'paused') return;
    setStatus('finishing');
  }, [status]);

  // Save the completed session with all form data to Firestore
  const submitFinish = useCallback(async (formData) => {
    if (!sessionId) return;
    try {
      const finishedAt = nowTimestamp();
      const finalWorkSeconds = status === 'finishing' ? elapsedWork : (session?.totalWorkSeconds || 0);
      const updates = {
        status: 'finished',
        finishedAt,
        totalWorkSeconds: finalWorkSeconds,
        ...formData,
      };
      await updateSession(sessionId, updates);
      invalidateSessionsCache(); // history tab should reload after finish

      // Increment the parent course's cumulative stats
      if (session?.courseId) {
        await updateCourse(session.courseId, {
          totalStudySeconds: (session.totalStudySeconds || 0) + finalWorkSeconds,
          sessionCount: (session.sessionCount || 0) + 1,
        }).catch(() => {}); // non-critical — don't block session save
      }

      setStatus('finished');
      // Brief "saved" state, then return to idle so the user can start again
      setTimeout(() => {
        setSession(null);
        setSessionId(null);
        setElapsedWork(0);
        setElapsedBreak(0);
        setStatus('idle');
      }, 1800);
    } catch (err) {
      addError('useSession.submitFinish', err);
    }
  }, [sessionId, status, elapsedWork, session, addError]);

  // Discard the active session without saving
  const cancelSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      await updateSession(sessionId, { status: 'cancelled' });
    } catch (err) {
      addError('useSession.cancelSession', err);
    } finally {
      setSession(null);
      setSessionId(null);
      setElapsedWork(0);
      setElapsedBreak(0);
      setStatus('idle');
    }
  }, [sessionId, addError]);

  return {
    status,
    session,
    sessionId,
    elapsedWork,
    elapsedBreak,
    startSession,
    pauseSession,
    resumeSession,
    requestFinish,
    submitFinish,
    cancelSession,
  };
};

export default useSession;
