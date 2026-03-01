// Campaign Info Modal - Campaign details and management
import { useState } from "react";
import { Hash, Key, Users, LogOut } from "lucide-react";
import { Modal, TextInputModal } from "./";
import { EditableField, CopyableField, ReadOnlyField } from "./ModalField";
import "./CampaignInfoModal.css";

/**
 * CampaignInfoModal Component
 * Displays campaign information with options to edit name, copy code, and leave
 *
 * OPTIMISTIC UPDATES PATTERN:
 * This modal implements optimistic UI updates. When the user changes campaign name:
 * 1. The UI updates immediately (optimistic state)
 * 2. Firebase update happens in background
 * 3. If Firebase succeeds, the real data syncs via useEffect
 * 4. If Firebase fails, the UI reverts to the previous state
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback when modal closes
 * @param {Object} campaign - Campaign object with id, name, code, members
 * @param {Function} onUpdateName - Callback to update campaign name (async)
 * @param {Function} onLeaveCampaign - Callback to leave campaign
 */
export function CampaignInfoModal({
  isOpen,
  onClose,
  campaign,
  onUpdateName,
  onLeaveCampaign,
}) {
  const [editNameOpen, setEditNameOpen] = useState(false);
  // Optimistic campaign name: null means use real data, string means show optimistic value
  const [optimisticName, setOptimisticName] = useState(null);

  const displayName = optimisticName ?? campaign?.name ?? "N/A";
  const displayCode = campaign?.code || "N/A";
  const membersCount = campaign?.members?.length || 0;
  const membersLabel =
    membersCount === 1 ? "1 membro" : `${membersCount} membri`;

  const handleNameSubmit = async (newName) => {
    // Close edit modal immediately
    setEditNameOpen(false);

    // Optimistic update: show immediately in UI
    setOptimisticName(newName);

    // Background update: save to Firebase
    if (onUpdateName) {
      try {
        await onUpdateName(newName);
        // Success: clear override to show real Firebase data
        setOptimisticName(null);
      } catch (error) {
        // Revert on error: clear override to show original data
        setOptimisticName(null);
        console.error("Failed to update campaign name:", error);
      }
    }
  };

  const handleLeave = () => {
    if (onLeaveCampaign) {
      onLeaveCampaign();
    }
    // Close modal via history after leave action
    window.history.back();
  };

  if (!campaign) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Info Campagna"
        footer={{
          dangerous: true,
          label: "Esci dal Gruppo",
          icon: <LogOut size={20} />,
          onConfirm: handleLeave,
          dangerousMessage:
            "Sei sicuro di voler uscire da questa campagna? Se sei l'ultimo membro, la campagna verrà eliminata definitivamente.",
        }}
      >
        <div className="campaign-info-content">
          {/* Campaign Name Field - Editable */}
          <EditableField
            icon={<Hash size={20} />}
            label="Nome Campagna"
            value={displayName}
            onEdit={() => setEditNameOpen(true)}
          />

          {/* Campaign Code Field - Copyable */}
          <CopyableField
            icon={<Key size={20} />}
            label="Codice Gruppo"
            value={displayCode}
            mono={true}
          />

          {/* Members Count - Read Only */}
          <ReadOnlyField
            icon={<Users size={20} />}
            label="Membri"
            value={membersLabel}
          />
        </div>
      </Modal>

      {/* Edit Name Modal */}
      <TextInputModal
        isOpen={editNameOpen}
        onClose={() => setEditNameOpen(false)}
        onConfirm={handleNameSubmit}
        title="Modifica Nome"
        label="Nome Campagna"
        placeholder="Inserisci nuovo nome..."
        defaultValue={campaign.name}
        minLength={3}
        maxLength={50}
        confirmLabel="Salva"
      />
    </>
  );
}
