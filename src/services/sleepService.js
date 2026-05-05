// All Firestore CRUD operations for sleep logs
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase.js';
import { COLLECTIONS } from '../constants/collections.js';
import { DEFAULTS } from '../constants/defaults.js';
import { timed } from '../utils/perfLog.js';

export const saveSleepLog = (dateStr, logData) =>
  timed(`saveSleepLog(${dateStr})`, 'firestore', () =>
    setDoc(doc(db, COLLECTIONS.SLEEP_LOGS, dateStr), { ...logData, date: dateStr, createdAt: serverTimestamp() }, { merge: true })
  );

export const getSleepLog = (dateStr) =>
  timed(`getSleepLog(${dateStr})`, 'firestore', async () => {
    const snap = await getDoc(doc(db, COLLECTIONS.SLEEP_LOGS, dateStr));
    return snap.exists() ? snap.data() : null;
  });

export const getLast7Nights = (count = 7) =>
  timed(`getLast7Nights(${count})`, 'firestore', async () => {
    const q = query(collection(db, COLLECTIONS.SLEEP_LOGS), orderBy('date', 'desc'), limit(count));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  });

export const getAllSleepLogs = () =>
  timed('getAllSleepLogs', 'firestore', async () => {
    const q = query(collection(db, COLLECTIONS.SLEEP_LOGS), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  });

export const getSettings = () =>
  timed('getSettings', 'firestore', async () => {
    const snap = await getDoc(doc(db, COLLECTIONS.SETTINGS, DEFAULTS.SETTINGS_DOC_ID));
    return snap.exists() ? snap.data() : {
      targetSleepTime: DEFAULTS.TARGET_SLEEP_TIME,
      targetWakeTime: DEFAULTS.TARGET_WAKE_TIME,
      fixedRoutineItems: DEFAULTS.FIXED_ROUTINE_ITEMS,
      currentCourse: DEFAULTS.CURRENT_COURSE,
    };
  });

export const saveSettings = (settings) =>
  timed('saveSettings', 'firestore', () =>
    setDoc(doc(db, COLLECTIONS.SETTINGS, DEFAULTS.SETTINGS_DOC_ID), settings, { merge: true })
  );
