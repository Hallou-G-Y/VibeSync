import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB-dXjOo_g2XP4AS7eEEIMcS0yxAcoBBJA",
  authDomain: "vibesync-2ff1c.firebaseapp.com",
  projectId: "vibesync-2ff1c",
  storageBucket: "vibesync-2ff1c.firebasestorage.app",
  messagingSenderId: "394857428818",
  appId: "1:394857428818:web:a6d532bd08600c2f49ac8b",
  measurementId: "G-S11XG5V7KE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);