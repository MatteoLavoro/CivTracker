import { useState, useEffect } from "react";
import { Mail, User, LogOut, Upload, Camera, Trash2 } from "lucide-react";
import { Modal, TextInputModal, Avatar } from "./";
import { ReadOnlyField, EditableField } from "./ModalField";
import { useFileUpload } from "../../hooks";
import {
  updateUserProfile,
  updateMemberDetailsInCampaigns,
} from "../../services/firebase";
import { deleteFile } from "../../services/firebase/storage";
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
  const { uploadFile, uploading, progress } = useFileUpload();
  const [uploadError, setUploadError] = useState(null);

  const displayUsername =
    optimisticOverride ?? user?.displayName ?? "Non impostato";

  // Clear errors when modal closes
  useEffect(() => {
    if (!isOpen) {
      setUploadError(null);
    }
  }, [isOpen]);

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

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Seleziona un'immagine valida");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("L'immagine deve essere massimo 5MB");
      return;
    }

    setUploadError(null);

    try {
      // Upload to Firebase Storage
      const path = `profile-images/${user.uid}/${Date.now()}-${file.name}`;
      const result = await uploadFile(file, path);

      if (result.error) {
        setUploadError(result.error);
        return;
      }

      // Update user profile with new photo URL
      const { error } = await updateUserProfile(user.displayName, result.url);

      if (error) {
        setUploadError("Errore nell'aggiornamento del profilo");
        return;
      }

      // Update member details in all campaigns
      await updateMemberDetailsInCampaigns(user.uid, {
        username: user.displayName,
        photoURL: result.url,
      });

      // Delete old photo if exists
      if (user.photoURL && user.photoURL !== result.url) {
        try {
          // Extract path from URL
          const oldPath = decodeURIComponent(
            user.photoURL.split("/o/")[1].split("?")[0],
          );
          await deleteFile(oldPath);
        } catch (e) {
          console.warn("Failed to delete old photo:", e);
        }
      }
    } catch (error) {
      setUploadError("Errore nel caricamento dell'immagine");
      console.error("Upload error:", error);
    }
  };

  const handlePhotoDelete = async () => {
    if (!user?.photoURL) return;

    try {
      // Update profile to remove photo
      const { error } = await updateUserProfile(user.displayName, "");

      if (error) {
        setUploadError("Errore nella rimozione dell'immagine");
        return;
      }

      // Update member details in all campaigns
      await updateMemberDetailsInCampaigns(user.uid, {
        username: user.displayName,
        photoURL: null,
      });

      // Delete from storage
      try {
        const photoPath = decodeURIComponent(
          user.photoURL.split("/o/")[1].split("?")[0],
        );
        await deleteFile(photoPath);
      } catch (e) {
        console.warn("Failed to delete photo file:", e);
      }
    } catch (error) {
      setUploadError("Errore nella rimozione dell'immagine");
      console.error("Delete error:", error);
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
          {/* Profile Photo Section */}
          <div className="profile-photo-section">
            <div className="profile-photo-label">Immagine Profilo</div>
            <div className="profile-photo-container">
              <Avatar
                photoURL={user?.photoURL}
                displayName={user?.displayName}
                email={user?.email}
                size={96}
                className="profile-photo-avatar"
              />
              <div className="profile-photo-actions">
                <label className="profile-photo-upload-btn">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                    style={{ display: "none" }}
                  />
                  {uploading ? (
                    <>
                      <div className="btn-spinner"></div>
                      <span>{Math.round(progress)}%</span>
                    </>
                  ) : user?.photoURL ? (
                    <>
                      <Camera size={18} />
                      <span>Cambia</span>
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      <span>Carica</span>
                    </>
                  )}
                </label>
                {user?.photoURL && !uploading && (
                  <button
                    className="profile-photo-delete-btn"
                    onClick={handlePhotoDelete}
                    type="button"
                  >
                    <Trash2 size={18} />
                    <span>Rimuovi</span>
                  </button>
                )}
              </div>
            </div>
            {uploadError && (
              <div className="profile-photo-error">{uploadError}</div>
            )}
            <div className="profile-photo-hint">
              Immagini JPG, PNG o GIF. Max 5MB.
            </div>
          </div>

          {/* Email Field - Read Only */}
          <ReadOnlyField
            icon={<Mail size={20} />}
            label="Email"
            value={user?.email || "N/A"}
          />

          {/* Username Field - Editable */}
          <EditableField
            icon={<User size={20} />}
            label="Nome Utente"
            value={displayUsername}
            onEdit={() => setEditUsernameOpen(true)}
          />
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
