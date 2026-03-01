// Add Match Button Component
import { UserPlus } from "lucide-react";
import "./AddMatchButton.css";

/**
 * AddMatchButton - Large dashed button to add new match
 * @param {Function} onClick - Handler for click
 * @param {boolean} disabled - Whether button is disabled
 */
export function AddMatchButton({ onClick, disabled = false }) {
  return (
    <button
      className={`add-match-btn ${disabled ? "disabled" : ""}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      <UserPlus size={38} className="add-match-icon" />
      <span className="add-match-text">Nuova Partita</span>
    </button>
  );
}
