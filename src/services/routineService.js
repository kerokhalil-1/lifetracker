// All Firestore CRUD operations for routine data
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase.js';
import { COLLECTIONS } from '../constants/collections.js';
import { DEFAULTS } from '../constants/defaults.js';
import { timed } from '../utils/perfLog.js';

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
  timed(`writeRoutineItems(${field})`, 'firestore', () =>
    updateDoc(doc(db, COLLECTIONS.ROUTINE_DAYS, dateStr), { [field]: items, completionScore })
  );

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

export const getRecentRoutineDays = (count = 30) =>
  timed(`getRecentRoutineDays(${count})`, 'firestore', async () => {
    const q = query(collection(db, COLLECTIONS.ROUTINE_DAYS), orderBy('date', 'desc'), limit(count));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  });

export const initRoutineDay = (dateStr, fixedItems) =>
  timed(`initRoutineDay(${dateStr})`, 'firestore', async () => {
    const ref = doc(db, COLLECTIONS.ROUTINE_DAYS, dateStr);
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data();
    const data = {
      date: dateStr,
      fixedItems: fixedItems.map((i) => ({ ...i, done: false })),
      flexibleItems: [],
      completionScore: 0,
      createdAt: serverTimestamp(),
    };
    await setDoc(ref, data);
    return data;
  });
