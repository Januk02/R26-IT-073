import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, memoryLocalCache, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA_H3i_IgScKtmLwCUf8Gcd5tjJeke61nk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "edusoul-baeb2.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "edusoul-baeb2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "edusoul-baeb2.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "519524225945",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:519524225945:web:3eb2745ef0a431d371b908",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-96VXWKZHLK",
};

// Initialize Firebase App instance
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Use in-memory local cache to completely eliminate browser IndexedDB lock/corruption issues (app/idb-open)
let db;
try {
  db = initializeFirestore(app, {
    localCache: memoryLocalCache()
  });
} catch (e) {
  db = getFirestore(app);
}

export { app, auth, db };
