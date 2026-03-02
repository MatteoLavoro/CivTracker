// Modal Component - Generic reusable modal with centralized history management
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, Check, AlertTriangle } from "lucide-react";
import { useModal } from "../../contexts";
import "./Modal.css";

/**
 * Generic Modal Component
 *
 * HISTORY MANAGEMENT:
 * This modal uses centralized ModalContext for navigation management.
 * - Registers with ModalContext as a nested modal
 * - Browser back button handled by ModalContext
 * - Escape key handled by ModalContext
 * - Supports nested modals automatically
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal body content
 * @param {Object} props.footer - Footer configuration (optional)
 * @param {Function} props.footer.onConfirm - Confirm button handler
 * @param {boolean} props.footer.disabled - Confirm button disabled state
 * @param {boolean} props.footer.dangerous - Mark action as dangerous (shows confirmation modal)
 * @param {string} props.footer.label - Confirm button label (desktop)
 * @param {React.ReactNode} props.footer.icon - Confirm button icon (mobile FAB)
 * @param {string} props.footer.dangerousMessage - Custom message for dangerous confirmation
 * @param {string} props.className - Additional CSS class
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer = null,
  className = "",
  wide = false,
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const initialScrollY = useRef(0);
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

  // Detect keyboard on mobile
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const initialHeight = window.visualViewport?.height || window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const heightDiff = initialHeight - currentHeight;

      // If viewport height decreased by more than 150px, keyboard is likely open
      setKeyboardOpen(heightDiff > 150);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      return () =>
        window.visualViewport.removeEventListener("resize", handleResize);
    } else {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [isMobile, isOpen]);

  // Register with ModalContext for centralized history management
  useEffect(() => {
    if (!isOpen) return;

    // Register close callback with ModalContext
    const unregister = registerNestedClose(() => {
      onCloseRef.current();
    });

    // Add history entry when modal opens
    window.history.pushState({ nestedModal: true }, "");

    // Prevent body scroll
    initialScrollY.current = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${initialScrollY.current}px`;
    document.body.style.width = "100%";

    // Cleanup
    return () => {
      unregister();

      // Restore body scroll
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, initialScrollY.current);
    };
  }, [isOpen, registerNestedClose]);

  // History management for nested confirmation modal
  useEffect(() => {
    if (!showConfirmModal) return;

    // Register confirmation modal with ModalContext
    const unregister = registerNestedClose(() => {
      setShowConfirmModal(false);
    });

    // Add history entry for confirmation modal
    window.history.pushState({ confirmationModal: true }, "");

    return () => {
      unregister();
    };
  }, [showConfirmModal, registerNestedClose]);

  // Handle close (go back in history)
  const handleClose = useCallback(() => {
    window.history.back();
  }, []);

  // Handle confirm button click
  const handleConfirmClick = useCallback(() => {
    if (footer?.dangerous) {
      // Show confirmation modal for dangerous actions
      setShowConfirmModal(true);
    } else {
      // Directly call onConfirm for non-dangerous actions
      footer?.onConfirm?.();
    }
  }, [footer]);

  // Handle dangerous action confirmation
  const handleDangerousConfirm = useCallback(() => {
    footer?.onConfirm?.();
    // Close confirmation modal via history (goes back one step)
    window.history.back();
  }, [footer]);

  if (!isOpen) return null;

  // Calculate z-index based on modal depth
  // Base z-index: 1000, each nested level adds 10
  const nestedCount = hasNestedModals() ? 1 : 0;
  const baseZIndex = 1000 + (modalDepth + nestedCount) * 10;

  const modalContent = (
    <div className="modal-overlay" style={{ zIndex: baseZIndex }}>
      <div
        className={`modal-container ${isMobile ? "modal-mobile" : "modal-desktop"} ${wide ? "modal-wide" : ""} ${className}`}
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
        <div className="modal-body">{children}</div>

        {/* Footer (optional) */}
        {footer && (
          <>
            <div className="modal-divider" />
            <div className="modal-footer">
              {isMobile ? (
                // Mobile: Floating Action Button
                <button
                  className={`modal-fab ${keyboardOpen ? "modal-fab-keyboard-open" : ""} ${
                    footer.disabled ? "modal-fab-disabled" : ""
                  }`}
                  onClick={handleConfirmClick}
                  disabled={footer.disabled}
                  aria-label={footer.label || "Conferma"}
                  type="button"
                >
                  {footer.icon ? (
                    typeof footer.icon === "function" ? (
                      <footer.icon size={footer.iconSize || 24} />
                    ) : (
                      footer.icon
                    )
                  ) : (
                    <Check size={24} />
                  )}
                </button>
              ) : (
                // Desktop: Full-width button
                <button
                  className={`modal-confirm-btn ${footer.disabled ? "modal-confirm-disabled" : ""}`}
                  onClick={handleConfirmClick}
                  disabled={footer.disabled}
                  type="button"
                >
                  {footer.label || "Conferma"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Confirmation modal for dangerous actions
  const confirmationModal = showConfirmModal && (
    <div className="modal-overlay" style={{ zIndex: baseZIndex + 10 }}>
      <div
        className={`modal-container ${isMobile ? "modal-mobile" : "modal-desktop"} confirm-modal-danger`}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-content">
            {isMobile ? (
              <>
                <button
                  className="modal-close-btn"
                  onClick={() => window.history.back()}
                  aria-label="Indietro"
                  type="button"
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="modal-title">Conferma</h2>
                <div className="modal-spacer" />
              </>
            ) : (
              <>
                <div className="modal-spacer" />
                <h2 className="modal-title">Conferma</h2>
                <button
                  className="modal-close-btn"
                  onClick={() => window.history.back()}
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
            <div className="confirm-modal-icon">
              <AlertTriangle size={48} />
            </div>
            <p className="confirm-modal-message">
              {footer?.dangerousMessage || "Procedere con l'azione?"}
            </p>
            <p className="confirm-modal-warning">
              L'azione può essere irreversibile.
            </p>
          </div>
        </div>

        <div className="modal-divider" />

        {/* Footer */}
        <div className="modal-footer">
          {isMobile ? (
            <button
              className="modal-fab modal-fab-danger"
              onClick={handleDangerousConfirm}
              aria-label="Conferma"
              type="button"
            >
              <AlertTriangle size={24} />
            </button>
          ) : (
            <button
              className="modal-confirm-btn modal-confirm-danger"
              onClick={handleDangerousConfirm}
              type="button"
            >
              Conferma
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Render in portal
  return createPortal(
    <>
      {modalContent}
      {confirmationModal}
    </>,
    document.body,
  );
}
