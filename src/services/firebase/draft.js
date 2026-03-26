// Firebase Draft Service
import { doc, updateDoc, getDoc, runTransaction } from "firebase/firestore";
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
        mode: null,
        readyPlayers: [],
        directReadyPlayers: [],
        countdownStartAt: null,
        playerDrafts: {},
        playerStates: {},
        banVotes: {},
        bannedLeaders: {},
        selectedLeaders: {},
        directChoices: {},
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
    // If switching to draft, remove from direct ready list
    let directReadyPlayers = (draft.directReadyPlayers || []).filter(
      (id) => id !== playerId,
    );

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
      "draft.directReadyPlayers": directReadyPlayers,
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
 * Toggle direct choice ready status for a player.
 * When all players are ready for direct choice, immediately activates direct selection phase.
 * @param {string} campaignId - Campaign ID
 * @param {string} playerId - Player ID
 * @param {boolean} isReady - Ready status
 * @param {Array} allMembers - All campaign members
 * @returns {Object} { success, error }
 */
export const toggleDirectReady = async (
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
    const draft = campaign.draft || { phase: "waiting" };

    let directReadyPlayers = draft.directReadyPlayers || [];
    // If switching to direct, remove from draft ready list
    let readyPlayers = (draft.readyPlayers || []).filter(
      (id) => id !== playerId,
    );

    if (isReady) {
      if (!directReadyPlayers.includes(playerId)) {
        directReadyPlayers.push(playerId);
      }
    } else {
      directReadyPlayers = directReadyPlayers.filter((id) => id !== playerId);
    }

    // If all members are ready for direct choice, activate direct selection immediately
    const allDirectReady =
      allMembers.length > 0 &&
      allMembers.every((id) => directReadyPlayers.includes(id));

    if (allDirectReady) {
      await updateDoc(campaignRef, {
        "draft.directReadyPlayers": directReadyPlayers,
        "draft.readyPlayers": readyPlayers,
        "draft.phase": "countdown",
        "draft.mode": "direct",
        "draft.countdownStartAt": new Date().toISOString(),
        "draft.directChoices": {},
        updatedAt: new Date().toISOString(),
      });
    } else {
      // If cancelling during direct countdown, reset back to waiting
      const resetFromCountdown =
        draft.phase === "countdown" && draft.mode === "direct";
      await updateDoc(campaignRef, {
        "draft.directReadyPlayers": directReadyPlayers,
        "draft.readyPlayers": readyPlayers,
        ...(resetFromCountdown
          ? {
              "draft.phase": "waiting",
              "draft.mode": null,
              "draft.countdownStartAt": null,
            }
          : {}),
        updatedAt: new Date().toISOString(),
      });
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Error toggling direct ready:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Choose a leader via direct selection (first-come-first-served).
 * Uses a Firestore transaction to prevent two players from picking the same leader.
 * @param {string} campaignId - Campaign ID
 * @param {string} playerId - Player ID choosing
 * @param {string} leaderId - Leader ID chosen
 * @returns {Object} { success, error }
 */
export const chooseDirectLeader = async (campaignId, playerId, leaderId) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);

    await runTransaction(db, async (transaction) => {
      const campaignDoc = await transaction.get(campaignRef);
      if (!campaignDoc.exists()) throw new Error("Campaign not found");

      const campaign = campaignDoc.data();
      const draft = campaign.draft || {};
      const directChoices = { ...(draft.directChoices || {}) };

      // Check if leader already taken by someone else
      const takenBy = Object.entries(directChoices).find(
        ([uid, lId]) => lId === leaderId && uid !== playerId,
      );
      if (takenBy) {
        throw new Error(
          "Questo personaggio è già stato scelto da un altro giocatore",
        );
      }

      directChoices[playerId] = leaderId;

      // Check if all members have chosen
      const members = campaign.members || [];
      const allChosen = members.every((id) => !!directChoices[id]);

      if (allChosen) {
        const matches = campaign.matches || [];
        const currentMatch = matches[matches.length - 1];

        if (
          currentMatch &&
          currentMatch.status === "in-progress" &&
          !currentMatch.draftCompleted
        ) {
          const updatedParticipants = { ...currentMatch.participants };
          Object.entries(directChoices).forEach(([uid, lId]) => {
            if (updatedParticipants[uid]) {
              updatedParticipants[uid].leaderId = lId;
            }
          });

          const updatedMatches = matches.map((match) => {
            if (match.id === currentMatch.id) {
              return {
                ...match,
                participants: updatedParticipants,
                draftCompleted: true,
                selectionMode: "direct",
                startDate: new Date().toISOString(),
              };
            }
            return match;
          });

          transaction.update(campaignRef, {
            "draft.directChoices": directChoices,
            "draft.selectedLeaders": directChoices,
            "draft.phase": "completed",
            matches: updatedMatches,
            updatedAt: new Date().toISOString(),
          });
        } else {
          transaction.update(campaignRef, {
            "draft.directChoices": directChoices,
            "draft.selectedLeaders": directChoices,
            "draft.phase": "completed",
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        transaction.update(campaignRef, {
          "draft.directChoices": directChoices,
          updatedAt: new Date().toISOString(),
        });
      }
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Error choosing direct leader:", error);
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

    // Bail early if another client already executed the draft
    if (campaign.draft?.phase !== "countdown") {
      return { success: true, error: null };
    }

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

    // Use a transaction so only the first client to arrive actually writes.
    // If another client already set phase to "active", this is a no-op.
    await runTransaction(db, async (transaction) => {
      const latestDoc = await transaction.get(campaignRef);
      if (!latestDoc.exists()) throw new Error("Campaign not found");
      const latestPhase = latestDoc.data().draft?.phase;
      if (latestPhase !== "countdown") return; // already executed by another client

      transaction.update(campaignRef, {
        "draft.phase": "active",
        "draft.playerDrafts": playerDrafts,
        "draft.playerStates": playerStates,
        "draft.banVotes": {},
        "draft.bannedLeaders": {},
        status: "in-progress",
        updatedAt: new Date().toISOString(),
      });
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Error executing draft:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Activate direct choice phase after countdown.
 * Uses a transaction so only the first client to arrive actually writes.
 * @param {string} campaignId - Campaign ID
 * @returns {Object} { success, error }
 */
export const activateDirectChoice = async (campaignId) => {
  try {
    const campaignRef = doc(db, "campaigns", campaignId);
    await runTransaction(db, async (transaction) => {
      const campaignDoc = await transaction.get(campaignRef);
      if (!campaignDoc.exists()) throw new Error("Campaign not found");
      const data = campaignDoc.data();
      if (data.draft?.phase !== "countdown" || data.draft?.mode !== "direct")
        return; // Already activated by another client
      transaction.update(campaignRef, {
        "draft.phase": "active",
        status: "in-progress",
        updatedAt: new Date().toISOString(),
      });
    });
    return { success: true, error: null };
  } catch (error) {
    console.error("Error activating direct choice:", error);
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
 * Submit ban vote for a player.
 * Each voter casts exactly ONE vote: they choose one leader from one opponent's pool.
 * Calling this again overwrites the previous vote (player can change mind before all finish).
 * @param {string} campaignId - Campaign ID
 * @param {string} voterId - ID of player voting
 * @param {string} targetPlayerId - ID of player being voted against
 * @param {string} bannedLeaderId - ID of leader to ban
 * @param {Array} allPlayerIds - Array of all player IDs (unused, kept for API compat)
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
    const banVotes = { ...(draft.banVotes || {}) };

    // Each player casts exactly one vote: overwrite any previous vote from this voter
    banVotes[voterId] = { [targetPlayerId]: bannedLeaderId };

    // Submitting one vote means the player has completed their banning
    const updateData = {
      "draft.banVotes": banVotes,
      [`draft.playerStates.${voterId}.hasCompletedBans`]: true,
      updatedAt: new Date().toISOString(),
    };

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

                // Extract this player's ban vote: { targetPlayerId, leaderId } or null
                const rawVote = draft.banVotes?.[userId];
                const banVoteCast =
                  rawVote && Object.keys(rawVote).length > 0
                    ? {
                        targetPlayerId: Object.keys(rawVote)[0],
                        leaderId: Object.values(rawVote)[0],
                      }
                    : null;

                // Save draft history: all 5 leaders, which was banned, which was selected,
                // and what ban vote this player cast (for future analytics)
                draftHistory[userId] = {
                  draftedLeaders: draft.playerDrafts?.[userId] || [],
                  bannedLeader: draft.bannedLeaders?.[userId] || null,
                  selectedLeader: selectedLeaders[userId],
                  banVoteCast,
                };
              }
            });

            return {
              ...match,
              participants: updatedParticipants,
              draftHistory,
              // Full snapshot of all ban votes keyed by voterId for analytics
              banVotesSnapshot: draft.banVotes || {},
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
