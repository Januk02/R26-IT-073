// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
const analytics = getAnalytics(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Cloud Firestore
const db = getFirestore(app);

export { app, auth, db, analytics };
