// All Firestore CRUD operations for sleep logs
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase.js';
import { COLLECTIONS } from '../constants/collections.js';
import { DEFAULTS } from '../constants/defaults.js';

// Save or update a sleep log for a given date
export const saveSleepLog = async (dateStr, logData) => {
  try {
    const ref = doc(db, COLLECTIONS.SLEEP_LOGS, dateStr);
    await setDoc(ref, { ...logData, date: dateStr, createdAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.error('saveSleepLog error:', err);
    throw err;
  }
};

// Fetch a sleep log for a given date
export const getSleepLog = async (dateStr) => {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.SLEEP_LOGS, dateStr));
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.error('getSleepLog error:', err);
    throw err;
  }
};

// Get the last N sleep logs ordered by date descending
export const getLast7Nights = async (count = 7) => {
  try {
    const q = query(collection(db, COLLECTIONS.SLEEP_LOGS), orderBy('date', 'desc'), limit(count));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (err) {
    console.error('getLast7Nights error:', err);
    throw err;
  }
};

// Get all sleep logs for stats calculation
export const getAllSleepLogs = async () => {
  try {
    const q = query(collection(db, COLLECTIONS.SLEEP_LOGS), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (err) {
    console.error('getAllSleepLogs error:', err);
    throw err;
  }
};

// Get or create user settings (sleep targets)
export const getSettings = async () => {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.SETTINGS, DEFAULTS.SETTINGS_DOC_ID));
    return snap.exists() ? snap.data() : {
      targetSleepTime: DEFAULTS.TARGET_SLEEP_TIME,
      targetWakeTime: DEFAULTS.TARGET_WAKE_TIME,
      fixedRoutineItems: DEFAULTS.FIXED_ROUTINE_ITEMS,
      currentCourse: DEFAULTS.CURRENT_COURSE,
    };
  } catch (err) {
    console.error('getSettings error:', err);
    throw err;
  }
};

// Save user settings to Firestore
export const saveSettings = async (settings) => {
  try {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, DEFAULTS.SETTINGS_DOC_ID), settings, { merge: true });
  } catch (err) {
    console.error('saveSettings error:', err);
    throw err;
  }
};
