// Score Calculation Utilities

/**
 * Get total points pool based on victory type
 * @param {string} victoryType - Victory type ID
 * @returns {number} Total points pool
 */
export function getTotalPointsPool(victoryType) {
  if (victoryType === "canceled") {
    return 0; // Canceled match has 0 points pool
  }
  if (victoryType === "forfait" || victoryType === "defeat") {
    return 100; // Forfait and defeat have reduced pool
  }
  return 200; // Normal victories have full pool
}

/**
 * Calculate victory points based on logarithmic formula
 * Formula: MAX(50, MIN(150, 100 - 50 * SIGN(d) * LN(1 + ABS(d)) / LN(6)))
 * Where d = deviation from average
 * - d = +5 → 50 points (most common)
 * - d = -5 → 150 points (most rare)
 * - d = 0 → 100 points (balanced)
 * - forfait → 50 points (fixed)
 * - defeat → 0 points (no victory)
 * - canceled → 0 points (no victory)
 *
 * @param {string} victoryType - Victory type ID
 * @param {Object} victoryCounts - Object with victory counts { victoryType: count }
 * @returns {number} Points for this victory type (0-150)
 */
export function calculateVictoryPoints(victoryType, victoryCounts = {}) {
  // Forfait gives fixed 50 points
  if (victoryType === "forfait") {
    return 50;
  }

  // Defeat and canceled give 0 points
  if (victoryType === "defeat" || victoryType === "canceled") {
    return 0;
  }

  const victoryTypesList = [
    "science",
    "culture",
    "diplomatic",
    "domination",
    "religious",
    "score",
  ];

  const totalVictories = Object.values(victoryCounts).reduce(
    (sum, count) => sum + count,
    0,
  );

  // Default to 100 if no victories yet
  if (totalVictories === 0) return 100;

  // Calculate deviation from average
  const average = totalVictories / victoryTypesList.length;
  const count = victoryCounts[victoryType] || 0;
  const deviation = count - average;

  // Logarithmic formula with limits
  const points = Math.max(
    50,
    Math.min(
      150,
      100 -
        50 *
          Math.sign(deviation) *
          (Math.log(1 + Math.abs(deviation)) / Math.log(6)),
    ),
  );

  return Math.round(points);
}

/**
 * Calculate processed scores for all participants
 * Pool allocation:
 * - Normal victories (science, culture, etc.): 200 points total
 *   - Winner gets victory points (50-150 dynamic)
 *   - Remaining points distributed by raw scores
 * - Forfait: 100 points total
 *   - Winner gets 50 points fixed
 *   - Remaining 50 distributed by raw scores
 * - Defeat: 100 points total
 *   - All players lost to a bot
 *   - All 100 points distributed by raw scores among all players
 * - Canceled: 0 points total
 *   - Everyone gets 0 points
 *
 * @param {Object} participants - Match participants { userId: { username, score, ... } }
 * @param {string} winnerId - Winner user ID (empty for defeat/canceled)
 * @param {string} victoryType - Victory type ID
 * @param {Object} victoryCounts - Victory counts for calculating points
 * @returns {Object} Processed scores { userId: processedScore }
 */
export function calculateProcessedScores(
  participants,
  winnerId,
  victoryType,
  victoryCounts = {},
) {
  const processedScores = {};

  // Canceled match: everyone gets 0
  if (victoryType === "canceled") {
    Object.keys(participants).forEach((userId) => {
      processedScores[userId] = 0;
    });
    return processedScores;
  }

  // Special handling for defeat: all players lost to a bot, share 100 points
  if (victoryType === "defeat") {
    const totalPool = 100;

    // Calculate total raw score
    const totalRawScore = Object.values(participants).reduce(
      (sum, participant) => sum + (participant.score || 0),
      0,
    );

    // Distribute 100 points among all players proportionally
    if (totalRawScore > 0) {
      Object.entries(participants).forEach(([userId, participant]) => {
        const rawScore = participant.score || 0;
        processedScores[userId] = Math.round(
          (rawScore / totalRawScore) * totalPool,
        );
      });
    } else {
      // If no scores, distribute equally
      const playerCount = Object.keys(participants).length;
      const equalShare =
        playerCount > 0 ? Math.round(totalPool / playerCount) : 0;
      Object.keys(participants).forEach((userId) => {
        processedScores[userId] = equalShare;
      });
    }

    return processedScores;
  }

  // Calculate victory points and total pool for normal victories and forfait
  const victoryPoints = calculateVictoryPoints(victoryType, victoryCounts);
  const totalPool = getTotalPointsPool(victoryType);
  const remainingPoints = totalPool - victoryPoints;

  // Calculate total raw score
  const totalRawScore = Object.values(participants).reduce(
    (sum, participant) => sum + (participant.score || 0),
    0,
  );

  // Avoid division by zero
  if (totalRawScore === 0) {
    // If no scores, give all remaining points equally divided
    const playerCount = Object.keys(participants).length;
    const equalShare = Math.round(remainingPoints / playerCount);

    Object.keys(participants).forEach((userId) => {
      processedScores[userId] =
        userId === winnerId ? victoryPoints + equalShare : equalShare;
    });

    return processedScores;
  }

  // Distribute remaining points proportionally
  Object.entries(participants).forEach(([userId, participant]) => {
    const rawScore = participant.score || 0;
    const proportionalScore = Math.round(
      (rawScore / totalRawScore) * remainingPoints,
    );

    processedScores[userId] =
      userId === winnerId
        ? victoryPoints + proportionalScore
        : proportionalScore;
  });

  return processedScores;
}

