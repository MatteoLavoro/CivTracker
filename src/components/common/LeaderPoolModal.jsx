// Leader Pool Modal - Shows list of players to select and view their available leader pool
import { useState } from "react";
import { Modal } from "./Modal";
import { PlayerLeaderPoolModal } from "./PlayerLeaderPoolModal";
import { Avatar } from "./Avatar";
import { ChevronRight } from "lucide-react";
import "./LeaderPoolModal.css";

/**
 * LeaderPoolModal Component
 * Shows a list of campaign members to view their available leader pool
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback when modal closes
 * @param {Object} campaign - Campaign object
 * @param {Array} leaders - Array of all leaders
 */
export function LeaderPoolModal({ isOpen, onClose, campaign, leaders }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [selectedPlayerName, setSelectedPlayerName] = useState("");
  const [playerPoolModalOpen, setPlayerPoolModalOpen] = useState(false);

  if (!campaign || !leaders) return null;

  const members = campaign.members || [];
  const memberDetails = campaign.memberDetails || {};
  const matches = campaign.matches || [];

  const handleSelectPlayer = (playerId) => {
    const playerName = memberDetails[playerId]?.username || "Sconosciuto";
    setSelectedPlayerId(playerId);
    setSelectedPlayerName(playerName);
    setPlayerPoolModalOpen(true);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Pool Personaggi"
        size="medium"
      >
        <div className="leader-pool-modal-container">
          <div className="leader-pool-body">
            <p className="leader-pool-description">
              Seleziona un giocatore per vedere quali personaggi può ancora
              usare
            </p>

            <div className="leader-pool-players">
              {members.map((playerId) => {
                const player = memberDetails[playerId];
                return (
                  <button
                    key={playerId}
                    className="leader-pool-player-btn"
                    onClick={() => handleSelectPlayer(playerId)}
                    type="button"
                  >
                    <Avatar
                      photoURL={player?.photoURL}
                      displayName={player?.username}
                      email={null}
                      size={32}
                    />
                    <span className="leader-pool-player-name">
                      {player?.username || "Sconosciuto"}
                    </span>
                    <ChevronRight size={20} className="leader-pool-chevron" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      {/* Nested Player Leader Pool Modal */}
      <PlayerLeaderPoolModal
        isOpen={playerPoolModalOpen}
        onClose={() => {
          setPlayerPoolModalOpen(false);
          setSelectedPlayerId(null);
          setSelectedPlayerName("");
        }}
        playerId={selectedPlayerId}
        playerName={selectedPlayerName}
        matches={matches}
        leaders={leaders}
      />
    </>
  );
}
