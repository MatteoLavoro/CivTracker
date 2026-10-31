// Bonus/Malus Modal - unified info and assignment for match modifiers
import { useState } from "react";
import {
  Award,
  Medal,
  Swords,
  RotateCcw,
  Flame,
  ShieldAlert,
  Plus,
  Check,
  X,
} from "lucide-react";
import { Modal } from "./Modal";
import { BONUS_INFO, PENALTY_INFO } from "../../utils/scoreUtils";
import "./BonusMalusModal.css";

const MODIFIER_ICONS = {
  "second-place": Medal,
  survivor: Swords,
  "map-reroll": RotateCcw,
  "rage-quit": Flame,
  "rule-violation": ShieldAlert,
};

/**
 * BonusMalusModal Component
 * Unified modal to show and assign both bonuses and maluses.
 *
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Close handler
 * @param {string} props.mode - "info" for display only, "assign" for selection
 * @param {string} props.participantName - Player the modifiers are assigned to
 * @param {Array} props.currentBonusTags - Currently selected bonus ids
 * @param {Array} props.currentPenaltyTags - Currently selected malus ids
 * @param {Function} props.onAssign - Called with { bonusTags, penaltyTags }
 */
export function BonusMalusModal({
  isOpen,
  onClose,
  mode = "info",
  participantName = "",
  currentBonusTags = [],
  currentPenaltyTags = [],
  onAssign = null,
}) {
  const [activeTab, setActiveTab] = useState("bonus");
  const [bonusTags, setBonusTags] = useState([...currentBonusTags]);
  const [penaltyTags, setPenaltyTags] = useState([...currentPenaltyTags]);

  const isAssign = mode === "assign";
  const isBonusTab = activeTab === "bonus";
  const allTags = isBonusTab ? BONUS_INFO : PENALTY_INFO;
  // Automatic modifiers (e.g. draft preference) are never assignable/removable
  const tags = isAssign
    ? allTags.filter((tag) => !tag.automatic)
    : allTags;
  const selected = isBonusTab ? bonusTags : penaltyTags;

  const addTag = (tagId) => {
    if (!isAssign) return;
    if (isBonusTab) {
      setBonusTags((prev) => [...prev, tagId]);
    } else {
      setPenaltyTags((prev) => [...prev, tagId]);
    }
  };

  const removeTag = (index) => {
    if (!isAssign) return;
    if (isBonusTab) {
      setBonusTags((prev) => prev.filter((_, i) => i !== index));
    } else {
      setPenaltyTags((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleConfirm = () => {
    onAssign?.({ bonusTags, penaltyTags });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isAssign
          ? `Bonus e Malus${participantName ? ` — ${participantName}` : ""}`
          : "Bonus e Malus"
      }
      footer={
        isAssign
          ? {
              label: "Conferma",
              icon: <Check size={20} />,
              onConfirm: handleConfirm,
              disabled: false,
            }
          : null
      }
    >
      <div className="modifier-content">
        <p className="modifier-intro">
          I bonus e i malus sono modificatori percentuali applicati ai{" "}
          <strong>punti elaborati</strong> per calcolare i{" "}
          <strong>punti finali</strong>. Si sommano tra loro e possono essere
          assegnati più volte.
        </p>

        <div className="modifier-tabs" role="tablist" aria-label="Tipo">
          <button
            type="button"
            role="tab"
            aria-selected={isBonusTab}
            className={`modifier-tab ${isBonusTab ? "active" : ""}`}
            onClick={() => setActiveTab("bonus")}
          >
            <Award size={16} />
            <span>Bonus</span>
            <span className="modifier-tab-count">{bonusTags.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isBonusTab}
            className={`modifier-tab modifier-tab-malus ${!isBonusTab ? "active" : ""}`}
            onClick={() => setActiveTab("malus")}
          >
            <ShieldAlert size={16} />
            <span>Malus</span>
            <span className="modifier-tab-count">{penaltyTags.length}</span>
          </button>
        </div>

        {isAssign && selected.length > 0 && (
          <div className="modifier-selected">
            <span className="modifier-selected-label">
              {isBonusTab ? "Bonus selezionati" : "Malus selezionati"}
            </span>
            <div className="modifier-selected-list">
              {selected.map((tagId, index) => {
                const info = tags.find((tag) => tag.id === tagId);
                if (!info) return null;
                return (
                  <button
                    key={`${tagId}-${index}`}
                    type="button"
                    className={`modifier-chip modifier-color-${info.color}`}
                    onClick={() => removeTag(index)}
                    title="Rimuovi"
                  >
                    {info.name}
                    <X size={12} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="modifier-list">
          {tags.map((info) => {
            const Icon = MODIFIER_ICONS[info.id] || Award;
            const count = selected.filter((tagId) => tagId === info.id).length;
            return (
              <div
                key={info.id}
                className={`modifier-card modifier-color-${info.color} ${
                  isAssign ? "clickable" : ""
                }`}
                onClick={isAssign ? () => addTag(info.id) : undefined}
                onKeyDown={
                  isAssign
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          addTag(info.id);
                        }
                      }
                    : undefined
                }
                role={isAssign ? "button" : undefined}
                tabIndex={isAssign ? 0 : undefined}
              >
                <div className="modifier-card-icon">
                  <Icon size={22} />
                </div>
                <div className="modifier-card-body">
                  <div className="modifier-card-head">
                    <strong>{info.name}</strong>
                    <span className="modifier-value">
                      {isBonusTab ? "+" : "−"}
                      {info.percent}%
                    </span>
                    {count > 0 && (
                      <span className="modifier-count">×{count}</span>
                    )}
                  </div>
                  <p className="modifier-card-description">
                    {info.description}
                  </p>
                </div>
                {isAssign && (
                  <div className="modifier-add" aria-hidden="true">
                    <Plus size={16} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {isAssign && (
          <p className="modifier-hint">
            Clicca un modificatore per aggiungerlo. Puoi assegnare più copie
            dello stesso bonus (es. un Sopravvissuto per ogni guerra).
          </p>
        )}
      </div>
    </Modal>
  );
}
