// Firebase Authentication Service
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { app } from "./config";

// Initialize Firebase Authentication
const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// User-facing messages for the most common Firebase Auth errors
const AUTH_ERROR_MESSAGES = {
  "auth/invalid-email": "Email non valida",
  "auth/user-not-found": "Email o password errati",
  "auth/wrong-password": "Email o password errati",
  "auth/invalid-credential": "Email o password errati",
  "auth/user-disabled": "Questo account è stato disabilitato",
  "auth/email-already-in-use": "Questa email è già registrata",
  "auth/weak-password": "La password deve avere almeno 6 caratteri",
  "auth/too-many-requests": "Troppi tentativi. Riprova più tardi.",
  "auth/network-request-failed":
    "Problema di rete. Controlla la connessione e riprova.",
  "auth/popup-closed-by-user": "Accesso annullato",
};

/**
 * Convert a Firebase Auth error into an Italian user-facing message
 * @param {Object} error - Firebase error
 * @returns {string} Friendly message
 */
const getAuthErrorMessage = (error) => {
  if (error?.code && AUTH_ERROR_MESSAGES[error.code]) {
    return AUTH_ERROR_MESSAGES[error.code];
  }
  return "Si è verificato un errore. Riprova.";
};

// Sign up with email and password
export const signUp = async (email, password, displayName = null) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error("Error signing up:", error);
    return { user: null, error: getAuthErrorMessage(error) };
  }
};

// Sign in with email and password
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error("Error signing in:", error);
    return { user: null, error: getAuthErrorMessage(error) };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    console.error("Error signing in with Google:", error);
    return { user: null, error: getAuthErrorMessage(error) };
  }
};

// Sign out
export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Auth state observer
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Update user profile (displayName)
// LIMIT: Maximum 30 characters for displayName (validated in UI)
export const updateUserProfile = async (displayName, photoURL = null) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { error: "No user logged in" };
    }

    const updates = { displayName };
    if (photoURL !== null) {
      updates.photoURL = photoURL;
    }

    await updateProfile(user, updates);

    // Force reload to sync the context
    await user.reload();

    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export { auth };
