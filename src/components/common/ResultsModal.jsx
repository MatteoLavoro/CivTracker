// Results Modal Component - Campaign Leaderboard
import { Trophy } from "lucide-react";
import { Modal } from "./Modal";
import "./ResultsModal.css";

/**
 * ResultsModal component
 * Displays a leaderboard with all players and their total scores
 * @param {boolean} isOpen - Modal open state
 * @param {Function} onClose - Close handler
 * @param {Array} matches - All campaign matches
 * @param {Object} memberDetails - Member details object
 */
export function ResultsModal({ isOpen, onClose, matches, memberDetails }) {
  if (!matches || !memberDetails) return null;

  // Get all completed matches
  const completedMatches = matches.filter((m) => m.status === "completed");

  // Get all unique player IDs from memberDetails
  const playerIds = Object.keys(memberDetails);

  // Calculate totals for each player
  const playerTotals = playerIds.map((playerId) => {
    let totalScore = 0;
    const matchScores = completedMatches.map((match, index) => {
      const participant = match.participants?.[playerId];
      if (!participant) return { matchNumber: index + 1, score: null };

      // Use finalScore, fallback to processedScore, fallback to raw score
      const score =
        participant.finalScore !== undefined
          ? participant.finalScore
          : participant.processedScore !== undefined
            ? participant.processedScore
            : participant.score || 0;

      totalScore += score;
      return { matchNumber: index + 1, score };
    });

    return {
      playerId,
      username: memberDetails[playerId]?.username || "Sconosciuto",
      matchScores,
      totalScore,
    };
  });

  // Sort by total score (descending)
  playerTotals.sort((a, b) => b.totalScore - a.totalScore);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Classifica Generale">
      {completedMatches.length === 0 ? (
        <div className="results-empty">
          <p>Nessuna partita completata ancora.</p>
          <p className="results-empty-subtitle">
            Completa delle partite per vedere la classifica!
          </p>
        </div>
      ) : (
        <div className="results-content">
          <div className="results-description">
            <p>
              Classifica basata su <strong>{completedMatches.length}</strong>{" "}
              {completedMatches.length === 1
                ? "partita completata"
                : "partite completate"}
              .
            </p>
          </div>

          <div className="results-list">
            {playerTotals.map((player, index) => (
              <div
                key={player.playerId}
                className={`results-row ${index === 0 ? "results-row-first" : ""}`}
              >
                <div className="results-row-left">
                  <div className="results-rank-wrapper">
                    {index === 0 ? (
                      <div className="results-rank-badge results-rank-gold">
                        <Trophy size={24} />
                      </div>
                    ) : index === 1 ? (
                      <div className="results-rank-badge results-rank-silver">
                        2°
                      </div>
                    ) : index === 2 ? (
                      <div className="results-rank-badge results-rank-bronze">
                        3°
                      </div>
                    ) : (
                      <div className="results-rank-number">{index + 1}°</div>
                    )}
                  </div>
                  <div className="results-player-avatar">
                    {player.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="results-player-info">
                    <h3 className="results-player-name">{player.username}</h3>
                    <div className="results-player-matches">
                      {player.matchScores.map((match, idx) => (
                        <span
                          key={idx}
                          className="results-match-score"
                          title={`Partita ${match.matchNumber}: ${match.score !== null ? match.score : "-"} PT`}
                        >
                          {match.score !== null ? match.score : "-"}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="results-row-right">
                  <div className="results-total-points">
                    <span className="results-total-value">
                      {player.totalScore}
                    </span>
                    <span className="results-total-label">PT</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
