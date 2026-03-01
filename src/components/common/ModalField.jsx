// Modal Field Component - Reusable field components for modals
import { Edit2, Copy, Check } from "lucide-react";
import { useState } from "react";
import "./ModalField.css";

/**
 * ModalField - Base field component with icon, label, and value
 *
 * @param {React.ReactNode} icon - Icon component
 * @param {string} label - Field label
 * @param {React.ReactNode} value - Field value (text or component)
 * @param {React.ReactNode} action - Optional action button (edit, copy, etc.)
 */
export function ModalField({ icon, label, value, action }) {
  return (
    <div className="modal-field">
      <div className="modal-field-icon">{icon}</div>
      <div className="modal-field-content">
        <label className="modal-field-label">{label}</label>
        <div className="modal-field-value">{value}</div>
      </div>
      {action && <div className="modal-field-action">{action}</div>}
    </div>
  );
}

/**
 * EditButton - Standard edit button for fields
 *
 * @param {Function} onClick - Click handler
 * @param {string} ariaLabel - Accessibility label
 */
export function EditButton({ onClick, ariaLabel = "Modifica" }) {
  return (
    <button
      className="modal-action-btn"
      onClick={onClick}
      aria-label={ariaLabel}
      type="button"
    >
      <Edit2 size={18} />
    </button>
  );
}

/**
 * CopyButton - Copy button with feedback animation
 *
 * @param {Function} onClick - Click handler
 * @param {string} ariaLabel - Accessibility label
 */
export function CopyButton({ onClick, ariaLabel = "Copia" }) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    await onClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      className={`modal-action-btn ${copied ? "modal-action-btn-success" : ""}`}
      onClick={handleClick}
      aria-label={ariaLabel}
      type="button"
    >
      {copied ? <Check size={18} /> : <Copy size={18} />}
    </button>
  );
}

/**
 * ReadOnlyField - Field with static text value
 */
export function ReadOnlyField({ icon, label, value }) {
  return (
    <ModalField
      icon={icon}
      label={label}
      value={<p className="modal-field-text">{value}</p>}
    />
  );
}

/**
 * EditableField - Field with edit button
 */
export function EditableField({ icon, label, value, onEdit }) {
  return (
    <ModalField
      icon={icon}
      label={label}
      value={<p className="modal-field-text">{value}</p>}
      action={<EditButton onClick={onEdit} />}
    />
  );
}

/**
 * CopyableField - Field with copy button
 */
export function CopyableField({ icon, label, value, onCopy, mono = false }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      if (onCopy) onCopy();
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <ModalField
      icon={icon}
      label={label}
      value={
        <p
          className={`modal-field-text ${mono ? "modal-field-text-mono" : ""}`}
        >
          {value}
        </p>
      }
      action={<CopyButton onClick={handleCopy} />}
    />
  );
}
