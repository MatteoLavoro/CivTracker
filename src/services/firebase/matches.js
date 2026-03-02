// Firebase Matches Service
import { doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore";
import { db } from "./config";
import {
  calculateProcessedScores,
  calculateFinalScores,
  getVictoryCounts,
  BONUS_TAGS,
} from "../../utils/scoreUtils";

/**
 * Create a new match in a campaign
 * @param {string} campaignId - Campaign ID
 * @param {Array} memberIds - Array of campaign member IDs
 * @param {Object} memberDetails - Member details from campaign
 * @returns {Object} { success, match, error }
 */
export const createMatch = async (campaignId, memberIds, memberDetails) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);
    const campaignDoc = await getDoc(campaignRef);

    if (!campaignDoc.exists()) {
      return { success: false, match: null, error: "Campaign not found" };
    }

    const campaign = campaignDoc.data();
    const matches = campaign.matches || [];

    // Check if there's an active match
    const hasActiveMatch = matches.some((m) => m.status !== "completed");
    if (hasActiveMatch) {
      return {
        success: false,
        match: null,
        error: "Completa la partita corrente prima di crearne una nuova",
      };
    }

    // Create new match
    const matchId = `match-${Date.now()}`;
    const participants = {};

    memberIds.forEach((memberId) => {
      participants[memberId] = {
        username: memberDetails[memberId]?.username || "Sconosciuto",
        leaderId: null,
        score: 0,
      };
    });

    const newMatch = {
      id: matchId,
      startDate: null,
      endDate: null,
      turns: 0,
      participants,
      status: "in-progress",
      draftCompleted: false,
      createdAt: new Date().toISOString(),
    };

    // Reset draft for new match
    const newDraft = {
      phase: "waiting",
      readyPlayers: [],
      countdownStartAt: null,
      playerDrafts: {},
      playerStates: {},
      banVotes: {},
      bannedLeaders: {},
      selectedLeaders: {},
    };

    await updateDoc(campaignRef, {
      matches: arrayUnion(newMatch),
      draft: newDraft,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, match: newMatch, error: null };
  } catch (error) {
    console.error("Error creating match:", error);
    return { success: false, match: null, error: error.message };
  }
};

/**
 * Update match turns
 * @param {string} campaignId - Campaign ID
 * @param {string} matchId - Match ID
 * @param {number} turns - Number of turns
 * @returns {Object} { success, error }
 */
export const updateMatchTurns = async (campaignId, matchId, turns) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);
    const campaignDoc = await getDoc(campaignRef);

    if (!campaignDoc.exists()) {
      return { success: false, error: "Campaign not found" };
    }

    const campaign = campaignDoc.data();
    const matches = campaign.matches || [];

    const updatedMatches = matches.map((match) => {
      if (match.id === matchId) {
        return { ...match, turns: parseInt(turns) || 0 };
      }
      return match;
    });

    await updateDoc(campaignRef, {
      matches: updatedMatches,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating match turns:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update participant score
 * @param {string} campaignId - Campaign ID
 * @param {string} matchId - Match ID
 * @param {string} participantId - Participant user ID
 * @param {number} score - Score
 * @returns {Object} { success, error }
 */
export const updateParticipantScore = async (
  campaignId,
  matchId,
  participantId,
  score,
) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);
    const campaignDoc = await getDoc(campaignRef);

    if (!campaignDoc.exists()) {
      return { success: false, error: "Campaign not found" };
    }

    const campaign = campaignDoc.data();
    const matches = campaign.matches || [];

    const updatedMatches = matches.map((match) => {
      if (match.id === matchId) {
        return {
          ...match,
          participants: {
            ...match.participants,
            [participantId]: {
              ...match.participants[participantId],
              score: parseInt(score) || 0,
            },
          },
        };
      }
      return match;
    });

    await updateDoc(campaignRef, {
      matches: updatedMatches,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating participant score:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Complete match (mark as finished) with all details
 * @param {string} campaignId - Campaign ID
 * @param {string} matchId - Match ID
 * @param {number} turns - Final turn count
 * @param {Object} scores - Raw scores for all participants { userId: score }
 * @param {Object} bonusTags - Bonus tags for all participants { userId: [tagIds] }
 * @param {string} winnerId - Winner user ID
 * @param {string} victoryType - Victory type ID
 * @returns {Object} { success, error }
 */
export const completeMatch = async (
  campaignId,
  matchId,
  turns,
  scores,
  bonusTags,
  winnerId,
  victoryType,
) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);
    const campaignDoc = await getDoc(campaignRef);

    if (!campaignDoc.exists()) {
      return { success: false, error: "Campaign not found" };
    }

    const campaign = campaignDoc.data();
    const matches = campaign.matches || [];

    const updatedMatches = matches.map((match) => {
      if (match.id === matchId) {
        // Update participant raw scores and bonus tags
        const updatedParticipants = { ...match.participants };
        Object.keys(scores).forEach((userId) => {
          if (updatedParticipants[userId]) {
            updatedParticipants[userId].score = scores[userId];
            updatedParticipants[userId].bonusTags = bonusTags[userId] || [];
          }
        });

        // Calculate victory counts (excluding this match)
        const victoryCounts = getVictoryCounts(
          matches.filter((m) => m.id !== matchId),
        );

        // Calculate processed scores
        const processedScores = calculateProcessedScores(
          updatedParticipants,
          winnerId,
          victoryType,
          victoryCounts,
        );

        // Calculate final scores with bonus tags (now fully manual)
        const finalScores = calculateFinalScores(
          processedScores,
          updatedParticipants,
        );

        // Add processed and final scores to participants
        Object.keys(processedScores).forEach((userId) => {
          if (updatedParticipants[userId]) {
            updatedParticipants[userId].processedScore =
              processedScores[userId];
            updatedParticipants[userId].finalScore = finalScores[userId];
          }
        });

        return {
          ...match,
          status: "completed",
          endDate: new Date().toISOString(),
          turns: turns,
          participants: updatedParticipants,
          winnerId: winnerId,
          victoryType: victoryType,
        };
      }
      return match;
    });

    await updateDoc(campaignRef, {
      matches: updatedMatches,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Error completing match:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Link draft results to current match
 * @param {string} campaignId - Campaign ID
 * @param {string} matchId - Match ID
 * @param {Object} selectedLeaders - Draft selected leaders { userId: leaderId }
 * @returns {Object} { success, error }
 */
export const linkDraftToMatch = async (
  campaignId,
  matchId,
  selectedLeaders,
) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);
    const campaignDoc = await getDoc(campaignRef);

    if (!campaignDoc.exists()) {
      return { success: false, error: "Campaign not found" };
    }

    const campaign = campaignDoc.data();
    const matches = campaign.matches || [];

    const updatedMatches = matches.map((match) => {
      if (match.id === matchId) {
        const updatedParticipants = { ...match.participants };

        Object.keys(selectedLeaders).forEach((userId) => {
          if (updatedParticipants[userId]) {
            updatedParticipants[userId].leaderId = selectedLeaders[userId];
          }
        });

        return {
          ...match,
          participants: updatedParticipants,
          draftCompleted: true,
        };
      }
      return match;
    });

    await updateDoc(campaignRef, {
      matches: updatedMatches,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Error linking draft to match:", error);
    return { success: false, error: error.message };
  }
};
