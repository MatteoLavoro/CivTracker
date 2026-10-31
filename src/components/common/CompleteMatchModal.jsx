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
  RotateCcw,
  Flame,
  ShieldAlert,
  Star,
  X,
  ChevronRight,
} from "lucide-react";
import { Modal } from "./Modal";
import { Avatar } from "./Avatar";
import { BonusMalusModal } from "./BonusMalusModal";
import { WinnerSelectModal } from "./WinnerSelectModal";
import { VictoryTypeSelectModal } from "./VictoryTypeSelectModal";
import {
  BONUS_TAGS,
  getModifierInfo,
  calculateProcessedScores,
  determineSecondPlace,
} from "../../utils/scoreUtils";
import "./CompleteMatchModal.css";

/**
 * CompleteMatchModal Component
 * Modal to complete a match with all required details
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback when modal closes
 * @param {Object} match - Match object with participants
 * @param {Function} onConfirm - Callback to save match completion
 * @param {Array} leaders - All leaders data
 * @param {Object} victoryCounts - Current victory counts
 */
export function CompleteMatchModal({
  isOpen,
  onClose,
  match,
  onConfirm,
  leaders = [],
  victoryCounts = {},
}) {
  const participants = match?.participants
    ? Object.entries(match.participants).sort((a, b) => {
        const nameA = a[1].username?.toLowerCase() || "";
        const nameB = b[1].username?.toLowerCase() || "";
        return nameA.localeCompare(nameB);
      })
    : [];

  const [turns, setTurns] = useState(match?.turns || 0);
  const [winnerId, setWinnerId] = useState(match?.winnerId || "");
  const [victoryType, setVictoryType] = useState(match?.victoryType || "");
  const [showModifierInfo, setShowModifierInfo] = useState(false);
  const [showModifierAssign, setShowModifierAssign] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showWinnerSelect, setShowWinnerSelect] = useState(false);
  const [showVictoryTypeSelect, setShowVictoryTypeSelect] = useState(false);

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

  // Initialize malus tags: { userId: [tagId, tagId, ...] }
  const initialPenaltyTags = useMemo(() => {
    if (!match?.participants) return {};
    const tags = {};
    Object.entries(match.participants).forEach(([userId, participant]) => {
      tags[userId] = participant.penaltyTags || [];
    });
    return tags;
  }, [match]);

  const [penaltyTags, setPenaltyTags] = useState(initialPenaltyTags);

  const victoryTypes = [
    {
      id: "science",
      name: "Vittoria Scientifica",
      icon: "/IconeVittorie/ScienceVictory.webp",
    },
    {
      id: "culture",
      name: "Vittoria Culturale",
      icon: "/IconeVittorie/CultureVictory.webp",
    },
    {
      id: "diplomatic",
      name: "Vittoria Diplomatica",
      icon: "/IconeVittorie/DiplomaticVictory.webp",
    },
    {
      id: "domination",
      name: "Vittoria per Dominio",
      icon: "/IconeVittorie/DominationVictory.webp",
    },
    {
      id: "religious",
      name: "Vittoria Religiosa",
      icon: "/IconeVittorie/ReligiousVictory.webp",
    },
    {
      id: "score",
      name: "Vittoria per Punti",
      icon: "/IconeVittorie/ScoreVictory.webp",
    },
    {
      id: "forfait",
      name: "Vittoria per Forfait",
      icon: "/IconeVittorie/ForfaitVictory .webp",
    },
    {
      id: "defeat",
      name: "Sconfitta",
      icon: "/IconeVittorie/Defeat.webp",
    },
    {
      id: "canceled",
      name: "Annullata",
      icon: "/IconeVittorie/Cancelled.png",
    },
  ];

  const handleScoreChange = (userId, value) => {
    const numValue = parseInt(value) || 0;
    setScores((prev) => ({ ...prev, [userId]: numValue }));
  };

  const handleOpenModifierAssign = (userId) => {
    setCurrentUserId(userId);
    setShowModifierAssign(true);
  };

  const handleAssignModifiers = ({ bonusTags: newBonuses, penaltyTags: newPenalties }) => {
    if (currentUserId) {
      setBonusTags((prev) => ({ ...prev, [currentUserId]: newBonuses }));
      setPenaltyTags((prev) => ({ ...prev, [currentUserId]: newPenalties }));
    }
    setShowModifierAssign(false);
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

  const handleRemoveSinglePenalty = (userId, indexToRemove) => {
    setPenaltyTags((prev) => ({
      ...prev,
      [userId]: (prev[userId] || []).filter(
        (_, index) => index !== indexToRemove,
      ),
    }));
  };

  const getModifierIcon = (tagId) => {
    switch (tagId) {
      case BONUS_TAGS.SECOND_PLACE:
        return <Medal size={14} />;
      case BONUS_TAGS.SURVIVOR:
        return <Swords size={14} />;
      case BONUS_TAGS.PREFERENCE:
        return <Star size={14} />;
      case "map-reroll":
        return <RotateCcw size={14} />;
      case "rage-quit":
        return <Flame size={14} />;
      case "rule-violation":
        return <ShieldAlert size={14} />;
      default:
        return <Award size={14} />;
    }
  };

  const getModifierName = (tagId) => {
    return getModifierInfo(tagId)?.name || "Modificatore";
  };

  const getModifierColor = (tagId) => {
    return getModifierInfo(tagId)?.color || "default";
  };

  const currentParticipant = currentUserId
    ? participants.find(([userId]) => userId === currentUserId)?.[1]
    : null;

  const handleSelectWinner = (userId) => {
    setWinnerId(userId);
    setShowWinnerSelect(false);
  };

  const handleSelectVictoryType = (victoryTypeId) => {
    setVictoryType(victoryTypeId);
    // Clear winner if defeat or canceled is selected
    if (victoryTypeId === "defeat" || victoryTypeId === "canceled") {
      setWinnerId("");
    }
    setShowVictoryTypeSelect(false);
  };

  const getVictoryTypeName = () => {
    const victory = victoryTypes.find((v) => v.id === victoryType);
    return victory ? victory.name : "Seleziona esito...";
  };

  const getVictoryTypeData = () => {
    return victoryTypes.find((v) => v.id === victoryType) || null;
  };

  const getWinnerName = () => {
    if (!winnerId) return "Seleziona vincitore...";
    const winner = participants.find(([userId]) => userId === winnerId);
    return winner ? winner[1].username : "Seleziona vincitore...";
  };

  const getWinnerData = () => {
    if (!winnerId) return null;
    const winner = participants.find(([userId]) => userId === winnerId);
    return winner ? winner[1] : null;
  };

  const handleSubmit = () => {
    // Validation
    if (!victoryType) {
      alert("Seleziona l'esito della partita");
      return;
    }

    // Winner is required only for normal victories and forfait
    // Defeat and canceled don't require a winner
    if (victoryType !== "canceled" && victoryType !== "defeat" && !winnerId) {
      alert("Seleziona il vincitore");
      return;
    }

    // Scores are not required for canceled matches
    if (victoryType !== "canceled") {
      // Check if all scores are set (allow 0 for all victory types)
      const allScoresSet = participants.every(
        ([userId]) => scores[userId] !== undefined && scores[userId] !== null,
      );

      if (!allScoresSet) {
        alert("Imposta i punteggi per tutti i giocatori");
        return;
      }
    }

    // Auto-assign second place bonus if completing for the first time
    let finalBonusTags = { ...bonusTags };
    if (
      match?.status === "in-progress" &&
      winnerId &&
      victoryType !== "canceled" &&
      victoryType !== "defeat"
    ) {
      // Build participants object with updated scores for calculation
      const updatedParticipants = {};
      Object.entries(match.participants).forEach(([userId, participant]) => {
        updatedParticipants[userId] = {
          ...participant,
          score: scores[userId] || 0,
        };
      });

      // Calculate processed scores
      const processedScores = calculateProcessedScores(
        updatedParticipants,
        winnerId,
        victoryType,
        victoryCounts,
      );

      // Determine second place
      const secondPlaceUserId = determineSecondPlace(processedScores, winnerId);

      if (secondPlaceUserId) {
        // Add second place bonus if not already present
        const currentBonuses = finalBonusTags[secondPlaceUserId] || [];
        if (!currentBonuses.includes(BONUS_TAGS.SECOND_PLACE)) {
          finalBonusTags = {
            ...finalBonusTags,
            [secondPlaceUserId]: [...currentBonuses, BONUS_TAGS.SECOND_PLACE],
          };
        }
      }
    }

    // Call confirm with all data including bonuses and maluses
    onConfirm({
      turns: turns || 0, // Allow 0 or empty turns
      scores,
      bonusTags: finalBonusTags,
      penaltyTags,
      winnerId,
      victoryType,
    });
  };

  const isValid = (() => {
    // Must have victory type
    if (!victoryType) return false;

    // Winner is required only for normal victories and forfait
    if (victoryType !== "canceled" && victoryType !== "defeat" && !winnerId) {
      return false;
    }

    // Scores are not required for canceled matches
    if (victoryType === "canceled") {
      return true;
    }

    // For all other victory types, check if all scores are set
    return participants.every(
      ([userId]) => scores[userId] !== undefined && scores[userId] !== null,
    );
  })();

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
                      <span>Bonus / Malus</span>
                      <button
                        type="button"
                        className="complete-match-info-btn"
                        onClick={() => setShowModifierInfo(true)}
                        title="Info bonus e malus"
                      >
                        <Info size={16} />
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {participants.map(([userId, participant]) => {
                  const preferenceCount = participant.preferenceCount || 0;
                  return (
                  <tr key={userId}>
                    {/* Player Name */}
                    <td>
                      <div className="complete-match-player-cell">
                        <Avatar
                          photoURL={participant.photoURL}
                          displayName={participant.username}
                          email={null}
                          size={32}
                          className="complete-match-player-avatar"
                        />
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
                        onFocus={(e) => e.target.select()}
                        placeholder="0"
                        min="0"
                        max="999999"
                      />
                    </td>

                    {/* Bonus and malus tags */}
                    <td className="complete-match-bonus-td">
                      <div className="complete-match-bonus-cell">
                        <div className="complete-match-bonus-tags-container">
                          {(bonusTags[userId]?.length || 0) +
                            (penaltyTags[userId]?.length || 0) +
                            preferenceCount >
                          0 ? (
                            <div className="complete-match-bonus-tags">
                              {preferenceCount > 0 && (
                                <div
                                  className="complete-match-bonus-tag bonus-color-green preference-locked"
                                  title="Bonus automatico del Draft Preferenze: non rimovibile"
                                >
                                  <span className="complete-match-bonus-icon">
                                    <Star size={14} />
                                  </span>
                                  <span className="complete-match-bonus-text">
                                    Preferenza ×{preferenceCount} (+
                                    {preferenceCount * 10}%)
                                  </span>
                                </div>
                              )}
                              {(bonusTags[userId] || []).map(
                                (tagId, index) => (
                                  <div
                                    key={`bonus-${index}`}
                                    className={`complete-match-bonus-tag bonus-color-${getModifierColor(tagId)}`}
                                  >
                                    <span className="complete-match-bonus-icon">
                                      {getModifierIcon(tagId)}
                                    </span>
                                    <span className="complete-match-bonus-text">
                                      {getModifierName(tagId)}
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
                                ),
                              )}
                              {(penaltyTags[userId] || []).map(
                                (tagId, index) => (
                                  <div
                                    key={`malus-${index}`}
                                    className={`complete-match-bonus-tag malus-color-${getModifierColor(tagId)}`}
                                  >
                                    <span className="complete-match-bonus-icon">
                                      {getModifierIcon(tagId)}
                                    </span>
                                    <span className="complete-match-bonus-text">
                                      {getModifierName(tagId)}
                                    </span>
                                    <button
                                      type="button"
                                      className="complete-match-bonus-remove"
                                      onClick={() =>
                                        handleRemoveSinglePenalty(userId, index)
                                      }
                                      title="Rimuovi malus"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ),
                              )}
                            </div>
                          ) : (
                            <span className="complete-match-modifier-empty">
                              Nessuno
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          className="complete-match-bonus-add-btn"
                          onClick={() => handleOpenModifierAssign(userId)}
                          title="Aggiungi bonus o malus"
                        >
                          <Plus size={16} />
                          <span>Aggiungi</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Section: Turns | Victory Type | Winner */}
          <div className="complete-match-footer">
            {/* Turns */}
            <div className="complete-match-footer-field">
              <div className="complete-match-field-horizontal">
                <div className="complete-match-field-left">
                  <div className="complete-match-field-icon">
                    <Clock size={20} />
                  </div>
                  <label className="complete-match-field-label">Turno</label>
                </div>
                <div className="complete-match-field-separator">|</div>
                <div className="complete-match-field-right">
                  <input
                    type="number"
                    className="complete-match-field-input"
                    value={turns}
                    onChange={(e) => setTurns(parseInt(e.target.value) || 0)}
                    onFocus={(e) => e.target.select()}
                    placeholder="300 (opzionale)"
                    min="0"
                    max="9999"
                  />
                </div>
              </div>
            </div>

            {/* Victory Type / Outcome */}
            <div className="complete-match-footer-field">
              <div className="complete-match-field-horizontal">
                <div className="complete-match-field-left">
                  <div className="complete-match-field-icon">
                    <Award size={20} />
                  </div>
                  <label className="complete-match-field-label">Esito</label>
                </div>
                <div className="complete-match-field-separator">|</div>
                <div className="complete-match-field-right">
                  {victoryType ? (
                    <button
                      type="button"
                      className="complete-match-field-value-display"
                      onClick={() => setShowVictoryTypeSelect(true)}
                    >
                      {getVictoryTypeData()?.icon ? (
                        <img
                          src={getVictoryTypeData().icon}
                          alt={getVictoryTypeData().name}
                          className="complete-match-victory-icon"
                        />
                      ) : (
                        <X size={24} className="complete-match-defeat-icon" />
                      )}
                      <span className="complete-match-value-text">
                        {getVictoryTypeName()}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="complete-match-assign-btn"
                      onClick={() => setShowVictoryTypeSelect(true)}
                    >
                      Assegna
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Winner */}
            <div className="complete-match-footer-field">
              <div className="complete-match-field-horizontal">
                <div className="complete-match-field-left">
                  <div className="complete-match-field-icon">
                    <Trophy size={20} />
                  </div>
                  <label className="complete-match-field-label">
                    Vincitore
                  </label>
                </div>
                <div className="complete-match-field-separator">|</div>
                <div className="complete-match-field-right">
                  {victoryType === "canceled" || victoryType === "defeat" ? (
                    <div className="complete-match-field-none">Nessuno</div>
                  ) : winnerId ? (
                    <button
                      type="button"
                      className="complete-match-field-value-display"
                      onClick={() => setShowWinnerSelect(true)}
                    >
                      <Avatar
                        photoURL={getWinnerData()?.photoURL}
                        displayName={getWinnerData()?.username}
                        email={null}
                        size={32}
                        className="complete-match-winner-avatar"
                      />
                      <span className="complete-match-value-text">
                        {getWinnerName()}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="complete-match-assign-btn"
                      onClick={() => setShowWinnerSelect(true)}
                    >
                      Assegna
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Bonus/Malus info modal */}
      <BonusMalusModal
        key="modifier-info"
        isOpen={showModifierInfo}
        onClose={() => setShowModifierInfo(false)}
        mode="info"
      />

      {/* Bonus/Malus assignment modal */}
      <BonusMalusModal
        key={`modifier-assign-${currentUserId}-${showModifierAssign}`}
        isOpen={showModifierAssign}
        onClose={() => {
          setShowModifierAssign(false);
          setCurrentUserId(null);
        }}
        mode="assign"
        participantName={currentParticipant?.username || ""}
        currentBonusTags={currentUserId ? bonusTags[currentUserId] || [] : []}
        currentPenaltyTags={
          currentUserId ? penaltyTags[currentUserId] || [] : []
        }
        onAssign={handleAssignModifiers}
      />

      {/* Winner Select Modal */}
      <WinnerSelectModal
        isOpen={showWinnerSelect}
        onClose={() => setShowWinnerSelect(false)}
        onConfirm={handleSelectWinner}
        participants={participants}
        leaders={leaders}
        selectedWinnerId={winnerId}
      />

      {/* Victory Type Select Modal */}
      <VictoryTypeSelectModal
        isOpen={showVictoryTypeSelect}
        onClose={() => setShowVictoryTypeSelect(false)}
        onConfirm={handleSelectVictoryType}
        victoryCounts={victoryCounts}
        selectedVictoryType={victoryType}
      />
    </>
  );
}
