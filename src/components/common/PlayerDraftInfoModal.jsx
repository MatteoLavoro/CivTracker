// Player Draft Info Modal - Shows a player's draft result (all 5 leaders with banned/selected tags)
import { Modal } from "./Modal";
import { LeaderTooltip } from "./LeaderTooltip";
import "./PlayerDraftInfoModal.css";

/**
 * PlayerDraftInfoModal Component
 * Shows the complete draft result for a player:
 * - All 5 drafted leaders
 * - Which one was banned
 * - Which one was selected
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback when modal closes
 * @param {Object} playerDraftData - Draft data for the player
 * @param {Array} playerDraftData.draftedLeaders - Array of 5 leader IDs
 * @param {string} playerDraftData.bannedLeader - ID of banned leader
 * @param {string} playerDraftData.selectedLeader - ID of selected leader
 * @param {string} playerName - Name of the player
 * @param {Array} leaders - Array of all leaders
 */
export function PlayerDraftInfoModal({
  isOpen,
  onClose,
  playerDraftData,
  playerName,
  leaders,
}) {
  if (!playerDraftData || !leaders) return null;

  const { draftedLeaders, bannedLeader, selectedLeader } = playerDraftData;

  const getLeaderById = (leaderId) => {
    return leaders?.find((l) => l.id === leaderId);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Draft di ${playerName}`}
      size="large"
    >
      <div className="player-draft-info-modal-container">
        <div className="player-draft-info-body">
          <div className="player-draft-leaders">
            {draftedLeaders?.map((leaderId) => {
              const leader = getLeaderById(leaderId);
              if (!leader) return null;

              const isBanned = leaderId === bannedLeader;
              const isSelected = leaderId === selectedLeader;

              return (
                <div
                  key={leaderId}
                  className={`player-draft-leader-card ${isBanned ? "banned" : ""} ${isSelected ? "selected" : ""}`}
                >
                  <LeaderTooltip leader={leader} type="leader">
                    <img
                      src={leader.leaderIconPath}
                      alt={leader.name}
                      className="player-draft-leader-icon"
                    />
                  </LeaderTooltip>
                  <LeaderTooltip leader={leader} type="civilization">
                    <img
                      src={leader.civilizationIconPath}
                      alt={leader.civilization}
                      className="player-draft-civ-icon"
                    />
                  </LeaderTooltip>
                  <div className="player-draft-leader-info">
                    <div className="player-draft-leader-name">
                      {leader.name}
                    </div>
                    {leader.variant && (
                      <div className="player-draft-leader-variant">
                        {leader.variant}
                      </div>
                    )}
                    <div className="player-draft-leader-civ">
                      {leader.civilization}
                    </div>
                  </div>

                  {isBanned && (
                    <div className="player-draft-tag banned-tag">BANNATO</div>
                  )}
                  {isSelected && (
                    <div className="player-draft-tag selected-tag">SCELTO</div>
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
