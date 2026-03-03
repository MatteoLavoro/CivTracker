// Player Leader Pool Modal - Shows all leaders with used status and sorting options
import { useState, useMemo } from "react";
import { Modal } from "./Modal";
import { ArrowUpDown } from "lucide-react";
import "./PlayerLeaderPoolModal.css";

/**
 * PlayerLeaderPoolModal Component
 * Shows all leaders for a specific player with:
 * - Used status tags (which match they were used in)
 * - Sorting by leader name or civilization name
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback when modal closes
 * @param {string} playerId - Player ID
 * @param {string} playerName - Player name
 * @param {Array} matches - Array of all matches
 * @param {Array} leaders - Array of all leaders
 */
export function PlayerLeaderPoolModal({
  isOpen,
  onClose,
  playerId,
  playerName,
  matches,
  leaders,
}) {
  const [sortBy, setSortBy] = useState("leader"); // "leader" or "civ"

  // Build map of used leaders for this specific player
  const usedLeadersMap = useMemo(() => {
    if (!matches || !playerId) return {};
    const map = {};
    matches.forEach((match, index) => {
      if (match.draftHistory && match.draftHistory[playerId]) {
        const draftedLeaders =
          match.draftHistory[playerId].draftedLeaders || [];
        draftedLeaders.forEach((leaderId) => {
          map[leaderId] = index + 1; // Match number (1-indexed)
        });
      }
    });
    return map;
  }, [matches, playerId]);

  // Sort leaders
  const sortedLeaders = useMemo(() => {
    if (!leaders) return [];
    const sorted = [...leaders];
    sorted.sort((a, b) => {
      if (sortBy === "leader") {
        return a.name.localeCompare(b.name);
      } else {
        // Sort by civilization
        const civCompare = a.civilization.localeCompare(b.civilization);
        if (civCompare !== 0) return civCompare;
        // If same civ, sort by leader name
        return a.name.localeCompare(b.name);
      }
    });
    return sorted;
  }, [leaders, sortBy]);

  const toggleSort = () => {
    setSortBy((prev) => (prev === "leader" ? "civ" : "leader"));
  };

  if (!playerId || !leaders || leaders.length === 0) return null;

  // Count available and used leaders
  const availableCount = sortedLeaders.filter(
    (leader) => !usedLeadersMap[leader.id],
  ).length;
  const usedCount = sortedLeaders.length - availableCount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pool di ${playerName}`}
      size="large"
    >
      <div className="player-leader-pool-modal-container">
        <div className="player-leader-pool-header">
          <div className="player-leader-pool-stat-card available">
            <div className="stat-content">
              <span className="stat-value">{availableCount}</span>
              <span className="stat-label">Disponibili</span>
            </div>
          </div>

          <div className="player-leader-pool-stat-card used">
            <div className="stat-content">
              <span className="stat-value">{usedCount}</span>
              <span className="stat-label">Usati</span>
            </div>
          </div>

          <button
            className="player-leader-pool-sort-btn"
            onClick={toggleSort}
            type="button"
            title={`Ordina per ${sortBy === "leader" ? "Civiltà" : "Personaggio"}`}
          >
            <ArrowUpDown size={18} className="sort-icon" />
            <div className="sort-content">
              <span className="sort-label">Ordina per</span>
              <span className="sort-value">
                {sortBy === "leader" ? "Personaggio" : "Civiltà"}
              </span>
            </div>
          </button>
        </div>

        <div className="player-leader-pool-body">
          <div className="player-leader-pool-list">
            {sortedLeaders.map((leader) => {
              const matchNumber = usedLeadersMap[leader.id];
              const isUsed = matchNumber !== undefined;

              return (
                <div
                  key={leader.id}
                  className={`player-leader-pool-card ${isUsed ? "used" : "available"}`}
                >
                  <img
                    src={leader.leaderIconPath}
                    alt={leader.name}
                    className="player-leader-pool-leader-icon"
                  />
                  <img
                    src={leader.civilizationIconPath}
                    alt={leader.civilization}
                    className="player-leader-pool-civ-icon"
                  />
                  <div className="player-leader-pool-leader-info">
                    <div className="player-leader-pool-leader-name">
                      {leader.name}
                    </div>
                    {leader.variant && (
                      <div className="player-leader-pool-leader-variant">
                        {leader.variant}
                      </div>
                    )}
                    <div className="player-leader-pool-leader-civ">
                      {leader.civilization}
                    </div>
                  </div>

                  {isUsed && (
                    <div className="player-leader-pool-tag used-tag">
                      Partita {matchNumber}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
