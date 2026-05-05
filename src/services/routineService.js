// All Firestore CRUD operations for routine data
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase.js';
import { COLLECTIONS } from '../constants/collections.js';
import { DEFAULTS } from '../constants/defaults.js';

// Fetch a routine day document by date string (YYYY-MM-DD)
export const getRoutineDay = async (dateStr) => {
  try {
    const ref = doc(db, COLLECTIONS.ROUTINE_DAYS, dateStr);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.error('getRoutineDay error:', err);
    throw err;
  }
};

// Save or overwrite a routine day document
export const saveRoutineDay = async (dateStr, data) => {
  try {
    const ref = doc(db, COLLECTIONS.ROUTINE_DAYS, dateStr);
    await setDoc(ref, { ...data, date: dateStr, createdAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.error('saveRoutineDay error:', err);
    throw err;
  }
};

// Toggle a single item's done state and recalculate score
export const updateRoutineItem = async (dateStr, type, itemId, done) => {
  try {
    const ref = doc(db, COLLECTIONS.ROUTINE_DAYS, dateStr);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    const field = type === 'fixed' ? 'fixedItems' : 'flexibleItems';
    const updated = (data[field] || []).map((item) =>
      item.id === itemId ? { ...item, done } : item
    );
    const allItems = [...(type === 'fixed' ? updated : data.fixedItems || []), ...(type === 'flexible' ? updated : data.flexibleItems || [])];
    const completionScore = allItems.length > 0 ? Math.round((allItems.filter((i) => i.done).length / allItems.length) * 100) : 0;
    await updateDoc(ref, { [field]: updated, completionScore });
  } catch (err) {
    console.error('updateRoutineItem error:', err);
    throw err;
  }
};

// Add a flexible item to today's routine
export const addFlexibleItem = async (dateStr, item) => {
  try {
    const ref = doc(db, COLLECTIONS.ROUTINE_DAYS, dateStr);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : { fixedItems: DEFAULTS.FIXED_ROUTINE_ITEMS.map((i) => ({ ...i, done: false })), flexibleItems: [] };
    const flexibleItems = [...(data.flexibleItems || []), item];
    await setDoc(ref, { ...data, flexibleItems, date: dateStr }, { merge: true });
  } catch (err) {
    console.error('addFlexibleItem error:', err);
    throw err;
  }
};

// Fetch last N routine days for history view
export const getRecentRoutineDays = async (count = 30) => {
  try {
    const q = query(collection(db, COLLECTIONS.ROUTINE_DAYS), orderBy('date', 'desc'), limit(count));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (err) {
    console.error('getRecentRoutineDays error:', err);
    throw err;
  }
};

// Initialize a new routine day with fixed items from settings
export const initRoutineDay = async (dateStr, fixedItems) => {
  try {
    const existing = await getRoutineDay(dateStr);
    if (existing) return existing;
    const data = {
      date: dateStr,
      fixedItems: fixedItems.map((i) => ({ ...i, done: false })),
      flexibleItems: [],
      completionScore: 0,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, COLLECTIONS.ROUTINE_DAYS, dateStr), data);
    return data;
  } catch (err) {
    console.error('initRoutineDay error:', err);
    throw err;
  }
};
