import { useState } from "react";
import { Edit2, LogOut, Mail, User } from "lucide-react";
import { Modal, TextInputModal } from "./";
import "./ProfileModal.css";

/**
 * ProfileModal Component
 * Displays user profile information with options to edit username and logout
 *
 * OPTIMISTIC UPDATES PATTERN:
 * This modal implements optimistic UI updates. When the user changes their username:
 * 1. The UI updates immediately (optimistic state)
 * 2. Firebase update happens in background
 * 3. If Firebase succeeds, the real user data syncs via useEffect
 * 4. If Firebase fails, the UI reverts to the previous state
 *
 * This pattern should be used for ALL modals that perform data mutations
 * to provide instant feedback and avoid UI lag.
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback when modal closes
 * @param {Object} user - Current user object with email and displayName
 * @param {Function} onUpdateUsername - Callback to update username (async)
 * @param {Function} onLogout - Callback to logout
 */
export function ProfileModal({
  isOpen,
  onClose,
  user,
  onUpdateUsername,
  onLogout,
}) {
  const [editUsernameOpen, setEditUsernameOpen] = useState(false);
  // Optimistic username: null means use real data, string means show optimistic value
  const [optimisticOverride, setOptimisticOverride] = useState(null);

  const displayUsername =
    optimisticOverride ?? user?.displayName ?? "Non impostato";

  const handleUsernameSubmit = async (newUsername) => {
    // Optimistic update: show immediately in UI
    setOptimisticOverride(newUsername);

    // Background update: save to Firebase
    if (onUpdateUsername) {
      try {
        await onUpdateUsername(newUsername);
        // Success: clear override to show real Firebase data
        setOptimisticOverride(null);
      } catch (error) {
        // Revert on error: clear override to show original data
        setOptimisticOverride(null);
        console.error("Failed to update username:", error);
      }
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Profilo"
        footer={{
          dangerous: true,
          label: "Esci",
          icon: <LogOut size={20} />,
          onConfirm: handleLogout,
          dangerousMessage: "Vuoi uscire dal tuo account?",
        }}
      >
        <div className="profile-modal-content">
          {/* Email Field */}
          <div className="profile-field">
            <div className="profile-field-icon">
              <Mail size={20} />
            </div>
            <div className="profile-field-content">
              <label className="profile-field-label">Email</label>
              <p className="profile-field-value">{user?.email || "N/A"}</p>
            </div>
          </div>

          {/* Username Field */}
          <div className="profile-field">
            <div className="profile-field-icon">
              <User size={20} />
            </div>
            <div className="profile-field-content">
              <label className="profile-field-label">Nome Utente</label>
              <p className="profile-field-value">{displayUsername}</p>
            </div>
            <button
              className="profile-edit-btn"
              onClick={() => setEditUsernameOpen(true)}
              aria-label="Modifica nome utente"
              type="button"
            >
              <Edit2 size={18} />
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Username Modal */}
      <TextInputModal
        isOpen={editUsernameOpen}
        onClose={() => setEditUsernameOpen(false)}
        onConfirm={handleUsernameSubmit}
        title="Modifica Nome"
        placeholder="Inserisci nuovo nome..."
        defaultValue={user?.displayName || ""}
        minLength={1}
        maxLength={30}
        submitLabel="Salva"
      />
    </>
  );
}
