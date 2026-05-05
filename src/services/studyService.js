// All Firestore CRUD operations for study topics and tasks
import {
  collection, addDoc, doc, getDoc, getDocs, updateDoc,
  query, where, orderBy, serverTimestamp, deleteDoc
} from 'firebase/firestore';
import { db } from './firebase.js';
import { COLLECTIONS } from '../constants/collections.js';

// Add a new study topic
export const addTopic = async (topicData) => {
  try {
    const ref = await addDoc(collection(db, COLLECTIONS.STUDY_TOPICS), {
      ...topicData,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (err) {
    console.error('addTopic error:', err);
    throw err;
  }
};

// Fetch a single study topic by ID
export const getTopic = async (id) => {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.STUDY_TOPICS, id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    console.error('getTopic error:', err);
    throw err;
  }
};

// List all study topics ordered by date descending
export const listTopics = async () => {
  try {
    const q = query(collection(db, COLLECTIONS.STUDY_TOPICS), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('listTopics error:', err);
    throw err;
  }
};

// Add a new study task
export const addTask = async (taskData) => {
  try {
    const ref = await addDoc(collection(db, COLLECTIONS.STUDY_TASKS), {
      ...taskData,
      done: false,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (err) {
    console.error('addTask error:', err);
    throw err;
  }
};

// Update a study task (e.g., mark done)
export const updateTask = async (id, updates) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.STUDY_TASKS, id), updates);
  } catch (err) {
    console.error('updateTask error:', err);
    throw err;
  }
};

// Delete a study task
export const deleteTask = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.STUDY_TASKS, id));
  } catch (err) {
    console.error('deleteTask error:', err);
    throw err;
  }
};

// List tasks for a specific date
export const listTasksByDate = async (dateStr) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.STUDY_TASKS),
      where('scheduledDate', '==', dateStr),
      orderBy('createdAt', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('listTasksByDate error:', err);
    throw err;
  }
};

// List all study tasks
export const listAllTasks = async () => {
  try {
    const q = query(collection(db, COLLECTIONS.STUDY_TASKS), orderBy('scheduledDate', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('listAllTasks error:', err);
    throw err;
  }
};
