// Complete Match Modal - Complete match with all details
import { useState, useMemo } from "react";
import { Trophy, Clock, Target, Award } from "lucide-react";
import { Modal } from "./";
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

  const victoryTypes = [
    { id: "science", name: "Vittoria Scientifica" },
    { id: "culture", name: "Vittoria Culturale" },
    { id: "diplomatic", name: "Vittoria Diplomatica" },
    { id: "domination", name: "Vittoria per Dominio" },
    { id: "religious", name: "Vittoria Religiosa" },
    { id: "score", name: "Vittoria per Punti" },
  ];

  const handleScoreChange = (userId, value) => {
    const numValue = parseInt(value) || 0;
    setScores((prev) => ({ ...prev, [userId]: numValue }));
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

    // Check if all scores are set
    const allScoresSet = participants.every(
      ([userId]) => scores[userId] && scores[userId] > 0,
    );

    if (!allScoresSet) {
      alert("Imposta i punteggi per tutti i giocatori");
      return;
    }

    // Call confirm with all data
    onConfirm({
      turns,
      scores,
      winnerId,
      victoryType,
    });
  };

  const isValid =
    turns > 0 &&
    winnerId &&
    victoryType &&
    participants.every(([userId]) => scores[userId] > 0);

  const isEditing = match?.status === "completed";
  const modalTitle = isEditing ? "Modifica Partita" : "Completa Partita";
  const confirmLabel = isEditing ? "Salva Modifiche" : "Completa Partita";

  return (
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
    >
      <div className="complete-match-content">
        {/* Turns Field */}
        <div className="complete-match-field">
          <div className="complete-match-field-icon">
            <Clock size={20} />
          </div>
          <div className="complete-match-field-content">
            <label className="complete-match-label">Turno di Vittoria</label>
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

        {/* Scores Section */}
        <div className="complete-match-section">
          <div className="complete-match-section-header">
            <Target size={18} />
            <span>Punteggi Giocatori</span>
          </div>
          <div className="complete-match-scores">
            {participants.map(([userId, participant]) => (
              <div key={userId} className="complete-match-score-row">
                <div className="complete-match-player-info">
                  <div className="complete-match-player-avatar">
                    {participant.username?.substring(0, 2).toUpperCase() || "?"}
                  </div>
                  <span className="complete-match-player-name">
                    {participant.username}
                  </span>
                </div>
                <input
                  type="number"
                  className="complete-match-score-input"
                  value={scores[userId] || 0}
                  onChange={(e) => handleScoreChange(userId, e.target.value)}
                  placeholder="Punteggio"
                  min="0"
                  max="999999"
                />
              </div>
            ))}
          </div>
        </div>

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
            <label className="complete-match-label">Tipo di Vittoria</label>
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
    </Modal>
  );
}
