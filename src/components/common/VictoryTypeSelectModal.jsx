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

  const handleSelectVictoryType = (victoryTypeId) => {
    onConfirm(victoryTypeId);
  };

  // Group victory types into sections
  const normalVictories = victoryTypes.filter((v) =>
    [
      "science",
      "culture",
      "diplomatic",
      "domination",
      "religious",
      "score",
    ].includes(v.id),
  );
  const forfaitVictory = victoryTypes.find((v) => v.id === "forfait");
  const defeatOutcome = victoryTypes.find((v) => v.id === "defeat");
  const canceledOutcome = victoryTypes.find((v) => v.id === "canceled");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Seleziona Esito">
      <div className="victory-type-select-content">
        <div className="victory-type-select-list">
          {/* Normal Victories */}
          {normalVictories.map((victory) => {
            const points = calculateVictoryPoints(victory.id, victoryCounts);
            const isSelected = victory.id === selectedVictoryType;
            const totalPool = 200;

            return (
              <div
                key={victory.id}
                className={`victory-type-select-item ${isSelected ? "selected" : ""}`}
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
                  <div className="victory-type-select-details">
                    <h3 className="victory-type-select-name">{victory.name}</h3>
                  </div>
                </div>

                <div className="victory-type-select-points">
                  <span className="victory-type-select-points-main">
                    {points} PT
                  </span>
                  <span className="victory-type-select-points-sub">
                    [su {totalPool}]
                  </span>
                </div>
              </div>
            );
          })}

          {/* Divider */}
          <div className="victory-type-select-divider"></div>

          {/* Forfait Victory */}
          {forfaitVictory && (
            <div
              className={`victory-type-select-item ${selectedVictoryType === "forfait" ? "selected" : ""}`}
              onClick={() => handleSelectVictoryType("forfait")}
            >
              <div className="victory-type-select-info">
                <div className="victory-type-select-icon-wrapper">
                  <img
                    src={forfaitVictory.icon}
                    alt={forfaitVictory.name}
                    className="victory-type-select-icon"
                  />
                </div>
                <div className="victory-type-select-details">
                  <h3 className="victory-type-select-name">
                    {forfaitVictory.name}
                  </h3>
                </div>
              </div>

              <div className="victory-type-select-points">
                <span className="victory-type-select-points-main">50 PT</span>
                <span className="victory-type-select-points-sub">[su 100]</span>
              </div>
            </div>
          )}

          {/* Defeat Outcome */}
          {defeatOutcome && (
            <div
              className={`victory-type-select-item defeat ${selectedVictoryType === "defeat" ? "selected" : ""}`}
              onClick={() => handleSelectVictoryType("defeat")}
            >
              <div className="victory-type-select-info">
                <div className="victory-type-select-icon-wrapper">
                  <img
                    src={defeatOutcome.icon}
                    alt={defeatOutcome.name}
                    className="victory-type-select-icon"
                  />
                </div>
                <div className="victory-type-select-details">
                  <h3 className="victory-type-select-name">
                    {defeatOutcome.name}
                  </h3>
                </div>
              </div>

              <div className="victory-type-select-points">
                <span className="victory-type-select-points-main">0 PT</span>
                <span className="victory-type-select-points-sub">[su 100]</span>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="victory-type-select-divider"></div>

          {/* Canceled Outcome */}
          {canceledOutcome && (
            <div
              className={`victory-type-select-item defeat ${selectedVictoryType === "canceled" ? "selected" : ""}`}
              onClick={() => handleSelectVictoryType("canceled")}
            >
              <div className="victory-type-select-info">
                <div className="victory-type-select-icon-wrapper">
                  <img
                    src={canceledOutcome.icon}
                    alt={canceledOutcome.name}
                    className="victory-type-select-icon"
                  />
                </div>
                <div className="victory-type-select-details">
                  <h3 className="victory-type-select-name">
                    {canceledOutcome.name}
                  </h3>
                </div>
              </div>

              <div className="victory-type-select-points">
                <span className="victory-type-select-points-main">0 PT</span>
                <span className="victory-type-select-points-sub">[su 0]</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
