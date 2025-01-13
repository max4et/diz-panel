import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAk9lvShj0EWEbhQi2VLsboMzT6xFaYc4k",
    authDomain: "diz1-4a127.firebaseapp.com",
    projectId: "diz1-4a127",
    storageBucket: "diz1-4a127.firebasestorage.app",
    messagingSenderId: "162685179550",
    appId: "1:162685179550:web:8188e0b135fb66ba510d8f",
    measurementId: "G-YY8XZ0ENT3"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 