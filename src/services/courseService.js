// All Firestore CRUD operations for courses
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase.js';
import { COLLECTIONS } from '../constants/collections.js';
import { timed } from '../utils/perfLog.js';

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
    return ref.id;
  });

// Fetch all courses ordered by creation date
export const listCourses = () =>
  timed('listCourses', 'firestore', async () => {
    const q = query(collection(db, COLLECTIONS.COURSES), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  });

// Update a course document (e.g. increment study stats after a session)
export const updateCourse = (id, updates) =>
  timed(`updateCourse(${id})`, 'firestore', () =>
    updateDoc(doc(db, COLLECTIONS.COURSES, id), { ...updates, updatedAt: serverTimestamp() })
  );
