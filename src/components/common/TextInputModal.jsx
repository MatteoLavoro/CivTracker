// Text Input Modal - Standard text input dialog
import { useState, useEffect } from "react";
import { Type, Check } from "lucide-react";
import { Modal } from "./Modal";
import "./TextInputModal.css";

/**
 * Text Input Modal Component
 * Used for simple text input with validation
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onConfirm - Confirm action handler with text value
 * @param {string} props.title - Modal title (default: "Inserisci Testo")
 * @param {string} props.label - Input label (optional)
 * @param {string} props.placeholder - Input placeholder
 * @param {string} props.defaultValue - Default input value
 * @param {number} props.maxLength - Maximum character length (optional)
 * @param {number} props.minLength - Minimum character length (default: 1)
 * @param {boolean} props.required - Input is required (default: true)
 * @param {string} props.confirmLabel - Confirm button label (default: "Conferma")
 * @param {React.ReactNode} props.confirmIcon - Confirm button icon
 * @param {boolean} props.multiline - Use textarea instead of input (default: false)
 */
export function TextInputModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Inserisci Testo",
  label = "",
  placeholder = "Inserisci il testo...",
  defaultValue = "",
  maxLength,
  minLength = 1,
  required = true,
  confirmLabel = "Conferma",
  confirmIcon = <Check size={24} />,
  multiline = false,
}) {
  const [text, setText] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);

  // Reset text when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setText(defaultValue);
    }
  }, [isOpen, defaultValue]);

  // Check if input is valid
  const isValid = () => {
    if (required && text.trim().length === 0) return false;
    if (minLength && text.trim().length < minLength) return false;
    if (maxLength && text.length > maxLength) return false;
    return true;
  };

  const handleConfirm = () => {
    if (isValid()) {
      onConfirm(text.trim());
      // Close modal via history (goes back one step)
      window.history.back();
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (maxLength && value.length > maxLength) {
      return; // Prevent exceeding max length
    }
    setText(value);
  };

  const characterCount = text.length;
  const remainingChars = maxLength ? maxLength - characterCount : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={{
        onConfirm: handleConfirm,
        disabled: !isValid(),
        label: confirmLabel,
        icon: confirmIcon,
      }}
      className="text-input-modal"
    >
      <div className="text-input-modal-content">
        {label && (
          <label className="text-input-label">
            {label}
            {required && <span className="text-input-required">*</span>}
          </label>
        )}

        <div
          className={`text-input-container ${isFocused ? "text-input-focused" : ""}`}
        >
          {multiline ? (
            <textarea
              className="text-input-field text-input-textarea"
              value={text}
              onChange={handleChange}
              placeholder={placeholder}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              rows={4}
              autoFocus
            />
          ) : (
            <input
              type="text"
              className="text-input-field"
              value={text}
              onChange={handleChange}
              placeholder={placeholder}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoFocus
            />
          )}
        </div>

        <div className="text-input-footer">
          <div className="text-input-hints">
            {minLength > 1 && (
              <span className="text-input-hint">
                Minimo {minLength} caratteri
              </span>
            )}
          </div>
          {maxLength && (
            <div
              className={`text-input-counter ${remainingChars < 10 ? "text-input-counter-warning" : ""}`}
            >
              {characterCount} / {maxLength}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
