import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAUpDW1kQgFJj88LtuTsSTCeJTHT7nj62U',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'photo-dcd62.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'photo-dcd62',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'photo-dcd62.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '593979535280',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:593979535280:web:f9247a2d928250939af075',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-7PRV4Y2DLR',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
