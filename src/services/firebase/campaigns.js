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
 * @param {string} photoURL - User's photo URL (optional)
 * @returns {Object} { campaign, error }
 */
export const createCampaign = async (
  name,
  userId,
  username,
  photoURL = null,
) => {
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
      status: "not-started",
      statusVotes: {},
      members: [userId],
      memberDetails: {
        [userId]: {
          username,
          photoURL: photoURL || null,
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
 * @param {string} photoURL - User's photo URL (optional)
 * @returns {Object} { campaign, error }
 */
export const joinCampaign = async (code, userId, username, photoURL = null) => {
  try {
    const campaign = await getCampaignByCode(code);

    if (!campaign) {
      return { campaign: null, error: "Campagna non trovata" };
    }

    // Check if user is already a member
    if (campaign.members.includes(userId)) {
      return { campaign: null, error: "Sei già membro di questa campagna" };
    }

    // Check if campaign is in progress - block joining
    if (campaign.status === "in-progress") {
      return {
        campaign: null,
        error: "Non puoi entrare in una campagna in corso",
      };
    }

    // Add user to campaign
    const campaignRef = doc(db, "campaigns", campaign.id);

    // Prepare base update object
    const updateData = {
      members: arrayUnion(userId),
      [`memberDetails.${userId}`]: {
        username,
        photoURL: photoURL || null,
        joinedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };

    // If there's an active match, add the new member to it
    const matches = Array.isArray(campaign.matches) ? campaign.matches : [];
    if (matches.length > 0) {
      const currentMatch = matches[matches.length - 1];
      if (currentMatch.status === "in-progress") {
        // Clone the matches array and add the new participant to the last match
        const updatedMatches = [...matches];
        updatedMatches[updatedMatches.length - 1] = {
          ...currentMatch,
          participants: {
            ...currentMatch.participants,
            [userId]: {
              username,
              leaderId: null,
              score: 0,
            },
          },
        };
        updateData.matches = updatedMatches;
      }
    }

    await updateDoc(campaignRef, updateData);

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

    // Check if campaign is in progress - block leaving
    if (campaign.status === "in-progress") {
      return {
        success: false,
        error: "Non puoi uscire da una campagna in corso",
      };
    }

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
 * Toggle campaign important/starred status
 * @param {string} campaignId - Campaign ID
 * @param {boolean} isImportant - Whether campaign is marked as important
 * @returns {Object} { success, error }
 */
export const toggleCampaignImportant = async (campaignId, isImportant) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);
    await updateDoc(campaignRef, {
      isImportant: isImportant,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Error toggling campaign important:", error);
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

/**
 * Vote for campaign status change
 * @param {string} campaignId - Campaign ID
 * @param {string} userId - User ID voting
 * @param {string} desiredStatus - Desired status ("not-started", "in-progress", "completed")
 * @returns {Object} { success, statusChanged, error }
 */
export const voteForCampaignStatus = async (
  campaignId,
  userId,
  desiredStatus,
) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);
    const campaignDoc = await getDoc(campaignRef);

    if (!campaignDoc.exists()) {
      return {
        success: false,
        statusChanged: false,
        error: "Campaign not found",
      };
    }

    const campaign = campaignDoc.data();
    const currentStatus = campaign.status || "not-started";
    const members = campaign.members || [];

    // Don't allow voting if already at desired status
    if (currentStatus === desiredStatus) {
      return {
        success: false,
        statusChanged: false,
        error: "La campagna è già in questo stato",
      };
    }

    // Don't allow going back from completed
    if (currentStatus === "completed") {
      return {
        success: false,
        statusChanged: false,
        error: "Non si può cambiare lo stato di una campagna terminata",
      };
    }

    // Initialize or get current votes
    const statusVotes = campaign.statusVotes || {};
    const currentVoteData = statusVotes[desiredStatus] || { voters: [] };

    // Check if user already voted for this status
    if (currentVoteData.voters.includes(userId)) {
      return {
        success: false,
        statusChanged: false,
        error: "Hai già votato per questo stato",
      };
    }

    // Add user's vote
    const updatedVoters = [...currentVoteData.voters, userId];

    // Check if all members have voted
    const allVoted = members.every((memberId) =>
      updatedVoters.includes(memberId),
    );

    if (allVoted) {
      // All members voted - apply status change and reset votes
      await updateDoc(campaignRef, {
        status: desiredStatus,
        statusVotes: {},
        updatedAt: new Date().toISOString(),
      });

      return { success: true, statusChanged: true, error: null };
    } else {
      // Update votes only
      await updateDoc(campaignRef, {
        [`statusVotes.${desiredStatus}`]: {
          voters: updatedVoters,
        },
        updatedAt: new Date().toISOString(),
      });

      return { success: true, statusChanged: false, error: null };
    }
  } catch (error) {
    console.error("Error voting for campaign status:", error);
    return { success: false, statusChanged: false, error: error.message };
  }
};

/**
 * Revoke vote for campaign status change
 * @param {string} campaignId - Campaign ID
 * @param {string} userId - User ID revoking vote
 * @param {string} statusVotedFor - Status user voted for
 * @returns {Object} { success, error }
 */
export const revokeStatusVote = async (campaignId, userId, statusVotedFor) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);
    const campaignDoc = await getDoc(campaignRef);

    if (!campaignDoc.exists()) {
      return { success: false, error: "Campaign not found" };
    }

    const campaign = campaignDoc.data();
    const statusVotes = campaign.statusVotes || {};
    const currentVoteData = statusVotes[statusVotedFor] || { voters: [] };

    // Remove user from voters
    const updatedVoters = currentVoteData.voters.filter((id) => id !== userId);

    if (updatedVoters.length === 0) {
      // No more voters - remove the vote entry entirely
      const updatedStatusVotes = { ...statusVotes };
      delete updatedStatusVotes[statusVotedFor];

      await updateDoc(campaignRef, {
        statusVotes: updatedStatusVotes,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Update voters list
      await updateDoc(campaignRef, {
        [`statusVotes.${statusVotedFor}`]: {
          voters: updatedVoters,
        },
        updatedAt: new Date().toISOString(),
      });
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Error revoking status vote:", error);
    return { success: false, error: error.message };
  }
};
