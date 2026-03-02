// Victory Info Modal - Victory scoring calculator
import { Modal } from "./";
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
  ];

  /**
   * Calculate victory points based on logarithmic formula
   * Formula: MAX(50, MIN(150, 100 - 50 * SIGN(d) * LN(1 + ABS(d)) / LN(6)))
   * Where d = deviation from average
   * - d = +5 → 50 points (most common)
   * - d = -5 → 150 points (most rare)
   * - d = 0 → 100 points (balanced)
   */
  const calculatePoints = (victoryId) => {
    const totalVictories = Object.values(victoryCounts).reduce(
      (sum, count) => sum + count,
      0,
    );

    if (totalVictories === 0) return 100;

    // Calculate deviation from average
    const average = totalVictories / victories.length;
    const count = victoryCounts[victoryId] || 0;
    const deviation = count - average;

    // Logarithmic formula with limits
    const points = Math.max(
      50,
      Math.min(
        150,
        100 -
          50 *
            Math.sign(deviation) *
            (Math.log(1 + Math.abs(deviation)) / Math.log(6)),
      ),
    );

    return Math.round(points);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Punteggi Vittorie">
      <div className="victory-info-content">
        <div className="victory-info-description">
          <p>
            I punti variano da <strong>50 a 150</strong> in base alla rarità.
            Vittorie rare valgono di più.
          </p>
        </div>

        <div className="victory-table">
          {victories.map((victory) => {
            const points = calculatePoints(victory.id);
            const count = victoryCounts[victory.id] || 0;

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
                <div className="victory-points-large">{points} PT</div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
