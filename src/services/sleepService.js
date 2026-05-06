// All Firestore CRUD operations for sleep logs
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase.js';
import { COLLECTIONS } from '../constants/collections.js';
import { DEFAULTS } from '../constants/defaults.js';
import { timed } from '../utils/perfLog.js';

// Module-level cache — getSettings is called by useRoutine, useSleep, and useProgress
// simultaneously. Cache means only the first caller hits Firestore; the rest get the
// cached value instantly. Invalidated on save.
let _settingsCache = null;
let _settingsFetch = null; // in-flight promise so concurrent callers share one request

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

export const getSettings = () => {
  if (_settingsCache) return Promise.resolve(_settingsCache);
  if (_settingsFetch) return _settingsFetch; // join in-flight request
  _settingsFetch = timed('getSettings', 'firestore', async () => {
    const snap = await getDoc(doc(db, COLLECTIONS.SETTINGS, DEFAULTS.SETTINGS_DOC_ID));
    _settingsCache = snap.exists() ? snap.data() : {
      targetSleepTime: DEFAULTS.TARGET_SLEEP_TIME,
      targetWakeTime: DEFAULTS.TARGET_WAKE_TIME,
      fixedRoutineItems: DEFAULTS.FIXED_ROUTINE_ITEMS,
      currentCourse: DEFAULTS.CURRENT_COURSE,
    };
    return _settingsCache;
  }).finally(() => { _settingsFetch = null; }); // bug #6: clear on error too, so next call retries
  return _settingsFetch;
};

export const saveSettings = (settings) =>
  timed('saveSettings', 'firestore', async () => {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, DEFAULTS.SETTINGS_DOC_ID), settings, { merge: true });
    _settingsCache = settings; // update cache immediately
    _settingsFetch = null;
  });
