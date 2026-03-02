// Score Calculation Utilities

/**
 * Calculate victory points based on logarithmic formula
 * Formula: MAX(50, MIN(150, 100 - 50 * SIGN(d) * LN(1 + ABS(d)) / LN(6)))
 * Where d = deviation from average
 * - d = +5 → 50 points (most common)
 * - d = -5 → 150 points (most rare)
 * - d = 0 → 100 points (balanced)
 * - defeat → 0 points (no victory)
 *
 * @param {string} victoryType - Victory type ID
 * @param {Object} victoryCounts - Object with victory counts { victoryType: count }
 * @returns {number} Points for this victory type (0-150)
 */
export function calculateVictoryPoints(victoryType, victoryCounts = {}) {
  // Defeat gives 0 points
  if (victoryType === "defeat") {
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
 * Total pool: 200 points
 * - Winner receives: victory points (50-150)
 * - Remaining points (200 - victory points) are distributed proportionally based on raw scores
 *
 * @param {Object} participants - Match participants { userId: { username, score, ... } }
 * @param {string} winnerId - Winner user ID
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

  // Calculate victory points
  const victoryPoints = calculateVictoryPoints(victoryType, victoryCounts);
  const remainingPoints = 200 - victoryPoints;

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

    // Winner gets victory points + proportional share
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
 * Calculate final scores with bonus tags applied
 * @param {Object} processedScores - Processed scores { userId: score }
 * @param {Object} participants - Match participants with bonus tags
 * @returns {Object} Final scores { userId: finalScore }
 */
export function calculateFinalScores(processedScores, participants) {
  const finalScores = {};

  Object.entries(processedScores).forEach(([userId, processedScore]) => {
    const participant = participants[userId];
    const bonusTags = participant?.bonusTags || [];
    const multiplier = getBonusMultiplier(bonusTags);

    finalScores[userId] = Math.round(processedScore * multiplier);
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
