// Complete Match Modal - Complete match with all details
import { useState, useMemo } from "react";
import {
  Trophy,
  Clock,
  Award,
  Info,
  Plus,
  Swords,
  Medal,
  X,
} from "lucide-react";
import { Modal, BonusInfoModal } from "./";
import { BONUS_TAGS } from "../../utils/scoreUtils";
import "./CompleteMatchModal.css";

/**
 * CompleteMatchModal Component
 * Modal to complete a match with all required details
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback when modal closes
 * @param {Object} match - Match object with participants
 * @param {Function} onConfirm - Callback to save match completion
 */
export function CompleteMatchModal({ isOpen, onClose, match, onConfirm }) {
  const participants = match?.participants
    ? Object.entries(match.participants)
    : [];

  const [turns, setTurns] = useState(match?.turns || 0);
  const [winnerId, setWinnerId] = useState(match?.winnerId || "");
  const [victoryType, setVictoryType] = useState(match?.victoryType || "");
  const [showBonusInfo, setShowBonusInfo] = useState(false);
  const [showBonusAssign, setShowBonusAssign] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Initialize scores from match using useMemo to avoid cascading renders
  const initialScores = useMemo(() => {
    if (!match?.participants) return {};
    const scores = {};
    Object.entries(match.participants).forEach(([userId, participant]) => {
      scores[userId] = participant.score || 0;
    });
    return scores;
  }, [match]);

  const [scores, setScores] = useState(initialScores);

  // Initialize bonus tags: { userId: [tagId, tagId, ...] }
  const initialBonusTags = useMemo(() => {
    if (!match?.participants) return {};
    const tags = {};
    Object.entries(match.participants).forEach(([userId, participant]) => {
      tags[userId] = participant.bonusTags || [];
    });
    return tags;
  }, [match]);

  const [bonusTags, setBonusTags] = useState(initialBonusTags);

  const victoryTypes = [
    { id: "science", name: "Vittoria Scientifica" },
    { id: "culture", name: "Vittoria Culturale" },
    { id: "diplomatic", name: "Vittoria Diplomatica" },
    { id: "domination", name: "Vittoria per Dominio" },
    { id: "religious", name: "Vittoria Religiosa" },
    { id: "score", name: "Vittoria per Punti" },
    { id: "defeat", name: "Sconfitta" },
  ];

  const handleScoreChange = (userId, value) => {
    const numValue = parseInt(value) || 0;
    setScores((prev) => ({ ...prev, [userId]: numValue }));
  };

  const handleOpenBonusAssign = (userId) => {
    setCurrentUserId(userId);
    setShowBonusAssign(true);
  };

  const handleAssignBonuses = (newBonusTags) => {
    if (currentUserId) {
      setBonusTags((prev) => ({
        ...prev,
        [currentUserId]: newBonusTags,
      }));
    }
    setShowBonusAssign(false);
    setCurrentUserId(null);
  };

  const handleRemoveSingleBonus = (userId, indexToRemove) => {
    setBonusTags((prev) => ({
      ...prev,
      [userId]: (prev[userId] || []).filter(
        (_, index) => index !== indexToRemove,
      ),
    }));
  };

  const getBonusIcon = (bonusId) => {
    switch (bonusId) {
      case BONUS_TAGS.SECOND_PLACE:
        return <Medal size={14} />;
      case BONUS_TAGS.SURVIVOR:
        return <Swords size={14} />;
      default:
        return <Award size={14} />;
    }
  };

  const getBonusName = (bonusId) => {
    switch (bonusId) {
      case BONUS_TAGS.SECOND_PLACE:
        return "Secondo Posto";
      case BONUS_TAGS.SURVIVOR:
        return "Sopravvissuto";
      default:
        return "Bonus";
    }
  };

  const handleSubmit = () => {
    // Validation
    if (turns <= 0) {
      alert("Inserisci il turno di vittoria");
      return;
    }

    if (!winnerId) {
      alert("Seleziona il vincitore");
      return;
    }

    if (!victoryType) {
      alert("Seleziona il tipo di vittoria");
      return;
    }

    // Check if all scores are set (allow 0 for defeat victories)
    const allScoresSet = participants.every(
      ([userId]) => scores[userId] !== undefined && scores[userId] !== null,
    );

    if (!allScoresSet) {
      alert("Imposta i punteggi per tutti i giocatori");
      return;
    }

    // Call confirm with all data including bonus tags
    onConfirm({
      turns,
      scores,
      bonusTags,
      winnerId,
      victoryType,
    });
  };

  const isValid =
    turns > 0 &&
    winnerId &&
    victoryType &&
    participants.every(
      ([userId]) => scores[userId] !== undefined && scores[userId] !== null,
    );

  const isEditing = match?.status === "completed";
  const modalTitle = isEditing ? "Modifica Partita" : "Completa Partita";
  const confirmLabel = isEditing ? "Salva Modifiche" : "Completa Partita";

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={modalTitle}
        footer={{
          label: confirmLabel,
          icon: <Trophy size={20} />,
          onConfirm: handleSubmit,
          disabled: !isValid,
        }}
        wide
      >
        <div className="complete-match-content">
          {/* Participants Table */}
          <div className="complete-match-table-container">
            <table className="complete-match-table">
              <thead>
                <tr>
                  <th>Giocatore</th>
                  <th>Punteggio Raw</th>
                  <th>
                    <div className="complete-match-bonus-header">
                      <span>Bonus</span>
                      <button
                        type="button"
                        className="complete-match-info-btn"
                        onClick={() => setShowBonusInfo(true)}
                        title="Info bonus"
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
                      <div className="complete-match-player-cell">
                        <div className="complete-match-player-avatar">
                          {participant.username
                            ?.substring(0, 2)
                            .toUpperCase() || "?"}
                        </div>
                        <span className="complete-match-player-name">
                          {participant.username}
                        </span>
                      </div>
                    </td>

                    {/* Raw Score Input */}
                    <td>
                      <input
                        type="number"
                        className="complete-match-score-input"
                        value={scores[userId] || 0}
                        onChange={(e) =>
                          handleScoreChange(userId, e.target.value)
                        }
                        placeholder="0"
                        min="0"
                        max="999999"
                      />
                    </td>

                    {/* Bonus Tags */}
                    <td>
                      <div className="complete-match-bonus-cell">
                        {bonusTags[userId] && bonusTags[userId].length > 0 ? (
                          <div className="complete-match-bonus-tags">
                            {bonusTags[userId].map((tagId, index) => (
                              <div
                                key={index}
                                className="complete-match-bonus-tag"
                              >
                                <span className="complete-match-bonus-icon">
                                  {getBonusIcon(tagId)}
                                </span>
                                <span className="complete-match-bonus-text">
                                  {getBonusName(tagId)}
                                </span>
                                <button
                                  type="button"
                                  className="complete-match-bonus-remove"
                                  onClick={() =>
                                    handleRemoveSingleBonus(userId, index)
                                  }
                                  title="Rimuovi bonus"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : null}
                        <button
                          type="button"
                          className="complete-match-bonus-add-btn"
                          onClick={() => handleOpenBonusAssign(userId)}
                          title="Aggiungi bonus"
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

          {/* Footer Section: Turns (left) + Winner + Victory Type (right) */}
          <div className="complete-match-footer">
            {/* Left: Turns */}
            <div className="complete-match-footer-left">
              <div className="complete-match-field">
                <div className="complete-match-field-icon">
                  <Clock size={20} />
                </div>
                <div className="complete-match-field-content">
                  <label className="complete-match-label">Turno</label>
                  <input
                    type="number"
                    className="complete-match-input"
                    value={turns}
                    onChange={(e) => setTurns(parseInt(e.target.value) || 0)}
                    placeholder="Es: 300"
                    min="1"
                    max="9999"
                  />
                </div>
              </div>
            </div>

            {/* Right: Winner + Victory Type */}
            <div className="complete-match-footer-right">
              {/* Winner Selection */}
              <div className="complete-match-field">
                <div className="complete-match-field-icon">
                  <Trophy size={20} />
                </div>
                <div className="complete-match-field-content">
                  <label className="complete-match-label">Vincitore</label>
                  <select
                    className="complete-match-select"
                    value={winnerId}
                    onChange={(e) => setWinnerId(e.target.value)}
                  >
                    <option value="">Seleziona vincitore...</option>
                    {participants.map(([userId, participant]) => (
                      <option key={userId} value={userId}>
                        {participant.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Victory Type Selection */}
              <div className="complete-match-field">
                <div className="complete-match-field-icon">
                  <Award size={20} />
                </div>
                <div className="complete-match-field-content">
                  <label className="complete-match-label">
                    Tipo di Vittoria
                  </label>
                  <select
                    className="complete-match-select"
                    value={victoryType}
                    onChange={(e) => setVictoryType(e.target.value)}
                  >
                    <option value="">Seleziona tipo di vittoria...</option>
                    {victoryTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Nested Bonus Info Modal */}
      <BonusInfoModal
        key="bonus-info"
        isOpen={showBonusInfo}
        onClose={() => setShowBonusInfo(false)}
        mode="info"
      />

      {/* Bonus Assignment Modal */}
      <BonusInfoModal
        key={`bonus-assign-${currentUserId}-${showBonusAssign}`}
        isOpen={showBonusAssign}
        onClose={() => {
          setShowBonusAssign(false);
          setCurrentUserId(null);
        }}
        mode="assign"
        currentBonusTags={currentUserId ? bonusTags[currentUserId] || [] : []}
        onAssign={handleAssignBonuses}
      />
    </>
  );
}
