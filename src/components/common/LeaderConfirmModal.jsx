// Leader Confirm Modal - Confirmation dialog for leader selection
import { Check } from "lucide-react";
import { Modal } from "./Modal";
import "./LeaderConfirmModal.css";

/**
 * Leader Confirmation Modal Component
 * Used for confirming leader selection with visual preview
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onConfirm - Confirm action handler
 * @param {Object} props.leader - Leader object with name, variant, civilization, icons
 */
export function LeaderConfirmModal({ isOpen, onClose, onConfirm, leader }) {
  const handleConfirm = () => {
    onConfirm();
    window.history.back();
  };

  if (!leader) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Conferma Scelta"
      footer={{
        onConfirm: handleConfirm,
        label: "Conferma",
        icon: <Check size={24} />,
        dangerous: false,
        variant: "success",
      }}
      className="leader-confirm-modal"
    >
      <div className="leader-confirm-content">
        <div className="leader-confirm-icons">
          <img
            src={leader.leaderIconPath}
            alt={leader.name}
            className="leader-confirm-leader-icon"
          />
          <img
            src={leader.civilizationIconPath}
            alt={leader.civilization}
            className="leader-confirm-civ-icon"
          />
        </div>

        <div className="leader-confirm-info">
          <h3 className="leader-confirm-name">
            {leader.name}
            {leader.variant && (
              <span className="leader-confirm-variant">
                {" "}
                - {leader.variant}
              </span>
            )}
          </h3>
          <p className="leader-confirm-civ">{leader.civilization}</p>
        </div>

        <p className="leader-confirm-message">
          Sei sicuro di voler scegliere questo leader?
        </p>
      </div>
    </Modal>
  );
}
