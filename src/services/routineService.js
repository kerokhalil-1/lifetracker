// All Firestore CRUD operations for routine data
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase.js';
import { COLLECTIONS } from '../constants/collections.js';
import { DEFAULTS } from '../constants/defaults.js';
import { timed } from '../utils/perfLog.js';

// Module-level caches — keyed caches so Dashboard and RoutinePage share the same data
// within a session instead of each triggering a separate Firestore read.
const _dayCache = new Map();    // dateStr → { data, ts }
const _histCache = new Map();   // count  → { data, ts }
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const fresh = (entry) => entry && Date.now() - entry.ts < CACHE_TTL;

export const getRoutineDay = (dateStr) =>
  timed(`getRoutineDay(${dateStr})`, 'firestore', async () => {
    const snap = await getDoc(doc(db, COLLECTIONS.ROUTINE_DAYS, dateStr));
    return snap.exists() ? snap.data() : null;
  });

export const saveRoutineDay = (dateStr, data) =>
  timed(`saveRoutineDay(${dateStr})`, 'firestore', () =>
    setDoc(doc(db, COLLECTIONS.ROUTINE_DAYS, dateStr), { ...data, date: dateStr, createdAt: serverTimestamp() }, { merge: true })
  );

// Write-only: caller computes new items/score from local state — no read round-trip
export const writeRoutineItems = (dateStr, field, items, completionScore) =>
  timed(`writeRoutineItems(${field})`, 'firestore', () => {
    invalidateRoutineDayCache(dateStr);
    return updateDoc(doc(db, COLLECTIONS.ROUTINE_DAYS, dateStr), { [field]: items, completionScore });
  });

export const addFlexibleItem = (dateStr, item) =>
  timed(`addFlexibleItem(${dateStr})`, 'firestore', async () => {
    const ref = doc(db, COLLECTIONS.ROUTINE_DAYS, dateStr);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : {
      fixedItems: DEFAULTS.FIXED_ROUTINE_ITEMS.map((i) => ({ ...i, done: false })),
      flexibleItems: [],
    };
    await setDoc(ref, { ...data, flexibleItems: [...(data.flexibleItems || []), item], date: dateStr }, { merge: true });
  });

export const getRecentRoutineDays = (count = 30) => {
  if (fresh(_histCache.get(count))) return Promise.resolve(_histCache.get(count).data);
  return timed(`getRecentRoutineDays(${count})`, 'firestore', async () => {
    const q = query(collection(db, COLLECTIONS.ROUTINE_DAYS), orderBy('date', 'desc'), limit(count));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => d.data());
    _histCache.set(count, { data, ts: Date.now() });
    return data;
  });
};

export const initRoutineDay = (dateStr, fixedItems) => {
  if (fresh(_dayCache.get(dateStr))) return Promise.resolve(_dayCache.get(dateStr).data);
  return timed(`initRoutineDay(${dateStr})`, 'firestore', async () => {
    const ref = doc(db, COLLECTIONS.ROUTINE_DAYS, dateStr);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      _dayCache.set(dateStr, { data, ts: Date.now() });
      return data;
    }
    const data = {
      date: dateStr,
      fixedItems: fixedItems.map((i) => ({ ...i, done: false })),
      flexibleItems: [],
      completionScore: 0,
      createdAt: serverTimestamp(),
    };
    await setDoc(ref, data);
    _dayCache.set(dateStr, { data, ts: Date.now() });
    return data;
  });
};

// Invalidate day cache after a write so the next read sees fresh data
export const invalidateRoutineDayCache = (dateStr) => {
  _dayCache.delete(dateStr);
  _histCache.clear();
};
