// Bonus Info Modal - Display bonus tags and their effects
import { useState } from "react";
import { Award, Swords, Medal } from "lucide-react";
import { Modal } from "./";
import "./BonusInfoModal.css";

/**
 * BonusInfoModal Component
 * Dual-purpose modal: info display or bonus assignment
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback when modal closes
 * @param {string} mode - 'info' for display only, 'assign' for selection
 * @param {Array} currentBonusTags - Current bonus tags (for assign mode)
 * @param {Function} onAssign - Callback when confirming assignment (bonus tag ids array)
 */
export function BonusInfoModal({
  isOpen,
  onClose,
  mode = "info",
  currentBonusTags = [],
  onAssign = null,
}) {
  // Initialize with currentBonusTags - will reset on unmount/remount via key prop
  const [selectedTags, setSelectedTags] = useState(
    mode === "assign" ? [...currentBonusTags] : [],
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

  const getIconForBonus = (bonusId) => {
    switch (bonusId) {
      case "second-place":
        return <Medal size={24} />;
      case "survivor":
        return <Swords size={24} />;
      default:
        return <Award size={24} />;
    }
  };
  const bonusTags = [
    {
      id: "second-place",
      name: "Secondo Posto",
      bonus: "+15%",
      color: "rgba(192, 192, 192, 1)", // Silver
      description:
        "Assegnato al secondo classificato. Ricevi un bonus del 15% sui punti elaborati. Può essere assegnato manualmente.",
      icon: "medal",
    },
    {
      id: "survivor",
      name: "Sopravvissuto",
      bonus: "+10%",
      color: "rgba(76, 175, 80, 1)", // Green
      description:
        "Assegnato a chi vince mentre in guerra da meno di 30 turni. Ricevi un bonus del 10% sui punti elaborati. Può essere assegnato multiplo (uno per ogni guerra attiva).",
      icon: "swords",
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "assign" ? "Assegna Bonus" : "Bonus Disponibili"}
      footer={
        mode === "assign"
          ? {
              label: "Conferma",
              icon: <Award size={20} />,
              onConfirm: handleConfirm,
              disabled: false,
            }
          : null
      }
    >
      <div className="bonus-info-content">
        <div className="bonus-info-description">
          <p>
            I bonus sono modificatori percentuali che si applicano ai{" "}
            <strong>punteggi elaborati</strong> per calcolare i{" "}
            <strong>punteggi finali</strong>. I bonus si sommano tra loro.
          </p>
        </div>

        {mode === "assign" && selectedTags.length > 0 && (
          <div className="bonus-selected-section">
            <h4>Bonus Selezionati:</h4>
            <div className="bonus-selected-list">
              {selectedTags.map((tagId, index) => {
                const bonus = bonusTags.find((b) => b.id === tagId);
                return (
                  <div key={index} className="bonus-selected-tag">
                    <div
                      className="bonus-selected-icon"
                      style={{ color: bonus.color }}
                    >
                      {getIconForBonus(tagId)}
                    </div>
                    <span>{bonus.name}</span>
                    <button
                      type="button"
                      className="bonus-remove-btn"
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

        <div className="bonus-list">
          {bonusTags.map((bonus) => (
            <div
              key={bonus.id}
              className={`bonus-card ${mode === "assign" ? "clickable" : ""}`}
              onClick={
                mode === "assign" ? () => handleToggleTag(bonus.id) : undefined
              }
            >
              <div className="bonus-header">
                <div
                  className="bonus-icon-wrapper"
                  style={{ borderColor: bonus.color }}
                >
                  <div style={{ color: bonus.color }}>
                    {getIconForBonus(bonus.id)}
                  </div>
                </div>
                <div className="bonus-title-section">
                  <h3 className="bonus-name">{bonus.name}</h3>
                  <span className="bonus-value" style={{ color: bonus.color }}>
                    {bonus.bonus}
                  </span>
                </div>
              </div>
              <p className="bonus-description">{bonus.description}</p>
            </div>
          ))}
        </div>

        <div className="bonus-info-footer">
          <p className="bonus-info-note">
            <strong>Nota:</strong> Puoi assegnare lo stesso bonus più volte. Le
            percentuali si sommano.
          </p>
        </div>
      </div>
    </Modal>
  );
}
