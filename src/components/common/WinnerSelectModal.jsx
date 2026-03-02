// Winner Select Modal - Select winner from participants
import { Modal } from "./Modal";
import "./WinnerSelectModal.css";

/**
 * WinnerSelectModal Component
 * Select winner from match participants with leader display
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback when modal closes
 * @param {Function} onConfirm - Callback when winner is confirmed (userId)
 * @param {Array} participants - Array of [userId, participant] from match
 * @param {Object} leaders - All leaders data
 * @param {string} selectedWinnerId - Currently selected winner ID
 * @param {string} title - Modal title (default: "Seleziona Vincitore")
 */
export function WinnerSelectModal({
  isOpen,
  onClose,
  onConfirm,
  participants = [],
  leaders = [],
  selectedWinnerId = "",
  title = "Seleziona Vincitore",
}) {
  const getLeaderById = (leaderId) => {
    return leaders?.find((l) => l.id === leaderId);
  };

  const handleSelectWinner = (userId) => {
    onConfirm(userId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="winner-select-content">
        <div className="winner-select-list">
          {participants.map(([userId, participant]) => {
            const leader = participant.leaderId
              ? getLeaderById(participant.leaderId)
              : null;
            const isSelected = userId === selectedWinnerId;

            return (
              <div
                key={userId}
                className={`winner-select-item ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelectWinner(userId)}
              >
                <div className="winner-select-player">
                  <div className="winner-select-avatar">
                    {participant.username?.substring(0, 2).toUpperCase() || "?"}
                  </div>
                  <span className="winner-select-username">
                    {participant.username}
                  </span>
                </div>

                <div className="winner-select-separator">|</div>

                {leader ? (
                  <div className="winner-select-leader">
                    <img
                      src={leader.leaderIconPath}
                      alt={leader.name}
                      className="winner-select-leader-icon"
                    />
                    <img
                      src={leader.civilizationIconPath}
                      alt={leader.civilization}
                      className="winner-select-civ-icon"
                    />
                    <div className="winner-select-leader-info">
                      <span className="winner-select-leader-name">
                        {leader.name}
                      </span>
                      {leader.variant && (
                        <span className="winner-select-leader-variant">
                          {leader.variant}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="winner-select-leader-placeholder">
                    Leader non selezionato
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
