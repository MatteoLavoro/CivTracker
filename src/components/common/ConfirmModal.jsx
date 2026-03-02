// Confirm Modal - Standard confirmation dialog
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft } from "lucide-react";
import { useModal } from "../../contexts";
import "./ConfirmModal.css";

/**
 * Confirmation Modal Component
 * Used for confirming actions
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onConfirm - Confirm action handler
 * @param {string} props.title - Modal title (default: "Conferma")
 * @param {string} props.message - Confirmation message
 * @param {string} props.confirmLabel - Confirm button label (default: "Conferma")
 * @param {React.ReactNode} props.confirmIcon - Confirm button icon (not used in new design)
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Conferma",
  message = "Sei sicuro di voler procedere?",
  confirmLabel = "Conferma",
  confirmIcon = null,
}) {
  const [isMobile, setIsMobile] = useState(false);
  const onCloseRef = useRef(onClose);
  const { registerNestedClose, modalDepth, hasNestedModals } = useModal();

  // Update onClose ref when it changes
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Register with modal context
  useEffect(() => {
    if (!isOpen) return;

    // Register this modal's close handler
    const unregister = registerNestedClose(() => {
      onCloseRef.current?.();
    });

    return unregister;
  }, [isOpen, registerNestedClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm();
    // Close modal via history (goes back one step)
    window.history.back();
  };

  const handleClose = () => {
    window.history.back();
  };

  if (!isOpen) return null;

  // Calculate z-index based on modal depth
  const nestedCount = hasNestedModals() ? 1 : 0;
  const baseZIndex = 1000 + (modalDepth + nestedCount) * 10;

  const modalContent = (
    <div className="modal-overlay" style={{ zIndex: baseZIndex }}>
      <div
        className={`modal-container ${isMobile ? "modal-mobile" : "modal-desktop"} confirm-modal-gold`}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-content">
            {isMobile ? (
              <>
                <button
                  className="modal-close-btn"
                  onClick={handleClose}
                  aria-label="Indietro"
                  type="button"
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="modal-title">{title}</h2>
                <div className="modal-spacer" />
              </>
            ) : (
              <>
                <div className="modal-spacer" />
                <h2 className="modal-title">{title}</h2>
                <button
                  className="modal-close-btn"
                  onClick={handleClose}
                  aria-label="Chiudi"
                  type="button"
                >
                  <X size={20} />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="modal-divider" />

        {/* Body */}
        <div className="modal-body">
          <div className="confirm-modal-content">
            <p className="confirm-modal-message">{message}</p>
          </div>
        </div>

        <div className="modal-divider" />

        {/* Footer */}
        <div className="modal-footer">
          {isMobile ? (
            <button
              className="modal-fab modal-fab-gold"
              onClick={handleConfirm}
              aria-label={confirmLabel}
              type="button"
            >
              {confirmIcon || <span className="modal-fab-check">✓</span>}
            </button>
          ) : (
            <button
              className="modal-confirm-btn modal-confirm-gold"
              onClick={handleConfirm}
              type="button"
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
