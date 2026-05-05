// All Firestore CRUD operations for study topics and tasks
import { collection, addDoc, doc, getDoc, getDocs, updateDoc, query, where, orderBy, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from './firebase.js';
import { COLLECTIONS } from '../constants/collections.js';
import { timed } from '../utils/perfLog.js';

export const addTopic = (topicData) =>
  timed('addTopic', 'firestore', async () => {
    const ref = await addDoc(collection(db, COLLECTIONS.STUDY_TOPICS), { ...topicData, createdAt: serverTimestamp() });
    return ref.id;
  });

export const getTopic = (id) =>
  timed(`getTopic(${id})`, 'firestore', async () => {
    const snap = await getDoc(doc(db, COLLECTIONS.STUDY_TOPICS, id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  });

export const listTopics = () =>
  timed('listTopics', 'firestore', async () => {
    const q = query(collection(db, COLLECTIONS.STUDY_TOPICS), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  });

export const addTask = (taskData) =>
  timed('addTask', 'firestore', async () => {
    const ref = await addDoc(collection(db, COLLECTIONS.STUDY_TASKS), { ...taskData, done: false, createdAt: serverTimestamp() });
    return ref.id;
  });

export const updateTask = (id, updates) =>
  timed(`updateTask(${id})`, 'firestore', () =>
    updateDoc(doc(db, COLLECTIONS.STUDY_TASKS, id), updates)
  );

export const deleteTask = (id) =>
  timed(`deleteTask(${id})`, 'firestore', () =>
    deleteDoc(doc(db, COLLECTIONS.STUDY_TASKS, id))
  );

export const listTasksByDate = (dateStr) =>
  timed(`listTasksByDate(${dateStr})`, 'firestore', async () => {
    const q = query(
      collection(db, COLLECTIONS.STUDY_TASKS),
      where('scheduledDate', '==', dateStr),
      orderBy('createdAt', 'asc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  });

export const listAllTasks = () =>
  timed('listAllTasks', 'firestore', async () => {
    const q = query(collection(db, COLLECTIONS.STUDY_TASKS), orderBy('scheduledDate', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  });
