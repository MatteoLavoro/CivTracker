// Firebase Campaigns Service
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "./config";
import {
  generateCampaignCode,
  isValidCampaignCode,
} from "../../utils/campaignUtils";

/**
 * Create a new campaign
 * @param {string} name - Campaign name
 * @param {string} userId - User ID of creator
 * @param {string} username - Username of creator
 * @returns {Object} { campaign, error }
 */
export const createCampaign = async (name, userId, username) => {
  try {
    // Generate unique code
    let code = generateCampaignCode();
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure code is unique
    while (!isUnique && attempts < maxAttempts) {
      const existingCampaign = await getCampaignByCode(code);
      if (!existingCampaign) {
        isUnique = true;
      } else {
        code = generateCampaignCode();
        attempts++;
      }
    }

    if (!isUnique) {
      return { campaign: null, error: "Failed to generate unique code" };
    }

    // Create campaign document
    const campaignId = doc(collection(db, "campaigns")).id;
    const campaign = {
      id: campaignId,
      name,
      code,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members: [userId],
      memberDetails: {
        [userId]: {
          username,
          joinedAt: new Date().toISOString(),
        },
      },
    };

    await setDoc(doc(db, "campaigns", campaignId), campaign);

    return { campaign, error: null };
  } catch (error) {
    console.error("Error creating campaign:", error);
    return { campaign: null, error: error.message };
  }
};

/**
 * Get campaign by code
 * @param {string} code - Campaign code
 * @returns {Object|null} Campaign or null if not found
 */
export const getCampaignByCode = async (code) => {
  try {
    if (!isValidCampaignCode(code)) {
      return null;
    }

    const q = query(
      collection(db, "campaigns"),
      where("code", "==", code.toUpperCase()),
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const campaignDoc = querySnapshot.docs[0];
    return { id: campaignDoc.id, ...campaignDoc.data() };
  } catch (error) {
    console.error("Error getting campaign by code:", error);
    return null;
  }
};

/**
 * Join a campaign
 * @param {string} code - Campaign code
 * @param {string} userId - User ID
 * @param {string} username - Username
 * @returns {Object} { campaign, error }
 */
export const joinCampaign = async (code, userId, username) => {
  try {
    const campaign = await getCampaignByCode(code);

    if (!campaign) {
      return { campaign: null, error: "Campagna non trovata" };
    }

    // Check if user is already a member
    if (campaign.members.includes(userId)) {
      return { campaign: null, error: "Sei già membro di questa campagna" };
    }

    // Add user to campaign
    const campaignRef = doc(db, "campaigns", campaign.id);
    await updateDoc(campaignRef, {
      members: arrayUnion(userId),
      [`memberDetails.${userId}`]: {
        username,
        joinedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    });

    // Get updated campaign
    const updatedCampaign = await getDoc(campaignRef);

    return {
      campaign: { id: updatedCampaign.id, ...updatedCampaign.data() },
      error: null,
    };
  } catch (error) {
    console.error("Error joining campaign:", error);
    return { campaign: null, error: error.message };
  }
};

/**
 * Leave a campaign
 * @param {string} campaignId - Campaign ID
 * @param {string} userId - User ID
 * @returns {Object} { success, error }
 */
export const leaveCampaign = async (campaignId, userId) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);
    const campaignDoc = await getDoc(campaignRef);

    if (!campaignDoc.exists()) {
      return { success: false, error: "Campagna non trovata" };
    }

    const campaign = campaignDoc.data();

    // If user is the last member, delete the campaign
    if (campaign.members.length === 1 && campaign.members[0] === userId) {
      await deleteDoc(campaignRef);
      return { success: true, error: null, deleted: true };
    }

    // Remove user from campaign
    await updateDoc(campaignRef, {
      members: arrayRemove(userId),
      [`memberDetails.${userId}`]: null,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, error: null, deleted: false };
  } catch (error) {
    console.error("Error leaving campaign:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update campaign name
 * @param {string} campaignId - Campaign ID
 * @param {string} newName - New campaign name
 * @returns {Object} { success, error }
 */
export const updateCampaignName = async (campaignId, newName) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);
    await updateDoc(campaignRef, {
      name: newName,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating campaign name:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user campaigns
 * @param {string} userId - User ID
 * @returns {Object} { campaigns, error }
 */
export const getUserCampaigns = async (userId) => {
  try {
    const q = query(
      collection(db, "campaigns"),
      where("members", "array-contains", userId),
    );
    const querySnapshot = await getDocs(q);

    const campaigns = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { campaigns, error: null };
  } catch (error) {
    console.error("Error getting user campaigns:", error);
    return { campaigns: [], error: error.message };
  }
};
