// All Firestore CRUD operations for study sessions
import {
  collection, addDoc, updateDoc, getDocs, doc,
  query, orderBy, limit, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './firebase.js';
import { COLLECTIONS } from '../constants/collections.js';
import { timed } from '../utils/perfLog.js';

// Create a brand-new session document and return its ID
export const createSession = (data) =>
  timed('createSession', 'firestore', async () => {
    const ref = await addDoc(collection(db, COLLECTIONS.STUDY_SESSIONS), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  });

// Partially update an existing session document
export const updateSession = (id, updates) =>
  timed(`updateSession(${id})`, 'firestore', () =>
    updateDoc(doc(db, COLLECTIONS.STUDY_SESSIONS, id), {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  );

// Find the most recent unfinished session (running or paused) — checked on app load
export const getActiveSession = () =>
  timed('getActiveSession', 'firestore', async () => {
    // Fetch the 5 most-recent sessions and pick the first active one client-side
    // (avoids needing a composite index for the IN query)
    const q = query(
      collection(db, COLLECTIONS.STUDY_SESSIONS),
      orderBy('startedAt', 'desc'),
      limit(5)
    );
    const snap = await getDocs(q);
    const active = snap.docs.find((d) =>
      ['running', 'paused'].includes(d.data().status)
    );
    return active ? { id: active.id, ...active.data() } : null;
  });

// Fetch recent sessions for the history tab (any status, newest first)
export const listRecentSessions = (count = 30) =>
  timed(`listRecentSessions(${count})`, 'firestore', async () => {
    const q = query(
      collection(db, COLLECTIONS.STUDY_SESSIONS),
      orderBy('startedAt', 'desc'),
      limit(count)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  });

// Build a Firestore Timestamp from the current wall-clock time
export const nowTimestamp = () => Timestamp.fromDate(new Date());
