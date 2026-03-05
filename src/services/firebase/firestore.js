// Firebase Firestore Service
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { app } from "./config";

// Initialize Firestore
const db = getFirestore(app);

// Create a new document with auto-generated ID
export const createDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

// Create or update a document with custom ID
export const setDocument = async (
  collectionName,
  documentId,
  data,
  merge = true,
) => {
  try {
    await setDoc(
      doc(db, collectionName, documentId),
      {
        ...data,
        updatedAt: new Date().toISOString(),
      },
      { merge },
    );
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Get a single document
export const getDocument = async (collectionName, documentId) => {
  try {
    const docSnap = await getDoc(doc(db, collectionName, documentId));
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
    } else {
      return { data: null, error: "Document not found" };
    }
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Get all documents from a collection
export const getCollection = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const documents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { data: documents, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Update a document
export const updateDocument = async (collectionName, documentId, data) => {
  try {
    await updateDoc(doc(db, collectionName, documentId), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Delete a document
export const deleteDocument = async (collectionName, documentId) => {
  try {
    await deleteDoc(doc(db, collectionName, documentId));
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Query documents
export const queryDocuments = async (collectionName, conditions = []) => {
  try {
    let q = collection(db, collectionName);

    if (conditions.length > 0) {
      const queryConstraints = conditions
        .map((condition) => {
          if (condition.type === "where") {
            return where(condition.field, condition.operator, condition.value);
          } else if (condition.type === "orderBy") {
            return orderBy(condition.field, condition.direction || "asc");
          } else if (condition.type === "limit") {
            return limit(condition.value);
          }
          return null;
        })
        .filter(Boolean);

      q = query(q, ...queryConstraints);
    }

    const querySnapshot = await getDocs(q);
    const documents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { data: documents, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Real-time listener for a document
export const subscribeToDocument = (collectionName, documentId, callback) => {
  return onSnapshot(
    doc(db, collectionName, documentId),
    (doc) => {
      if (doc.exists()) {
        const data = { id: doc.id, ...doc.data() };
        console.log(
          `[Real-time Update] ${collectionName}/${documentId}:`,
          data,
        );
        callback(data);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Error listening to document:", error);
    },
  );
};

// Real-time listener for a collection
export const subscribeToCollection = (
  collectionName,
  callback,
  conditions = [],
) => {
  let q = collection(db, collectionName);

  if (conditions.length > 0) {
    const queryConstraints = conditions
      .map((condition) => {
        if (condition.type === "where") {
          return where(condition.field, condition.operator, condition.value);
        } else if (condition.type === "orderBy") {
          return orderBy(condition.field, condition.direction || "asc");
        } else if (condition.type === "limit") {
          return limit(condition.value);
        }
        return null;
      })
      .filter(Boolean);

    q = query(q, ...queryConstraints);
  }

  return onSnapshot(
    q,
    (querySnapshot) => {
      const documents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(documents);
    },
    (error) => {
      console.error("Error listening to collection:", error);
    },
  );
};

export { db };
