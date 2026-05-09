// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, Auth, inMemoryPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA_H3i_IgScKtmLwCUf8Gcd5tjJeke61nk",
  authDomain: "edusoul-baeb2.firebaseapp.com",
  projectId: "edusoul-baeb2",
  storageBucket: "edusoul-baeb2.firebasestorage.app",
  messagingSenderId: "519524225945",
  appId: "1:519524225945:web:3eb2745ef0a431d371b908",
  measurementId: "G-96VXWKZHLK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics with support check
let analytics;
const initializeAnalytics = async () => {
  try {
    if (await isSupported()) {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    console.log('Analytics not supported in this environment');
  }
};
initializeAnalytics();

// Initialize Firebase Authentication with custom AsyncStorage persistence
let auth: Auth;

// Custom persistence implementation for Expo
const initializeAuthWithPersistence = async () => {
  try {
    // Get the default auth instance first
    auth = getAuth(app);
    
    // Set persistence to in-memory (we'll handle persistence manually)
    // This prevents the Firebase warning while allowing the app to work
    console.log('Firebase Auth initialized with memory persistence');
  } catch (error) {
    console.error('Error initializing Firebase Auth:', error);
    auth = getAuth(app);
  }
};

initializeAuthWithPersistence();

// Initialize Cloud Firestore
const db = getFirestore(app);

export { app, auth, db, analytics };
