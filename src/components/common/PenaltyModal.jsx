// Penalty Modal - Assign penalties to match participants
import { useState, useMemo } from "react";
import { AlertTriangle, Plus, X, Info } from "lucide-react";
import { Modal, Avatar, PenaltyInfoModal } from "./";
import { PENALTY_TAGS } from "../../utils/scoreUtils";
import "./PenaltyModal.css";

/**
 * PenaltyModal Component
 * Modal to assign penalties to match participants
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback when modal closes
 * @param {Object} match - Match object with participants
 * @param {Function} onConfirm - Callback to save penalties
 */
export function PenaltyModal({ isOpen, onClose, match, onConfirm }) {
  const participants = match?.participants
    ? Object.entries(match.participants).sort((a, b) => {
        const nameA = a[1].username?.toLowerCase() || "";
        const nameB = b[1].username?.toLowerCase() || "";
        return nameA.localeCompare(nameB);
      })
    : [];

  const [showPenaltyInfo, setShowPenaltyInfo] = useState(false);
  const [showPenaltyAssign, setShowPenaltyAssign] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showOverflowPenaltyInfo, setShowOverflowPenaltyInfo] = useState(false);
  const [overflowPenaltyList, setOverflowPenaltyList] = useState([]);

  // Max visible penalty tags before showing "Altri malus"
  const MAX_VISIBLE_PENALTY = 2;

  // Initialize penalty tags: { userId: [tagId, tagId, ...] }
  const initialPenaltyTags = useMemo(() => {
    if (!match?.participants) return {};
    const tags = {};
    Object.entries(match.participants).forEach(([userId, participant]) => {
      tags[userId] = participant.penaltyTags || [];
    });
    return tags;
  }, [match]);

  const [penaltyTags, setPenaltyTags] = useState(initialPenaltyTags);

  const handleOpenPenaltyAssign = (userId) => {
    setCurrentUserId(userId);
    setShowPenaltyAssign(true);
  };

  const handleAssignPenalties = (newPenaltyTags) => {
    if (currentUserId) {
      setPenaltyTags((prev) => ({
        ...prev,
        [currentUserId]: newPenaltyTags,
      }));
    }
    setShowPenaltyAssign(false);
    setCurrentUserId(null);
  };

  const handleRemoveSinglePenalty = (userId, indexToRemove) => {
    setPenaltyTags((prev) => ({
      ...prev,
      [userId]: (prev[userId] || []).filter(
        (_, index) => index !== indexToRemove,
      ),
    }));
  };

  const getPenaltyIcon = () => {
    return <AlertTriangle size={14} />;
  };

  const getPenaltyName = (penaltyId) => {
    switch (penaltyId) {
      case PENALTY_TAGS.MAP_REROLL:
        return "Rerol Mappa";
      case PENALTY_TAGS.RAGE_QUIT:
        return "Rage Quit";
      case PENALTY_TAGS.RULE_VIOLATION:
        return "Violazione Regole";
      default:
        return "Penalità";
    }
  };

  const getPenaltyColor = (penaltyId) => {
    switch (penaltyId) {
      case PENALTY_TAGS.MAP_REROLL:
        return "orange"; // Orange for map reroll
      case PENALTY_TAGS.RAGE_QUIT:
        return "red"; // Red for rage quit
      case PENALTY_TAGS.RULE_VIOLATION:
        return "purple"; // Purple for rule violation
      default:
        return "default";
    }
  };

  const handleShowOverflowPenalties = (userId) => {
    setOverflowPenaltyList(penaltyTags[userId] || []);
    setCurrentUserId(userId);
    setShowOverflowPenaltyInfo(true);
  };

  const handleRemoveFromOverflow = (index) => {
    if (currentUserId) {
      handleRemoveSinglePenalty(currentUserId, index);
      // Update overflow list
      setOverflowPenaltyList((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    // Call confirm with penalty tags
    onConfirm({
      penaltyTags,
    });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Penalità"
        footer={{
          label: "Salva Penalità",
          icon: <AlertTriangle size={20} />,
          onConfirm: handleSubmit,
          disabled: false,
        }}
        wide
      >
        <div className="penalty-modal-content">
          {/* Participants Table */}
          <div className="penalty-modal-table-container">
            <table className="penalty-modal-table">
              <thead>
                <tr>
                  <th>Giocatore</th>
                  <th>
                    <div className="penalty-modal-header">
                      <span>Penalità</span>
                      <button
                        type="button"
                        className="penalty-modal-info-btn"
                        onClick={() => setShowPenaltyInfo(true)}
                        title="Info malus"
                      >
                        <Info size={16} />
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {participants.map(([userId, participant]) => (
                  <tr key={userId}>
                    {/* Player Name */}
                    <td>
                      <div className="penalty-modal-player-cell">
                        <Avatar
                          photoURL={participant.photoURL}
                          displayName={participant.username}
                          email={null}
                          size={32}
                          className="penalty-modal-player-avatar"
                        />
                        <span className="penalty-modal-player-name">
                          {participant.username}
                        </span>
                      </div>
                    </td>

                    {/* Penalty Tags */}
                    <td className="penalty-modal-penalty-td">
                      <div className="penalty-modal-penalty-cell">
                        <div className="penalty-modal-penalty-tags-container">
                          {penaltyTags[userId] &&
                          penaltyTags[userId].length > 0 ? (
                            <div className="penalty-modal-penalty-tags">
                              {penaltyTags[userId]
                                .slice(0, MAX_VISIBLE_PENALTY)
                                .map((tagId, index) => (
                                  <div
                                    key={index}
                                    className={`penalty-modal-penalty-tag penalty-color-${getPenaltyColor(tagId)}`}
                                  >
                                    <span className="penalty-modal-penalty-icon">
                                      {getPenaltyIcon(tagId)}
                                    </span>
                                    <span className="penalty-modal-penalty-text">
                                      {getPenaltyName(tagId)}
                                    </span>
                                    <button
                                      type="button"
                                      className="penalty-modal-penalty-remove"
                                      onClick={() =>
                                        handleRemoveSinglePenalty(userId, index)
                                      }
                                      title="Rimuovi penalità"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ))}
                              {penaltyTags[userId].length >
                                MAX_VISIBLE_PENALTY && (
                                <div
                                  className="penalty-modal-penalty-tag penalty-overflow"
                                  onClick={() =>
                                    handleShowOverflowPenalties(userId)
                                  }
                                  title="Visualizza tutte le penalità"
                                >
                                  <span className="penalty-modal-penalty-icon">
                                    <AlertTriangle size={14} />
                                  </span>
                                  <span className="penalty-modal-penalty-text">
                                    Altri{" "}
                                    {penaltyTags[userId].length -
                                      MAX_VISIBLE_PENALTY}{" "}
                                    malus
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="penalty-modal-penalty-add-btn"
                          onClick={() => handleOpenPenaltyAssign(userId)}
                          title="Aggiungi penalità"
                        >
                          <Plus size={16} />
                          <span>Aggiungi</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* Penalty Info Modal */}
      <PenaltyInfoModal
        isOpen={showPenaltyInfo}
        onClose={() => setShowPenaltyInfo(false)}
        mode="info"
      />

      {/* Penalty Assignment Modal */}
      <PenaltyInfoModal
        key={currentUserId}
        isOpen={showPenaltyAssign}
        onClose={() => {
          setShowPenaltyAssign(false);
          setCurrentUserId(null);
        }}
        mode="assign"
        currentPenaltyTags={penaltyTags[currentUserId] || []}
        onAssign={handleAssignPenalties}
      />

      {/* Overflow Penalty Modal */}
      <PenaltyInfoModal
        key={`overflow-${currentUserId}`}
        isOpen={showOverflowPenaltyInfo}
        onClose={() => {
          setShowOverflowPenaltyInfo(false);
          setCurrentUserId(null);
          setOverflowPenaltyList([]);
        }}
        mode="overflow"
        currentPenaltyTags={overflowPenaltyList}
        onRemove={handleRemoveFromOverflow}
      />
    </>
  );
}
