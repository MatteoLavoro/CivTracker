// Draft System Utilities

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get base leader name without variant
 * @param {Object} leader - Leader object
 * @returns {string} Base name
 */
function getBaseLeaderName(leader) {
  return leader.name;
}

/**
 * Draft leaders for all players from their individual pools, minimizing duplicates
 * @param {Object} playerAvailableLeaders - Object with { playerId: [available leaders array] }
 * @param {Array} playerIds - Array of player IDs
 * @param {number} leadersPerPlayer - Number of leaders per player (default: 5)
 * @returns {Object} Object with playerDrafts { playerId: [leaderIds] }
 */
export function draftLeadersForPlayers(
  playerAvailableLeaders,
  playerIds,
  leadersPerPlayer = 5,
) {
  // Track which leaders have been assigned in this draft
  const assignedLeaderIds = new Set();
  const playerDrafts = {};

  // Process each player
  for (const playerId of playerIds) {
    const availableLeaders = playerAvailableLeaders[playerId];

    if (!availableLeaders || availableLeaders.length < leadersPerPlayer) {
      throw new Error(
        `Il giocatore ${playerId} non ha abbastanza leader disponibili. Necessari: ${leadersPerPlayer}, Disponibili: ${availableLeaders?.length || 0}`,
      );
    }

    // Shuffle this player's available leaders
    const shuffledLeaders = shuffleArray(availableLeaders);

    // Prefer leaders not yet assigned to other players
    const unassignedLeaders = shuffledLeaders.filter(
      (leader) => !assignedLeaderIds.has(leader.id),
    );

    const selectedLeaders = [];

    // First, try to pick from unassigned leaders
    for (
      let i = 0;
      i < Math.min(leadersPerPlayer, unassignedLeaders.length);
      i++
    ) {
      selectedLeaders.push(unassignedLeaders[i].id);
      assignedLeaderIds.add(unassignedLeaders[i].id);
    }

    // If we still need more leaders, pick from already assigned ones
    if (selectedLeaders.length < leadersPerPlayer) {
      for (const leader of shuffledLeaders) {
        if (selectedLeaders.length >= leadersPerPlayer) break;
        if (!selectedLeaders.includes(leader.id)) {
          selectedLeaders.push(leader.id);
          assignedLeaderIds.add(leader.id);
        }
      }
    }

    playerDrafts[playerId] = selectedLeaders;
  }

  return playerDrafts;
}

/**
 * Calculate most voted leader for banning
 * @param {Array} votes - Array of leader IDs voted for banning
 * @returns {string} Leader ID to ban (random if tie)
 */
export function calculateBannedLeader(votes) {
  if (!votes || votes.length === 0) {
    return null;
  }

  // Count votes for each leader
  const voteCounts = {};
  votes.forEach((leaderId) => {
    voteCounts[leaderId] = (voteCounts[leaderId] || 0) + 1;
  });

  // Find max votes
  const maxVotes = Math.max(...Object.values(voteCounts));

  // Get all leaders with max votes
  const topLeaders = Object.keys(voteCounts).filter(
    (leaderId) => voteCounts[leaderId] === maxVotes,
  );

  // If tie, pick random
  if (topLeaders.length > 1) {
    const randomIndex = Math.floor(Math.random() * topLeaders.length);
    return topLeaders[randomIndex];
  }

  return topLeaders[0];
}

/**
 * Process all ban votes and determine banned leaders for each player
 * @param {Object} banVotes - Object { voterId: { targetPlayerId: leaderId } }
 * @param {Array} playerIds - Array of all player IDs
 * @returns {Object} Object { playerId: bannedLeaderId }
 */
export function processBanVotes(banVotes, playerIds) {
  const bannedLeaders = {};

  // For each player, collect all votes against their leaders
  playerIds.forEach((targetPlayerId) => {
    const votesAgainstPlayer = [];

    // Collect votes from all other players
    Object.keys(banVotes).forEach((voterId) => {
      if (voterId !== targetPlayerId && banVotes[voterId][targetPlayerId]) {
        votesAgainstPlayer.push(banVotes[voterId][targetPlayerId]);
      }
    });

    // Calculate which leader to ban
    const bannedLeader = calculateBannedLeader(votesAgainstPlayer);
    if (bannedLeader) {
      bannedLeaders[targetPlayerId] = bannedLeader;
    }
  });

  return bannedLeaders;
}

/**
 * Get remaining leaders for a player after banning
 * @param {Array} draftedLeaderIds - Leader IDs drafted by player
 * @param {string} bannedLeaderId - Leader ID that was banned
 * @returns {Array} Remaining leader IDs
 */
export function getRemainingLeaders(draftedLeaderIds, bannedLeaderId) {
  return draftedLeaderIds.filter((id) => id !== bannedLeaderId);
}

/**
 * Check if all players are ready
 * @param {Array} readyPlayers - Array of ready player IDs
 * @param {Array} allPlayers - Array of all player IDs
 * @returns {boolean} True if all players are ready
 */
export function areAllPlayersReady(readyPlayers, allPlayers) {
  if (!readyPlayers || !allPlayers) return false;
  return (
    readyPlayers.length === allPlayers.length &&
    allPlayers.every((playerId) => readyPlayers.includes(playerId))
  );
}

/**
 * Check if a player has submitted their ban vote
 * @param {Object} banVotes - Object { voterId: { targetPlayerId: leaderId } }
 * @param {string} playerId - Player ID to check
 * @param {Array} otherPlayerIds - Array of other player IDs
 * @returns {boolean} True if player has voted for all other players
 */
export function hasPlayerVoted(banVotes, playerId, otherPlayerIds) {
  if (!banVotes || !banVotes[playerId]) return false;

  const playerVotes = banVotes[playerId];
  return otherPlayerIds.every((otherId) => playerVotes[otherId] !== undefined);
}

/**
 * Check if all players have submitted their ban votes
 * @param {Object} banVotes - Object { voterId: { targetPlayerId: leaderId } }
 * @param {Array} playerIds - Array of all player IDs
 * @returns {boolean} True if all players have voted
 */
export function haveAllPlayersVoted(banVotes, playerIds) {
  if (!banVotes || playerIds.length < 2) return false;

  return playerIds.every((playerId) => {
    const otherPlayers = playerIds.filter((id) => id !== playerId);
    return hasPlayerVoted(banVotes, playerId, otherPlayers);
  });
}
