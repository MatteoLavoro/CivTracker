// Auth Layout Component
import "./AuthLayout.css";

/**
 * Layout wrapper for authentication pages
 * Provides consistent styling for login/register pages
 */
export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">CivTracker</h1>
          {title && <h2 className="auth-subtitle">{title}</h2>}
          {subtitle && <p className="auth-description">{subtitle}</p>}
        </div>
        <div className="auth-content">{children}</div>
      </div>
    </div>
  );
}
