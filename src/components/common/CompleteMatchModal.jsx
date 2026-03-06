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
  ChevronRight,
} from "lucide-react";
import {
  Modal,
  Avatar,
  BonusInfoModal,
  WinnerSelectModal,
  VictoryTypeSelectModal,
} from "./";
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
  const [showBonusInfo, setShowBonusInfo] = useState(false);
  const [showBonusAssign, setShowBonusAssign] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showOverflowBonusInfo, setShowOverflowBonusInfo] = useState(false);
  const [overflowBonusList, setOverflowBonusList] = useState([]);
  const [showWinnerSelect, setShowWinnerSelect] = useState(false);
  const [showVictoryTypeSelect, setShowVictoryTypeSelect] = useState(false);

  // Max visible bonus tags before showing "Altri bonus"
  const MAX_VISIBLE_BONUS = 2;

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

  const getBonusColor = (bonusId) => {
    switch (bonusId) {
      case BONUS_TAGS.SECOND_PLACE:
        return "silver"; // Silver for second place
      case BONUS_TAGS.SURVIVOR:
        return "green"; // Green for survivor
      default:
        return "default";
    }
  };

  const handleShowOverflowBonuses = (userId) => {
    const tags = bonusTags[userId] || [];
    setOverflowBonusList(tags);
    setCurrentUserId(userId);
    setShowOverflowBonusInfo(true);
  };

  const handleRemoveFromOverflow = (indexToRemove) => {
    if (currentUserId) {
      handleRemoveSingleBonus(currentUserId, indexToRemove);
      // Update the overflow list
      const updatedTags = bonusTags[currentUserId].filter(
        (_, index) => index !== indexToRemove,
      );
      setOverflowBonusList(updatedTags);
      // Close modal if no more bonuses
      if (updatedTags.length === 0) {
        setShowOverflowBonusInfo(false);
        setOverflowBonusList([]);
        setCurrentUserId(null);
      }
    }
  };

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
    if (turns <= 0) {
      alert("Inserisci il turno di vittoria");
      return;
    }

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
    victoryType &&
    (victoryType === "canceled" || victoryType === "defeat" || winnerId) && // Winner not required for canceled/defeat
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

                    {/* Bonus Tags */}
                    <td className="complete-match-bonus-td">
                      <div className="complete-match-bonus-cell">
                        <div className="complete-match-bonus-tags-container">
                          {bonusTags[userId] && bonusTags[userId].length > 0 ? (
                            <div className="complete-match-bonus-tags">
                              {bonusTags[userId]
                                .slice(0, MAX_VISIBLE_BONUS)
                                .map((tagId, index) => (
                                  <div
                                    key={index}
                                    className={`complete-match-bonus-tag bonus-color-${getBonusColor(tagId)}`}
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
                              {bonusTags[userId].length > MAX_VISIBLE_BONUS && (
                                <div
                                  className="complete-match-bonus-tag bonus-overflow"
                                  onClick={() =>
                                    handleShowOverflowBonuses(userId)
                                  }
                                  title="Visualizza tutti i bonus"
                                >
                                  <span className="complete-match-bonus-icon">
                                    <Award size={14} />
                                  </span>
                                  <span className="complete-match-bonus-text">
                                    Altri{" "}
                                    {bonusTags[userId].length -
                                      MAX_VISIBLE_BONUS}{" "}
                                    bonus
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
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
                    placeholder="300"
                    min="1"
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

      {/* Overflow Bonus Info Modal */}
      <BonusInfoModal
        key="bonus-overflow-info"
        isOpen={showOverflowBonusInfo}
        onClose={() => {
          setShowOverflowBonusInfo(false);
          setOverflowBonusList([]);
          setCurrentUserId(null);
        }}
        mode="overflow"
        currentBonusTags={overflowBonusList}
        onRemove={handleRemoveFromOverflow}
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
