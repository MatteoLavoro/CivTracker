// Victory Info Modal - Victory scoring calculator
import { Modal } from "./";
import {
  calculateVictoryPoints,
  getTotalPointsPool,
} from "../../utils/scoreUtils";
import "./VictoryInfoModal.css";

/**
 * VictoryInfoModal Component
 * Displays all victory types with dynamic scoring based on rarity
 *
 * Formula: V = 100 - 50 * SIGN(d) * (LOG(1 + ABS(d)) / LOG(1 + 5))
 * Where d = deviation from average
 * - d <= -5: V = 150 PT (rarest victory)
 * - d = 0: V = 100 PT (balanced)
 * - d >= 5: V = 50 PT (most common)
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback when modal closes
 * @param {Object} victoryCounts - Object with victory type counts from completed matches
 */
export function VictoryInfoModal({ isOpen, onClose, victoryCounts = {} }) {
  const victories = [
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
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Punteggi Vittorie">
      <div className="victory-info-content">
        <div className="victory-info-description">
          <p>
            I punti variano da <strong>50 a 150</strong> in base alla rarità.
            Vittorie rare valgono di più.
          </p>
          <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", opacity: 0.7 }}>
            Il vincitore riceve questi punti. I restanti punti vengono
            distribuiti proporzionalmente ai punteggi raw di tutti i giocatori.
          </p>
        </div>

        <div className="victory-table">
          {victories.map((victory) => {
            const points = calculateVictoryPoints(victory.id, victoryCounts);
            const count = victoryCounts[victory.id] || 0;
            const totalPool = getTotalPointsPool(victory.id);

            return (
              <div key={victory.id} className="victory-row">
                <div className="victory-info-left">
                  <div className="victory-icon-wrapper">
                    <img
                      src={victory.icon}
                      alt={victory.name}
                      className="victory-icon"
                    />
                  </div>
                  <div className="victory-details">
                    <h3 className="victory-name">{victory.name}</h3>
                    <div className="victory-count-display">
                      {count} {count === 1 ? "volta" : "volte"}
                    </div>
                  </div>
                </div>
                <div className="victory-points-large">
                  <span className="victory-points-value">{points} PT</span>
                  <span className="victory-points-pool">[su {totalPool}]</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
