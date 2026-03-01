// Confirm Modal - Standard confirmation dialog
import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import "./ConfirmModal.css";

/**
 * Confirmation Modal Component
 * Used for confirming dangerous actions
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onConfirm - Confirm action handler
 * @param {string} props.title - Modal title (default: "Conferma Azione")
 * @param {string} props.message - Confirmation message
 * @param {string} props.confirmLabel - Confirm button label (default: "Conferma")
 * @param {React.ReactNode} props.confirmIcon - Confirm button icon
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Conferma Azione",
  message = "Sei sicuro di voler procedere con questa azione?",
  confirmLabel = "Conferma",
  confirmIcon = <AlertTriangle size={24} />,
}) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={{
        onConfirm: handleConfirm,
        label: confirmLabel,
        icon: confirmIcon,
        dangerous: false, // Prevent infinite loop
      }}
      className="confirm-modal"
    >
      <div className="confirm-modal-content">
        <div className="confirm-modal-icon">
          <AlertTriangle size={48} />
        </div>
        <p className="confirm-modal-message">{message}</p>
        <p className="confirm-modal-warning">
          Questa azione potrebbe essere irreversibile.
        </p>
      </div>
    </Modal>
  );
}
