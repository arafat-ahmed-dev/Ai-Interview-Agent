import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBGoL_OlanLaMtVLS8ijfByTg37uxzs8Qc",
  authDomain: "prepwise-95a46.firebaseapp.com",
  projectId: "prepwise-95a46",
  storageBucket: "prepwise-95a46.firebasestorage.app",
  messagingSenderId: "665009971794",
  appId: "1:665009971794:web:77ca4676d82a3306b0b58b",
  measurementId: "G-K424E3CMS1",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
