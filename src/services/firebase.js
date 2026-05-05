// Firebase initialization — project: lifetracker-app-2026
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDOei68op60dem3XdJJmJWZWitN9DO2iWY",
  authDomain: "lifetracker-app-2026.firebaseapp.com",
  projectId: "lifetracker-app-2026",
  storageBucket: "lifetracker-app-2026.firebasestorage.app",
  messagingSenderId: "96064858702",
  appId: "1:96064858702:web:cd3a0b7874b3991322711f",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
