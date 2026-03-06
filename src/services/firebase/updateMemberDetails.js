// Update Member Details Service
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./config";

/**
 * Update member details across all campaigns when user profile changes
 * @param {string} userId - User ID
 * @param {Object} updates - Object with fields to update (username, photoURL)
 * @returns {Object} { success, error }
 */
export const updateMemberDetailsInCampaigns = async (userId, updates) => {
  try {
    // Find all campaigns where user is a member
    const campaignsRef = collection(db, "campaigns");
    const q = query(campaignsRef, where("members", "array-contains", userId));
    const querySnapshot = await getDocs(q);

    // Update each campaign's memberDetails and match participants
    const updatePromises = querySnapshot.docs.map(async (campaignDoc) => {
      const campaignRef = doc(db, "campaigns", campaignDoc.id);
      const campaignData = campaignDoc.data();
      const updateData = {};

      // Build update object for nested memberDetails
      if (updates.username !== undefined) {
        updateData[`memberDetails.${userId}.username`] = updates.username;
      }
      if (updates.photoURL !== undefined) {
        updateData[`memberDetails.${userId}.photoURL`] = updates.photoURL;
      }

      // Update participants in all matches for this user
      if (campaignData.matches && Array.isArray(campaignData.matches)) {
        const updatedMatches = campaignData.matches.map((match) => {
          if (match.participants && match.participants[userId]) {
            return {
              ...match,
              participants: {
                ...match.participants,
                [userId]: {
                  ...match.participants[userId],
                  ...(updates.username !== undefined && {
                    username: updates.username,
                  }),
                  ...(updates.photoURL !== undefined && {
                    photoURL: updates.photoURL,
                  }),
                },
              },
            };
          }
          return match;
        });
        updateData.matches = updatedMatches;
      }

      if (Object.keys(updateData).length > 0) {
        updateData.updatedAt = new Date().toISOString();
        await updateDoc(campaignRef, updateData);
      }
    });

    await Promise.all(updatePromises);

    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating member details:", error);
    return { success: false, error: error.message };
  }
};
