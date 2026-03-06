import "./Avatar.css";

/**
 * Avatar Component
 * Displays user avatar with photo or initials fallback
 *
 * @param {string} photoURL - URL of user's profile photo (optional)
 * @param {string} displayName - User's display name for initials
 * @param {string} email - User's email for initials fallback
 * @param {number} size - Size in pixels (default: 48)
 * @param {string} className - Additional CSS classes
 */
export function Avatar({
  photoURL,
  displayName,
  email,
  size = 48,
  className = "",
}) {
  const getInitials = () => {
    if (displayName) {
      const names = displayName.split(" ");
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return displayName.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const style = {
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    minHeight: `${size}px`,
  };

  // If we have a photo URL, show the image
  if (photoURL) {
    return (
      <div className={`avatar avatar-photo ${className}`} style={style}>
        <img src={photoURL} alt={displayName || "User avatar"} />
      </div>
    );
  }

  // Otherwise, show initials
  return (
    <div className={`avatar avatar-initials ${className}`} style={style}>
      <span>{getInitials()}</span>
    </div>
  );
}
