// All Firestore CRUD operations for study sessions
import {
  collection, addDoc, updateDoc, getDocs, doc,
  query, orderBy, limit, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './firebase.js';
import { COLLECTIONS } from '../constants/collections.js';
import { timed } from '../utils/perfLog.js';

// Active-session check is called on every Study page mount — cache it so hot navigations are instant.
// Invalidated whenever a session is created, updated, or finished.
let _activeCache = undefined; // undefined = not yet loaded; null = confirmed no active session
let _activeFetch = null;
export const invalidateActiveSession = () => { _activeCache = undefined; _activeFetch = null; };

// Create a brand-new session document and return its ID
export const createSession = (data) =>
  timed('createSession', 'firestore', async () => {
    const ref = await addDoc(collection(db, COLLECTIONS.STUDY_SESSIONS), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    invalidateActiveSession();
    return ref.id;
  });

// Partially update an existing session document
export const updateSession = (id, updates) =>
  timed(`updateSession(${id})`, 'firestore', () => {
    const terminates = updates.status && updates.status !== 'running' && updates.status !== 'paused';
    if (terminates) {
      // Session ended — fully clear the cache so next getActiveSession does a fresh read
      invalidateActiveSession();
    } else if (_activeCache !== undefined && _activeCache?.id === id) {
      // Session still active (pause/resume) — merge updates into the cached snapshot
      // so the next mount gets the latest pausedAt/lastResumedAt/pauseCount etc. (bug #5 fix)
      _activeCache = { ..._activeCache, ...updates };
    }
    return updateDoc(doc(db, COLLECTIONS.STUDY_SESSIONS, id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  });

// Find the most recent unfinished session (running or paused) — cached between navigations
export const getActiveSession = () => {
  if (_activeCache !== undefined) return Promise.resolve(_activeCache);
  if (_activeFetch) return _activeFetch;
  _activeFetch = timed('getActiveSession', 'firestore', async () => {
    const q = query(
      collection(db, COLLECTIONS.STUDY_SESSIONS),
      orderBy('startedAt', 'desc'),
      limit(5)
    );
    const snap = await getDocs(q);
    const active = snap.docs.find((d) =>
      ['running', 'paused'].includes(d.data().status)
    );
    _activeCache = active ? { id: active.id, ...active.data() } : null;
    return _activeCache;
  }).finally(() => { _activeFetch = null; }); // bug #6: clear on error too, so next call retries
  return _activeFetch;
};

// Fetch recent sessions for the history tab — cached for 2 min, invalidated after a finish
let _sessionsCache = null;
let _sessionsFetch = null;
let _sessionsCacheTs = 0;
const SESSIONS_TTL = 2 * 60 * 1000;
export const invalidateSessionsCache = () => { _sessionsCache = null; _sessionsFetch = null; };

export const listRecentSessions = (count = 30) => {
  if (_sessionsCache && Date.now() - _sessionsCacheTs < SESSIONS_TTL) {
    return Promise.resolve(_sessionsCache);
  }
  if (_sessionsFetch) return _sessionsFetch;
  _sessionsFetch = timed(`listRecentSessions(${count})`, 'firestore', async () => {
    const q = query(
      collection(db, COLLECTIONS.STUDY_SESSIONS),
      orderBy('startedAt', 'desc'),
      limit(count)
    );
    const snap = await getDocs(q);
    _sessionsCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    _sessionsCacheTs = Date.now();
    return _sessionsCache;
  }).finally(() => { _sessionsFetch = null; }); // bug #6: clear on error too, so next call retries
  return _sessionsFetch;
};

// Build a Firestore Timestamp from the current wall-clock time
export const nowTimestamp = () => Timestamp.fromDate(new Date());
