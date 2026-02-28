// Button Component
import "./Button.css";

/**
 * Reusable Button component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {string} props.variant - Button variant (primary, secondary, outline)
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.fullWidth - Full width button
 * @param {boolean} props.loading - Loading state
 */
export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  fullWidth = false,
  loading = false,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} ${fullWidth ? "btn-full-width" : ""} ${
        loading ? "btn-loading" : ""
      }`}
      {...props}
    >
      {loading ? <span className="btn-spinner"></span> : children}
    </button>
  );
}
