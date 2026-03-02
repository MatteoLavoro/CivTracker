// Victory Type Select Modal - Select victory type with dynamic points
import { Check } from "lucide-react";
import { Modal } from "./Modal";
import { calculateVictoryPoints } from "../../utils/scoreUtils";
import "./VictoryTypeSelectModal.css";

/**
 * VictoryTypeSelectModal Component
 * Select victory type/outcome with current point values
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback when modal closes
 * @param {Function} onConfirm - Callback when victory type is confirmed (victoryTypeId)
 * @param {Object} victoryCounts - Current victory counts
 * @param {string} selectedVictoryType - Currently selected victory type ID
 */
export function VictoryTypeSelectModal({
  isOpen,
  onClose,
  onConfirm,
  victoryCounts = {},
  selectedVictoryType = "",
}) {
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
      id: "defeat",
      name: "Sconfitta",
      icon: null,
    },
  ];

  const handleSelectVictoryType = (victoryTypeId) => {
    onConfirm(victoryTypeId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Seleziona Esito">
      <div className="victory-type-select-content">
        <div className="victory-type-select-description">
          <p>
            I punti variano in base alla rarità.{" "}
            <span style={{ opacity: 0.7 }}>
              Nota: i valori cambieranno dopo aver salvato questa partita.
            </span>
          </p>
        </div>

        <div className="victory-type-select-list">
          {victoryTypes.map((victory) => {
            const points = calculateVictoryPoints(victory.id, victoryCounts);
            const isSelected = victory.id === selectedVictoryType;
            const isDefeat = victory.id === "defeat";

            return (
              <div
                key={victory.id}
                className={`victory-type-select-item ${isSelected ? "selected" : ""} ${isDefeat ? "defeat" : ""}`}
                onClick={() => handleSelectVictoryType(victory.id)}
              >
                <div className="victory-type-select-info">
                  {victory.icon && (
                    <div className="victory-type-select-icon-wrapper">
                      <img
                        src={victory.icon}
                        alt={victory.name}
                        className="victory-type-select-icon"
                      />
                    </div>
                  )}
                  {!victory.icon && (
                    <div className="victory-type-select-icon-placeholder">
                      ✕
                    </div>
                  )}
                  <div className="victory-type-select-details">
                    <h3 className="victory-type-select-name">{victory.name}</h3>
                  </div>
                </div>

                <div className="victory-type-select-points">
                  {!isDefeat ? (
                    <span className="victory-type-select-points-value">
                      {points} PT
                    </span>
                  ) : (
                    <span className="victory-type-select-points-defeat">
                      0 PT
                    </span>
                  )}
                </div>

                {isSelected && (
                  <div className="victory-type-select-check">
                    <Check size={20} />
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
