// Firebase Configuration
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// In production, consider using environment variables
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyAgIPKkYjlHMBym97HxmNbAViX8HvNwtAA",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "civtracker-1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "civtracker-1",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "civtracker-1.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "429014043781",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:429014043781:web:d80b66bf4213ca940dadec",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { app, db, firebaseConfig };
