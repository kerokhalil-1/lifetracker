// All Firestore CRUD operations for sleep logs
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase.js';
import { COLLECTIONS } from '../constants/collections.js';
import { DEFAULTS } from '../constants/defaults.js';
import { timed } from '../utils/perfLog.js';

// ─── Settings cache ──────────────────────────────────────────────────────────
// getSettings is called by useRoutine, useSleep, and useProgress simultaneously.
let _settingsCache = null;
let _settingsFetch = null;

// ─── Sleep log cache (per date) ───────────────────────────────────────────────
// getSleepLog is called on every Sleep page + Dashboard mount.
const _sleepLogCache = new Map(); // dateStr → data | null
const _sleepLogFetch = new Map(); // dateStr → in-flight promise
const SLEEP_LOG_TTL = 5 * 60 * 1000;
const _sleepLogTs = new Map();

// ─── Last-N nights cache ──────────────────────────────────────────────────────
// getLast7Nights is called on every Sleep page + Dashboard mount.
const _last7Cache = new Map(); // count → data array
const _last7Fetch = new Map(); // count → in-flight promise
const LAST7_TTL = 5 * 60 * 1000;
const _last7Ts = new Map();

// Bust all sleep caches on any write (saveSleepLog)
const invalidateSleepCaches = (dateStr) => {
  _last7Cache.clear(); _last7Fetch.clear(); _last7Ts.clear();
  if (dateStr) { _sleepLogCache.delete(dateStr); _sleepLogFetch.delete(dateStr); _sleepLogTs.delete(dateStr); }
  else { _sleepLogCache.clear(); _sleepLogFetch.clear(); _sleepLogTs.clear(); }
};

export const saveSleepLog = (dateStr, logData) =>
  timed(`saveSleepLog(${dateStr})`, 'firestore', async () => {
    await setDoc(doc(db, COLLECTIONS.SLEEP_LOGS, dateStr), { ...logData, date: dateStr, createdAt: serverTimestamp() }, { merge: true });
    invalidateSleepCaches(dateStr);
  });

export const getSleepLog = (dateStr) => {
  const cached = _sleepLogCache.get(dateStr);
  const ts = _sleepLogTs.get(dateStr) || 0;
  if (_sleepLogCache.has(dateStr) && Date.now() - ts < SLEEP_LOG_TTL) return Promise.resolve(cached);
  const inFlight = _sleepLogFetch.get(dateStr);
  if (inFlight) return inFlight;

  const fetch = timed(`getSleepLog(${dateStr})`, 'firestore', async () => {
    const snap = await getDoc(doc(db, COLLECTIONS.SLEEP_LOGS, dateStr));
    const data = snap.exists() ? snap.data() : null;
    _sleepLogCache.set(dateStr, data);
    _sleepLogTs.set(dateStr, Date.now());
    return data;
  }).finally(() => { _sleepLogFetch.delete(dateStr); });

  _sleepLogFetch.set(dateStr, fetch);
  return fetch;
};

export const getLast7Nights = (count = 7) => {
  const cached = _last7Cache.get(count);
  const ts = _last7Ts.get(count) || 0;
  if (cached && Date.now() - ts < LAST7_TTL) return Promise.resolve(cached);
  const inFlight = _last7Fetch.get(count);
  if (inFlight) return inFlight;

  const fetch = timed(`getLast7Nights(${count})`, 'firestore', async () => {
    const q = query(collection(db, COLLECTIONS.SLEEP_LOGS), orderBy('date', 'desc'), limit(count));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => d.data());
    _last7Cache.set(count, data);
    _last7Ts.set(count, Date.now());
    return data;
  }).finally(() => { _last7Fetch.delete(count); });

  _last7Fetch.set(count, fetch);
  return fetch;
};

export const getAllSleepLogs = () =>
  timed('getAllSleepLogs', 'firestore', async () => {
    const q = query(collection(db, COLLECTIONS.SLEEP_LOGS), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  });

export const getSettings = () => {
  if (_settingsCache) return Promise.resolve(_settingsCache);
  if (_settingsFetch) return _settingsFetch;
  _settingsFetch = timed('getSettings', 'firestore', async () => {
    const snap = await getDoc(doc(db, COLLECTIONS.SETTINGS, DEFAULTS.SETTINGS_DOC_ID));
    _settingsCache = snap.exists() ? snap.data() : {
      targetSleepTime: DEFAULTS.TARGET_SLEEP_TIME,
      targetWakeTime: DEFAULTS.TARGET_WAKE_TIME,
      fixedRoutineItems: DEFAULTS.FIXED_ROUTINE_ITEMS,
      currentCourse: DEFAULTS.CURRENT_COURSE,
    };
    return _settingsCache;
  }).finally(() => { _settingsFetch = null; });
  return _settingsFetch;
};

export const saveSettings = (settings) =>
  timed('saveSettings', 'firestore', async () => {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, DEFAULTS.SETTINGS_DOC_ID), settings, { merge: true });
    _settingsCache = settings;
    _settingsFetch = null;
  });
