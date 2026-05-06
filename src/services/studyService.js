// All Firestore CRUD operations for study topics and tasks
import { collection, addDoc, doc, getDoc, getDocs, updateDoc, query, where, orderBy, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from './firebase.js';
import { COLLECTIONS } from '../constants/collections.js';
import { timed } from '../utils/perfLog.js';

// ─── Topics cache ─────────────────────────────────────────────────────────────
// listTopics is called by useStudy (Study page + Dashboard) on every mount.
// Cache it for 5 min; invalidate when a new topic is added.
let _topicsCache = null;
let _topicsFetch = null;
const TOPICS_TTL = 5 * 60 * 1000;
let _topicsCacheTs = 0;
const invalidateTopics = () => { _topicsCache = null; _topicsFetch = null; _topicsCacheTs = 0; };

// ─── Tasks-by-date cache ──────────────────────────────────────────────────────
// listTasksByDate(dateStr) is called by useStudy + Dashboard on every mount.
// Cache per date string; invalidate on any mutation for that date.
const _tasksByDateCache = new Map(); // dateStr → data array
const _tasksByDateFetch = new Map(); // dateStr → in-flight promise
const TASKS_TTL = 5 * 60 * 1000;
const _tasksByDateTs = new Map();   // dateStr → cache timestamp
export const invalidateTasksCache = (dateStr) => {
  if (dateStr) {
    _tasksByDateCache.delete(dateStr);
    _tasksByDateFetch.delete(dateStr);
    _tasksByDateTs.delete(dateStr);
  } else {
    _tasksByDateCache.clear();
    _tasksByDateFetch.clear();
    _tasksByDateTs.clear();
  }
};

// ─── Topics ──────────────────────────────────────────────────────────────────

export const addTopic = (topicData) =>
  timed('addTopic', 'firestore', async () => {
    const ref = await addDoc(collection(db, COLLECTIONS.STUDY_TOPICS), { ...topicData, createdAt: serverTimestamp() });
    invalidateTopics();
    return ref.id;
  });

export const getTopic = (id) =>
  timed(`getTopic(${id})`, 'firestore', async () => {
    const snap = await getDoc(doc(db, COLLECTIONS.STUDY_TOPICS, id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  });

export const listTopics = () => {
  if (_topicsCache && Date.now() - _topicsCacheTs < TOPICS_TTL) return Promise.resolve(_topicsCache);
  if (_topicsFetch) return _topicsFetch;
  _topicsFetch = timed('listTopics', 'firestore', async () => {
    const q = query(collection(db, COLLECTIONS.STUDY_TOPICS), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    _topicsCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    _topicsCacheTs = Date.now();
    return _topicsCache;
  }).finally(() => { _topicsFetch = null; });
  return _topicsFetch;
};

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const addTask = (taskData) =>
  timed('addTask', 'firestore', async () => {
    const ref = await addDoc(collection(db, COLLECTIONS.STUDY_TASKS), { ...taskData, done: false, createdAt: serverTimestamp() });
    invalidateTasksCache(taskData.scheduledDate); // bust the cache for that date
    return ref.id;
  });

export const updateTask = (id, updates) =>
  timed(`updateTask(${id})`, 'firestore', () =>
    updateDoc(doc(db, COLLECTIONS.STUDY_TASKS, id), updates)
    // Note: optimistic updates in useStudy mean the cache is already stale-safe;
    // we don't bust the cache here because the hook manages state directly.
  );

export const deleteTask = (id) =>
  timed(`deleteTask(${id})`, 'firestore', () =>
    deleteDoc(doc(db, COLLECTIONS.STUDY_TASKS, id))
  );

export const listTasksByDate = (dateStr) => {
  const cached = _tasksByDateCache.get(dateStr);
  const ts = _tasksByDateTs.get(dateStr) || 0;
  if (cached && Date.now() - ts < TASKS_TTL) return Promise.resolve(cached);
  const inFlight = _tasksByDateFetch.get(dateStr);
  if (inFlight) return inFlight;

  const fetch = timed(`listTasksByDate(${dateStr})`, 'firestore', async () => {
    const q = query(
      collection(db, COLLECTIONS.STUDY_TASKS),
      where('scheduledDate', '==', dateStr),
      orderBy('createdAt', 'asc'),
    );
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    _tasksByDateCache.set(dateStr, data);
    _tasksByDateTs.set(dateStr, Date.now());
    return data;
  }).finally(() => { _tasksByDateFetch.delete(dateStr); });

  _tasksByDateFetch.set(dateStr, fetch);
  return fetch;
};

export const listAllTasks = () =>
  timed('listAllTasks', 'firestore', async () => {
    const q = query(collection(db, COLLECTIONS.STUDY_TASKS), orderBy('scheduledDate', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  });
