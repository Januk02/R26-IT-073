// Firebase Configuration for Web
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA_H3i_IgScKtmLwCUf8Gcd5tjJeke61nk",
  authDomain: "edusoul-baeb2.firebaseapp.com",
  projectId: "edusoul-baeb2",
  storageBucket: "edusoul-baeb2.firebasestorage.app",
  messagingSenderId: "519524225945",
  appId: "1:519524225945:web:3eb2745ef0a431d371b908",
  measurementId: "G-96VXWKZHLK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
