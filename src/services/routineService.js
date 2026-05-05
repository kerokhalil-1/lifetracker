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

export const updateRoutineItem = (dateStr, type, itemId, done) =>
  timed(`updateRoutineItem(${type}/${itemId})`, 'firestore', async () => {
    const ref = doc(db, COLLECTIONS.ROUTINE_DAYS, dateStr);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    const field = type === 'fixed' ? 'fixedItems' : 'flexibleItems';
    const updated = (data[field] || []).map((item) => item.id === itemId ? { ...item, done } : item);
    const allItems = [
      ...(type === 'fixed' ? updated : data.fixedItems || []),
      ...(type === 'flexible' ? updated : data.flexibleItems || []),
    ];
    const completionScore = allItems.length > 0
      ? Math.round((allItems.filter((i) => i.done).length / allItems.length) * 100)
      : 0;
    await updateDoc(ref, { [field]: updated, completionScore });
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
