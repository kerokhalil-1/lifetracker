// All Firestore CRUD operations for courses
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, serverTimestamp, increment } from 'firebase/firestore';
import { db } from './firebase.js';
import { COLLECTIONS } from '../constants/collections.js';
import { timed } from '../utils/perfLog.js';

// Module-level cache — courses change rarely; shared by CoursePickerModal and any dashboard widget
let _coursesCache = null;
let _coursesFetch = null;
const invalidateCourses = () => { _coursesCache = null; _coursesFetch = null; };

// Create a new course document
export const addCourse = (data) =>
  timed('addCourse', 'firestore', async () => {
    const ref = await addDoc(collection(db, COLLECTIONS.COURSES), {
      ...data,
      totalStudySeconds: 0,
      sessionCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    invalidateCourses();
    return ref.id;
  });

// Fetch all courses ordered by creation date — cached for the session
export const listCourses = () => {
  if (_coursesCache) return Promise.resolve(_coursesCache);
  if (_coursesFetch) return _coursesFetch;
  _coursesFetch = timed('listCourses', 'firestore', async () => {
    const q = query(collection(db, COLLECTIONS.COURSES), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    _coursesCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return _coursesCache;
  }).finally(() => { _coursesFetch = null; }); // bug #6: clear on error too, so next call retries
  return _coursesFetch;
};

// Update a course document (e.g. rename, edit fields)
export const updateCourse = (id, updates) =>
  timed(`updateCourse(${id})`, 'firestore', () => {
    invalidateCourses();
    return updateDoc(doc(db, COLLECTIONS.COURSES, id), { ...updates, updatedAt: serverTimestamp() });
  });

// Atomically increment course study totals after a session finishes.
// Uses Firestore increment() so concurrent finishes never overwrite each other.
export const incrementCourseStats = (id, addedSeconds) =>
  timed(`incrementCourseStats(${id})`, 'firestore', () => {
    invalidateCourses();
    return updateDoc(doc(db, COLLECTIONS.COURSES, id), {
      totalStudySeconds: increment(addedSeconds),
      sessionCount: increment(1),
      updatedAt: serverTimestamp(),
    });
  });
