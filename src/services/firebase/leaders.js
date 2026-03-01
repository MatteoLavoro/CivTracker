// Firebase Leaders Service
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./config";

/**
 * Get all leaders
 * @returns {Promise<Array>} Array of leader objects
 */
export const getAllLeaders = async () => {
  try {
    const q = query(collection(db, "leaders"), orderBy("number", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting leaders:", error);
    return [];
  }
};

/**
 * Get leader by ID
 * @param {string} leaderId - Leader document ID
 * @returns {Promise<Object|null>} Leader object or null
 */
export const getLeaderById = async (leaderId) => {
  try {
    const docRef = doc(db, "leaders", leaderId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting leader:", error);
    return null;
  }
};

/**
 * Get leaders by civilization
 * @param {string} civilization - Civilization name
 * @returns {Promise<Array>} Array of leader objects
 */
export const getLeadersByCivilization = async (civilization) => {
  try {
    const q = query(
      collection(db, "leaders"),
      where("civilization", "==", civilization),
      orderBy("number", "asc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting leaders by civilization:", error);
    return [];
  }
};

/**
 * Update leader description
 * @param {string} leaderId - Leader document ID
 * @param {string} description - New description
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const updateLeaderDescription = async (leaderId, description) => {
  try {
    const docRef = doc(db, "leaders", leaderId);
    await updateDoc(docRef, {
      description,
      updatedAt: new Date().toISOString(),
    });
    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating leader description:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update leader abilities
 * @param {string} leaderId - Leader document ID
 * @param {Array<string>} abilities - Array of ability descriptions
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const updateLeaderAbilities = async (leaderId, abilities) => {
  try {
    const docRef = doc(db, "leaders", leaderId);
    await updateDoc(docRef, {
      abilities,
      updatedAt: new Date().toISOString(),
    });
    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating leader abilities:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update leader agenda
 * @param {string} leaderId - Leader document ID
 * @param {string} agenda - Leader's agenda description
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const updateLeaderAgenda = async (leaderId, agenda) => {
  try {
    const docRef = doc(db, "leaders", leaderId);
    await updateDoc(docRef, {
      agenda,
      updatedAt: new Date().toISOString(),
    });
    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating leader agenda:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Search leaders by name
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Array of matching leaders
 */
export const searchLeaders = async (searchTerm) => {
  try {
    // Get all leaders and filter client-side (since Firestore doesn't support fuzzy search)
    const allLeaders = await getAllLeaders();
    const lowerSearch = searchTerm.toLowerCase();

    return allLeaders.filter(
      (leader) =>
        leader.name.toLowerCase().includes(lowerSearch) ||
        leader.civilization.toLowerCase().includes(lowerSearch) ||
        leader.variant?.toLowerCase().includes(lowerSearch),
    );
  } catch (error) {
    console.error("Error searching leaders:", error);
    return [];
  }
};
