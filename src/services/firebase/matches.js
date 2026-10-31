// Firebase Matches Service
import { doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore";
import { db } from "./config";
import {
  calculateProcessedScores,
  calculateFinalScores,
  getVictoryCounts,
} from "../../utils/scoreUtils";
import { createEmptyDraft } from "../../utils/draftUtils";

/**
 * Recalculate processed/final scores of every completed match using the
 * current victory counts. Runs after a match is completed or edited.
 * @param {Object} campaignRef - Firestore reference to the campaign
 */
const recalculateAllScores = async (campaignRef) => {
  const campaignDoc = await getDoc(campaignRef);
  if (!campaignDoc.exists()) return;

  const campaign = campaignDoc.data();
  const matches = campaign.matches || [];
  const victoryCounts = getVictoryCounts(matches);

  const recalculatedMatches = matches.map((match) => {
    const isScored =
      match.status === "completed" &&
      match.victoryType &&
      (match.victoryType === "canceled" ||
        match.victoryType === "defeat" ||
        match.winnerId);

    if (!isScored) return match;

    const participants = match.participants || {};
    const processedScores = calculateProcessedScores(
      participants,
      match.winnerId,
      match.victoryType,
      victoryCounts,
    );
    const finalScores = calculateFinalScores(processedScores, participants);

    const updatedParticipants = {};
    Object.entries(participants).forEach(([userId, participant]) => {
      updatedParticipants[userId] = {
        ...participant,
        processedScore: processedScores[userId] ?? 0,
        finalScore: finalScores[userId] ?? 0,
      };
    });

    return { ...match, participants: updatedParticipants };
  });

  await updateDoc(campaignRef, {
    matches: recalculatedMatches,
    updatedAt: new Date().toISOString(),
  });
};

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
    const existingMatches = campaign.matches || [];
    const lastMatch = existingMatches[existingMatches.length - 1];

    // Mirrors the UI rule: a new match can start only when the current one
    // is completed or its draft is already done
    if (
      lastMatch &&
      lastMatch.status === "in-progress" &&
      !lastMatch.draftCompleted
    ) {
      return {
        success: false,
        match: null,
        error: "C'è già una partita in corso in questa campagna",
      };
    }

    // Create new match
    const matchId = `match-${Date.now()}`;
    const participants = {};

    memberIds.forEach((memberId) => {
      participants[memberId] = {
        username: memberDetails[memberId]?.username || "Sconosciuto",
        photoURL: memberDetails[memberId]?.photoURL || null,
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

    await updateDoc(campaignRef, {
      matches: arrayUnion(newMatch),
      draft: createEmptyDraft(),
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
 * Update match penalties for participants
 * @param {string} campaignId - Campaign ID
 * @param {string} matchId - Match ID
 * @param {Object} penaltyTags - Penalty tags for all participants { userId: [tagIds] }
 * @returns {Object} { success, error }
 */
export const updateMatchPenalties = async (
  campaignId,
  matchId,
  penaltyTags,
) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);
    const campaignDoc = await getDoc(campaignRef);

    if (!campaignDoc.exists()) {
      return { success: false, error: "Campaign not found" };
    }

    const campaign = campaignDoc.data();
    const matches = campaign.matches || [];

    // Update penaltyTags for participants (immutably)
    const updatedMatches = matches.map((match) => {
      if (match.id !== matchId) return match;

      const updatedParticipants = {};
      Object.entries(match.participants || {}).forEach(
        ([userId, participant]) => {
          updatedParticipants[userId] = penaltyTags[userId]
            ? { ...participant, penaltyTags: penaltyTags[userId] }
            : participant;
        },
      );

      return {
        ...match,
        participants: updatedParticipants,
      };
    });

    await updateDoc(campaignRef, {
      matches: updatedMatches,
      updatedAt: new Date().toISOString(),
    });

    // If the match is completed, recalculate scores with the new penalties
    const updatedMatch = updatedMatches.find((m) => m.id === matchId);
    if (updatedMatch && updatedMatch.status === "completed") {
      try {
        await recalculateAllScores(campaignRef);
      } catch (error) {
        console.error(
          "Error recalculating scores after penalty update:",
          error,
        );
      }
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating match penalties:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Complete match (mark as finished) with all details
 * Also recalculates all completed matches with new victory counts
 * @param {string} campaignId - Campaign ID
 * @param {string} matchId - Match ID
 * @param {number} turns - Final turn count
 * @param {Object} scores - Raw scores for all participants { userId: score }
 * @param {Object} bonusTags - Bonus tags for all participants { userId: [tagIds] }
 * @param {string} winnerId - Winner user ID
 * @param {string} victoryType - Victory type ID
 * @param {Object} penaltyTags - Malus tags for all participants { userId: [tagIds] }
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
  penaltyTags = {},
) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);
    const campaignDoc = await getDoc(campaignRef);

    if (!campaignDoc.exists()) {
      return { success: false, error: "Campaign not found" };
    }

    const campaign = campaignDoc.data();
    const matches = campaign.matches || [];

    // PHASE 1: Save the raw result
    const matchesWithBasicUpdate = matches.map((match) => {
      if (match.id !== matchId) return match;

      const updatedParticipants = {};
      Object.entries(match.participants || {}).forEach(
        ([userId, participant]) => {
          updatedParticipants[userId] = {
            ...participant,
            score: scores[userId] ?? participant.score ?? 0,
            bonusTags: bonusTags[userId] || participant.bonusTags || [],
            penaltyTags: penaltyTags[userId] || participant.penaltyTags || [],
          };
        },
      );

      return {
        ...match,
        status: "completed",
        endDate: new Date().toISOString(),
        turns: turns,
        participants: updatedParticipants,
        winnerId: winnerId,
        victoryType: victoryType,
      };
    });

    await updateDoc(campaignRef, {
      matches: matchesWithBasicUpdate,
      updatedAt: new Date().toISOString(),
    });

    // PHASE 2: Recalculate every completed match with the new victory counts
    try {
      await recalculateAllScores(campaignRef);
    } catch (error) {
      console.error("Error calculating scores after completion:", error);
    }

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

/**
 * Acquire lock for editing a match
 * @param {string} campaignId - Campaign ID
 * @param {string} matchId - Match ID
 * @param {string} userId - User ID trying to acquire lock
 * @param {string} username - Username of the user
 * @returns {Object} { success, alreadyLocked, lockedBy, error }
 */
export const acquireMatchEditLock = async (
  campaignId,
  matchId,
  userId,
  username,
) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);
    const campaignDoc = await getDoc(campaignRef);

    if (!campaignDoc.exists()) {
      return {
        success: false,
        alreadyLocked: false,
        lockedBy: null,
        error: "Campaign not found",
      };
    }

    const campaign = campaignDoc.data();
    const matchEditLocks = campaign.matchEditLocks || {};
    const currentLock = matchEditLocks[matchId];

    // Check if this specific match is already locked by another user
    if (currentLock && currentLock.userId !== userId) {
      // Check if lock is expired (older than 5 minutes)
      const lockTime = new Date(currentLock.lockedAt).getTime();
      const now = Date.now();
      const lockAgeMinutes = (now - lockTime) / (1000 * 60);

      if (lockAgeMinutes < 5) {
        // Lock is still valid
        return {
          success: false,
          alreadyLocked: true,
          lockedBy: currentLock.username,
          error: `${currentLock.username} sta già modificando questa partita`,
        };
      }
      // Lock expired, continue to acquire
    }

    // Acquire lock for this specific match
    const updatedLocks = {
      ...matchEditLocks,
      [matchId]: {
        userId,
        username,
        lockedAt: new Date().toISOString(),
      },
    };

    await updateDoc(campaignRef, {
      matchEditLocks: updatedLocks,
      updatedAt: new Date().toISOString(),
    });

    return {
      success: true,
      alreadyLocked: false,
      lockedBy: null,
      error: null,
    };
  } catch (error) {
    console.error("Error acquiring match edit lock:", error);
    return {
      success: false,
      alreadyLocked: false,
      lockedBy: null,
      error: error.message,
    };
  }
};

/**
 * Release lock for editing a match
 * @param {string} campaignId - Campaign ID
 * @param {string} userId - User ID releasing lock
 * @returns {Object} { success, error }
 */
export const releaseMatchEditLock = async (campaignId, userId) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);
    const campaignDoc = await getDoc(campaignRef);

    if (!campaignDoc.exists()) {
      return { success: false, error: "Campaign not found" };
    }

    const campaign = campaignDoc.data();
    const matchEditLocks = campaign.matchEditLocks || {};

    // Find and release all locks owned by this user
    const updatedLocks = {};
    Object.entries(matchEditLocks).forEach(([matchId, lock]) => {
      if (lock.userId !== userId) {
        // Keep locks from other users
        updatedLocks[matchId] = lock;
      }
      // Skip locks from this user (effectively releasing them)
    });

    await updateDoc(campaignRef, {
      matchEditLocks: updatedLocks,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Error releasing match edit lock:", error);
    return { success: false, error: error.message };
  }
};
