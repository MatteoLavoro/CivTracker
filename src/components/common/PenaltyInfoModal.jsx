// Penalty Info Modal - Display penalty tags and their effects
import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Modal } from "./";
import "./PenaltyInfoModal.css";

/**
 * PenaltyInfoModal Component
 * Dual-purpose modal: info display or penalty assignment
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback when modal closes
 * @param {string} mode - 'info' for display only, 'assign' for selection, 'overflow' for assigned list
 * @param {Array} currentPenaltyTags - Current penalty tags (for assign mode)
 * @param {Function} onAssign - Callback when confirming assignment (penalty tag ids array)
 * @param {Function} onRemove - Callback when removing a penalty from overflow (index)
 */
export function PenaltyInfoModal({
  isOpen,
  onClose,
  mode = "info",
  currentPenaltyTags = [],
  onAssign = null,
  onRemove = null,
}) {
  // Initialize with currentPenaltyTags - will reset on unmount/remount via key prop
  const [selectedTags, setSelectedTags] = useState(
    mode === "assign" ? [...currentPenaltyTags] : [],
  );

  const handleToggleTag = (tagId) => {
    setSelectedTags((prev) => [...prev, tagId]);
  };

  const handleRemoveTag = (index) => {
    setSelectedTags((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    if (onAssign) {
      onAssign(selectedTags);
    }
    onClose();
  };

  const getIconForPenalty = () => {
    return <AlertTriangle size={24} />;
  };

  const penaltyTags = [
    {
      id: "map-reroll",
      name: "Rerol Mappa",
      penalty: "-10%",
      color: "rgba(255, 152, 0, 1)", // Orange
      description:
        "Assegnato a chi richiede un reroll della mappa. Ricevi una penalità del 10% sui punti elaborati.",
      icon: "alert-triangle",
    },
    {
      id: "rage-quit",
      name: "Rage Quit",
      penalty: "-20%",
      color: "rgba(244, 67, 54, 1)", // Red
      description:
        "Assegnato a chi abbandona la partita in modo inappropriato. Ricevi una penalità del 20% sui punti elaborati.",
      icon: "alert-triangle",
    },
    {
      id: "rule-violation",
      name: "Violazione Regole",
      penalty: "-50%",
      color: "rgba(156, 39, 176, 1)", // Purple
      description:
        "Assegnato a chi viola le regole del gioco. Ricevi una penalità del 50% sui punti elaborati.",
      icon: "alert-triangle",
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === "assign"
          ? "Assegna Penalità"
          : mode === "overflow"
            ? "Penalità Applicate"
            : "Malus Disponibili"
      }
      footer={
        mode === "assign"
          ? {
              label: "Conferma",
              icon: <AlertTriangle size={20} />,
              onConfirm: handleConfirm,
              disabled: false,
            }
          : null
      }
    >
      <div className="penalty-info-content">
        {mode !== "overflow" && (
          <div className="penalty-info-description">
            <p>
              Le penalità sono modificatori percentuali negativi che si
              applicano ai <strong>punteggi elaborati</strong> per calcolare i{" "}
              <strong>punteggi finali</strong>.
            </p>
          </div>
        )}

        {mode === "assign" && selectedTags.length > 0 && (
          <div className="penalty-selected-section">
            <h4>Penalità Selezionate:</h4>
            <div className="penalty-selected-list">
              {selectedTags.map((tagId, index) => {
                const penalty = penaltyTags.find((p) => p.id === tagId);
                return (
                  <div key={index} className="penalty-selected-tag">
                    <div
                      className="penalty-selected-icon"
                      style={{ color: penalty.color }}
                    >
                      {getIconForPenalty(tagId)}
                    </div>
                    <span>{penalty.name}</span>
                    <button
                      type="button"
                      className="penalty-remove-btn"
                      onClick={() => handleRemoveTag(index)}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="penalty-list">
          {mode === "overflow"
            ? // Overflow mode: show assigned tags in compact form
              currentPenaltyTags.map((tagId, index) => {
                const penalty = penaltyTags.find((p) => p.id === tagId);
                if (!penalty) return null;
                return (
                  <div key={index} className="penalty-overflow-item">
                    <div className="penalty-overflow-content">
                      <div
                        className="penalty-overflow-icon"
                        style={{ color: penalty.color }}
                      >
                        {getIconForPenalty(tagId)}
                      </div>
                      <div className="penalty-overflow-info">
                        <span className="penalty-overflow-name">
                          {penalty.name}
                        </span>
                        <span
                          className="penalty-overflow-value"
                          style={{ color: penalty.color }}
                        >
                          {penalty.penalty}
                        </span>
                      </div>
                    </div>
                    {onRemove && (
                      <button
                        type="button"
                        className="penalty-overflow-remove"
                        onClick={() => onRemove(index)}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                );
              })
            : // Info or assign mode: show all available penalties
              penaltyTags.map((penalty) => (
                <div key={penalty.id} className="penalty-item">
                  <div className="penalty-header">
                    <div
                      className="penalty-icon"
                      style={{ color: penalty.color }}
                    >
                      {getIconForPenalty(penalty.id)}
                    </div>
                    <div className="penalty-info">
                      <div className="penalty-name-row">
                        <span className="penalty-name">{penalty.name}</span>
                        <span
                          className="penalty-value"
                          style={{ color: penalty.color }}
                        >
                          {penalty.penalty}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="penalty-description">
                    <p>{penalty.description}</p>
                  </div>
                  {mode === "assign" && (
                    <button
                      type="button"
                      className="penalty-add-btn"
                      onClick={() => handleToggleTag(penalty.id)}
                    >
                      + Aggiungi
                    </button>
                  )}
                </div>
              ))}
        </div>
      </div>
    </Modal>
  );
}
