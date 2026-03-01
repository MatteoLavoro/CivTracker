// Firebase Main Export File
// This file exports all Firebase services for easy importing

// Firebase App
export { app, firebaseConfig } from "./config";

// Authentication
export {
  auth,
  signUp,
  signIn,
  signInWithGoogle,
  logOut,
  resetPassword,
  onAuthChange,
  getCurrentUser,
  updateUserProfile,
} from "./auth";

// Firestore Database
export {
  db,
  createDocument,
  setDocument,
  getDocument,
  getCollection,
  updateDocument,
  deleteDocument,
  queryDocuments,
  subscribeToDocument,
  subscribeToCollection,
} from "./firestore";

// Storage
export {
  storage,
  uploadFile,
  uploadFileWithProgress,
  getFileURL,
  deleteFile,
  listFiles,
} from "./storage";