/**
 * Get all victory counts from completed matches
 * @param {Array} matches - Array of all matches
 * @returns {Object} Victory counts { victoryType: count }
 */
export function getVictoryCounts(matches) {
  return matches
    .filter((match) => match.status === "completed" && match.victoryType)
    .reduce((acc, match) => {
      acc[match.victoryType] = (acc[match.victoryType] || 0) + 1;
      return acc;
    }, {});
}

/**
 * Available bonus tags
 */
export const BONUS_TAGS = {
  SECOND_PLACE: "second-place",
  SURVIVOR: "survivor",
};

/**
 * Available penalty tags
 */
export const PENALTY_TAGS = {
  MAP_REROLL: "map-reroll",
  RAGE_QUIT: "rage-quit",
  RULE_VIOLATION: "rule-violation",
};

/**
 * Get bonus multiplier for a player
 * Bonuses stack - each instance adds its percentage
 * @param {Array} bonusTags - Array of bonus tag IDs (can have duplicates)
 * @returns {number} Total multiplier (1.0 = no bonus, 1.15 = +15%, etc.)
 */
export function getBonusMultiplier(bonusTags = []) {
  let multiplier = 1.0;

  // Sum all bonuses, allowing duplicates
  bonusTags.forEach((tagId) => {
    if (tagId === BONUS_TAGS.SECOND_PLACE) {
      multiplier += 0.15; // +15%
    } else if (tagId === BONUS_TAGS.SURVIVOR) {
      multiplier += 0.1; // +10%
    }
  });

  return multiplier;
}

/**
 * Get penalty multiplier for a player
 * Penalties stack - each instance subtracts its percentage
 * @param {Array} penaltyTags - Array of penalty tag IDs (can have duplicates)
 * @returns {number} Total multiplier (1.0 = no penalty, 0.9 = -10%, etc.)
 */
export function getPenaltyMultiplier(penaltyTags = []) {
  let multiplier = 1.0;

  // Subtract all penalties, allowing duplicates
  penaltyTags.forEach((tagId) => {
    if (tagId === PENALTY_TAGS.MAP_REROLL) {
      multiplier -= 0.1; // -10%
    } else if (tagId === PENALTY_TAGS.RAGE_QUIT) {
      multiplier -= 0.3; // -30%
    } else if (tagId === PENALTY_TAGS.RULE_VIOLATION) {
      multiplier -= 0.9; // -90%
    }
  });

  // Ensure multiplier doesn't go below 0
  return Math.max(0, multiplier);
}

/**
 * Calculate final scores with bonus and penalty tags applied
 * @param {Object} processedScores - Processed scores { userId: score }
 * @param {Object} participants - Match participants with bonus and penalty tags
 * @returns {Object} Final scores { userId: finalScore }
 */
export function calculateFinalScores(processedScores, participants) {
  const finalScores = {};

  Object.entries(processedScores).forEach(([userId, processedScore]) => {
    const participant = participants[userId];
    const bonusTags = participant?.bonusTags || [];
    const penaltyTags = participant?.penaltyTags || [];

    const bonusMultiplier = getBonusMultiplier(bonusTags);
    const penaltyMultiplier = getPenaltyMultiplier(penaltyTags);

    // Sum bonus and penalty percentages instead of multiplying
    // Example: +10% (1.10) and -15% (0.85) = -5% (0.95)
    const bonusPercentage = bonusMultiplier - 1.0; // Extract bonus percentage
    const penaltyPercentage = 1.0 - penaltyMultiplier; // Extract penalty percentage
    const totalMultiplier = 1.0 + bonusPercentage - penaltyPercentage;

    finalScores[userId] = Math.round(processedScore * totalMultiplier);
  });

  return finalScores;
}

/**
 * Auto-assign second place bonus to the player with second highest processed score
 * @param {Object} processedScores - Processed scores { userId: score }
 * @param {string} winnerId - Winner user ID
 * @returns {string|null} User ID of second place, or null if not applicable
 */
export function determineSecondPlace(processedScores, winnerId) {
  // Sort players by processed score (descending)
  const sortedPlayers = Object.entries(processedScores).sort(
    (a, b) => b[1] - a[1],
  );

  // Find second place (first player that is not the winner)
  for (const [userId, score] of sortedPlayers) {
    if (userId !== winnerId && score > 0) {
      return userId;
    }
  }

  return null;
}
