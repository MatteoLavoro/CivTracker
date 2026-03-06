// Migration utility to add photoURL to existing match participants
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./config";

/**
 * Migrate match participants to include photoURL from memberDetails
 * This fixes matches created before photoURL was added to participants
 * @param {string} campaignId - Campaign ID
 * @returns {Object} { success, updatedCount, error }
 */
export const migrateMatchParticipantsPhotoURL = async (campaignId) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);
    const campaignDoc = await getDoc(campaignRef);

    if (!campaignDoc.exists()) {
      return { success: false, updatedCount: 0, error: "Campaign not found" };
    }

    const campaign = campaignDoc.data();
    const matches = campaign.matches || [];
    const memberDetails = campaign.memberDetails || {};

    let updatedCount = 0;
    const updatedMatches = matches.map((match) => {
      let matchUpdated = false;
      const updatedParticipants = { ...match.participants };

      Object.keys(updatedParticipants).forEach((userId) => {
        // If participant doesn't have photoURL but memberDetails has it
        if (
          updatedParticipants[userId] &&
          !updatedParticipants[userId].photoURL &&
          memberDetails[userId]?.photoURL
        ) {
          updatedParticipants[userId] = {
            ...updatedParticipants[userId],
            photoURL: memberDetails[userId].photoURL,
          };
          matchUpdated = true;
        }
      });

      if (matchUpdated) {
        updatedCount++;
        return { ...match, participants: updatedParticipants };
      }
      return match;
    });

    if (updatedCount > 0) {
      await updateDoc(campaignRef, {
        matches: updatedMatches,
        updatedAt: new Date().toISOString(),
      });
      console.log(`Migrated ${updatedCount} matches with photoURL`);
    }

    return { success: true, updatedCount, error: null };
  } catch (error) {
    console.error("Error migrating match participants:", error);
    return { success: false, updatedCount: 0, error: error.message };
  }
};
