// Firebase Draft Service
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./config";
import {
  draftLeadersForPlayers,
  processBanVotes,
  areAllPlayersReady,
} from "../../utils/draftUtils";
import { getAllLeaders } from "./leaders";

/**
 * Initialize draft for a campaign
 * @param {string} campaignId - Campaign ID
 * @returns {Object} { success, error }
 */
export const initializeDraft = async (campaignId) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);

    await updateDoc(campaignRef, {
      draft: {
        phase: "waiting",
        readyPlayers: [],
        countdownStartAt: null,
        playerDrafts: {},
        playerStates: {},
        banVotes: {},
        bannedLeaders: {},
        selectedLeaders: {},
      },
      updatedAt: new Date().toISOString(),
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Error initializing draft:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Toggle ready status for a player
 * @param {string} campaignId - Campaign ID
 * @param {string} playerId - Player ID
 * @param {boolean} isReady - Ready status
 * @param {Array} allMembers - All campaign members
 * @returns {Object} { success, error }
 */
export const togglePlayerReady = async (
  campaignId,
  playerId,
  isReady,
  allMembers,
) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);
    const campaignDoc = await getDoc(campaignRef);

    if (!campaignDoc.exists()) {
      return { success: false, error: "Campaign not found" };
    }

    const campaign = campaignDoc.data();
    const draft = campaign.draft || {
      phase: "waiting",
      readyPlayers: [],
    };

    let readyPlayers = draft.readyPlayers || [];

    if (isReady) {
      // Add player to ready list if not already there
      if (!readyPlayers.includes(playerId)) {
        readyPlayers.push(playerId);
      }
    } else {
      // Remove player from ready list
      readyPlayers = readyPlayers.filter((id) => id !== playerId);
    }

    // Check if all players are ready
    const allReady = areAllPlayersReady(readyPlayers, allMembers);
    const newPhase = allReady ? "countdown" : "waiting";
    const countdownStartAt = allReady ? new Date().toISOString() : null;

    await updateDoc(campaignRef, {
      "draft.readyPlayers": readyPlayers,
      "draft.phase": newPhase,
      "draft.countdownStartAt": countdownStartAt,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Error toggling ready status:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Execute the draft - assign random leaders to all players
 * Excludes leaders that have been drafted before in this campaign
 * @param {string} campaignId - Campaign ID
 * @param {Array} playerIds - Array of player IDs
 * @returns {Object} { success, error }
 */
export const executeDraft = async (campaignId, playerIds) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);
    const campaignDoc = await getDoc(campaignRef);

    if (!campaignDoc.exists()) {
      return { success: false, error: "Campaign not found" };
    }

    const campaign = campaignDoc.data();
    const matches = campaign.matches || [];

    // Get all leaders
    const allLeaders = await getAllLeaders();

    if (!allLeaders || allLeaders.length < playerIds.length * 5) {
      return {
        success: false,
        error: "Non ci sono abbastanza leader nel database",
      };
    }

    // Collect leaders used by EACH player individually
    const playerUsedLeaders = {};
    playerIds.forEach((playerId) => {
      playerUsedLeaders[playerId] = new Set();
    });

    matches.forEach((match) => {
      if (match.draftHistory) {
        Object.entries(match.draftHistory).forEach(
          ([playerId, playerDraft]) => {
            if (playerDraft.draftedLeaders && playerUsedLeaders[playerId]) {
              playerDraft.draftedLeaders.forEach((leaderId) => {
                playerUsedLeaders[playerId].add(leaderId);
              });
            }
          },
        );
      }
    });

    // Create individual pools for each player
    const playerAvailableLeaders = {};
    playerIds.forEach((playerId) => {
      playerAvailableLeaders[playerId] = allLeaders.filter(
        (leader) => !playerUsedLeaders[playerId].has(leader.id),
      );

      // Check if this player has enough available leaders
      if (playerAvailableLeaders[playerId].length < 5) {
        throw new Error(
          `Il giocatore ${playerId} non ha abbastanza leader disponibili. Necessari: 5, Disponibili: ${playerAvailableLeaders[playerId].length}`,
        );
      }
    });

    // Draft leaders for each player from their individual pool
    const playerDrafts = draftLeadersForPlayers(
      playerAvailableLeaders,
      playerIds,
      5,
    );

    // Initialize player states
    const playerStates = {};
    playerIds.forEach((playerId) => {
      playerStates[playerId] = {
        hasSeenDraft: false,
        hasCompletedBans: false,
        votesReset: false,
      };
    });

    // Update campaign
    await updateDoc(campaignRef, {
      "draft.phase": "active",
      "draft.playerDrafts": playerDrafts,
      "draft.playerStates": playerStates,
      "draft.banVotes": {},
      "draft.bannedLeaders": {},
      updatedAt: new Date().toISOString(),
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Error executing draft:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Mark that a player has seen their draft
 * @param {string} campaignId - Campaign ID
 * @param {string} playerId - Player ID
 * @returns {Object} { success, error }
 */
export const markPlayerSeenDraft = async (campaignId, playerId) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);

    await updateDoc(campaignRef, {
      [`draft.playerStates.${playerId}.hasSeenDraft`]: true,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Error marking player seen draft:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Submit ban vote for a player
 * @param {string} campaignId - Campaign ID
 * @param {string} voterId - ID of player voting
 * @param {string} targetPlayerId - ID of player being voted against
 * @param {string} bannedLeaderId - ID of leader to ban
 * @param {Array} allPlayerIds - Array of all player IDs
 * @returns {Object} { success, error }
 */
export const submitBanVote = async (
  campaignId,
  voterId,
  targetPlayerId,
  bannedLeaderId,
  allPlayerIds,
) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);
    const campaignDoc = await getDoc(campaignRef);

    if (!campaignDoc.exists()) {
      return { success: false, error: "Campaign not found" };
    }

    const campaign = campaignDoc.data();
    const draft = campaign.draft || {};
    const banVotes = draft.banVotes || {};

    // Initialize voter's votes if not exists
    if (!banVotes[voterId]) {
      banVotes[voterId] = {};
    }

    // Record the vote
    banVotes[voterId][targetPlayerId] = bannedLeaderId;

    // Check if voter has completed all bans (voted for all other players)
    const otherPlayers = allPlayerIds.filter((id) => id !== voterId);
    const hasCompletedBans = otherPlayers.every(
      (otherId) => banVotes[voterId][otherId] !== undefined,
    );

    const updateData = {
      "draft.banVotes": banVotes,
      updatedAt: new Date().toISOString(),
    };

    if (hasCompletedBans) {
      updateData[`draft.playerStates.${voterId}.hasCompletedBans`] = true;
    }

    await updateDoc(campaignRef, updateData);

    return { success: true, error: null };
  } catch (error) {
    console.error("Error submitting ban vote:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Calculate and finalize bans when all players have voted
 * @param {string} campaignId - Campaign ID
 * @param {Array} playerIds - Array of all player IDs
 * @returns {Object} { success, error }
 */
export const finalizeBans = async (campaignId, playerIds) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);
    const campaignDoc = await getDoc(campaignRef);

    if (!campaignDoc.exists()) {
      return { success: false, error: "Campaign not found" };
    }

    const campaign = campaignDoc.data();
    const draft = campaign.draft || {};
    const banVotes = draft.banVotes || {};

    // Process votes to determine banned leaders
    const bannedLeaders = processBanVotes(banVotes, playerIds);

    await updateDoc(campaignRef, {
      "draft.phase": "completed",
      "draft.bannedLeaders": bannedLeaders,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Error finalizing bans:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Vote to reset draft
 * @param {string} campaignId - Campaign ID
 * @param {string} playerId - Player ID
 * @param {boolean} votesReset - Whether player votes for reset
 * @returns {Object} { success, error }
 */
export const voteResetDraft = async (campaignId, playerId, votesReset) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);

    await updateDoc(campaignRef, {
      [`draft.playerStates.${playerId}.votesReset`]: votesReset,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Error voting reset draft:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Reset draft to initial state
 * @param {string} campaignId - Campaign ID
 * @returns {Object} { success, error }
 */
export const resetDraft = async (campaignId) => {
  try {
    await initializeDraft(campaignId);
    return { success: true, error: null };
  } catch (error) {
    console.error("Error resetting draft:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Select final leader (after banning phase)
 * @param {string} campaignId - Campaign ID
 * @param {string} playerId - Player ID
 * @param {string} leaderId - Selected leader ID
 * @returns {Object} { success, error }
 */
export const selectFinalLeader = async (campaignId, playerId, leaderId) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);
    const campaignDoc = await getDoc(campaignRef);

    if (!campaignDoc.exists()) {
      return { success: false, error: "Campaign not found" };
    }

    const campaign = campaignDoc.data();
    const draft = campaign.draft || {};
    const selectedLeaders = draft.selectedLeaders || {};
    const matches = campaign.matches || [];

    // Add player's selection
    selectedLeaders[playerId] = leaderId;

    const updateData = {
      "draft.selectedLeaders": selectedLeaders,
      updatedAt: new Date().toISOString(),
    };

    // Check if all players have selected
    const allPlayersSelected =
      campaign.members &&
      campaign.members.every((memberId) => !!selectedLeaders[memberId]);

    // If all players selected and there's an active match, link draft to match
    if (allPlayersSelected && matches.length > 0) {
      const currentMatch = matches[matches.length - 1];
      if (
        currentMatch &&
        currentMatch.status === "in-progress" &&
        !currentMatch.draftCompleted
      ) {
        const updatedMatches = matches.map((match) => {
          if (match.id === currentMatch.id) {
            const updatedParticipants = { ...match.participants };
            const draftHistory = {};

            // Save complete draft history for each player
            Object.keys(selectedLeaders).forEach((userId) => {
              if (updatedParticipants[userId]) {
                updatedParticipants[userId].leaderId = selectedLeaders[userId];

                // Save draft history: all 5 leaders, which was banned, which was selected
                draftHistory[userId] = {
                  draftedLeaders: draft.playerDrafts?.[userId] || [],
                  bannedLeader: draft.bannedLeaders?.[userId] || null,
                  selectedLeader: selectedLeaders[userId],
                };
              }
            });

            return {
              ...match,
              participants: updatedParticipants,
              draftHistory,
              draftCompleted: true,
              startDate: new Date().toISOString(),
            };
          }
          return match;
        });

        updateData.matches = updatedMatches;
      }
    }

    await updateDoc(campaignRef, updateData);

    return { success: true, error: null };
  } catch (error) {
    console.error("Error selecting final leader:", error);
    return { success: false, error: error.message };
  }
};
