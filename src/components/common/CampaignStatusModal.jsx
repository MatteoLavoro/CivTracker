// Campaign Status Modal - Manage campaign lifecycle status
import { useState } from "react";
import { Play, Pause, CheckCircle, Users, Vote } from "lucide-react";
import { Modal } from "./Modal";
import { ConfirmModal } from "./ConfirmModal";
import "./CampaignStatusModal.css";

/**
 * CampaignStatusModal Component
 * Allows campaign members to vote unanimously on campaign status changes
 *
 * Status flow:
 * - not-started: Campaign hasn't started, members can join/leave freely
 * - in-progress: Campaign is active, no one can join or leave
 * - completed: Campaign is finished, members can join/leave, but status cannot change back
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback when modal closes
 * @param {Object} campaign - Campaign object
 * @param {string} userId - Current user ID
 * @param {Function} onVote - Callback to vote for status (statusName)
 * @param {Function} onRevokeVote - Callback to revoke vote (statusName)
 */
export function CampaignStatusModal({
  isOpen,
  onClose,
  campaign,
  userId,
  onVote,
  onRevokeVote,
}) {
  const [isVoting, setIsVoting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [statusToVote, setStatusToVote] = useState(null);

  if (!campaign) return null;

  const currentStatus = campaign.status || "not-started";
  const statusVotes = campaign.statusVotes || {};
  const members = campaign.members || [];
  const memberDetails = campaign.memberDetails || {};

  // Status definitions
  const statuses = [
    {
      id: "not-started",
      name: "Non Iniziata",
      icon: Pause,
      color: "blue",
      description:
        "La campagna non è ancora iniziata. I membri possono entrare e uscire liberamente.",
    },
    {
      id: "in-progress",
      name: "In Corso",
      icon: Play,
      color: "gold",
      description:
        "La campagna è attiva. Nessuno può entrare o uscire fino al termine.",
    },
    {
      id: "completed",
      name: "Terminata",
      icon: CheckCircle,
      color: "green",
      description: "La campagna è conclusa. I membri possono entrare e uscire.",
    },
  ];

  const currentStatusInfo = statuses.find((s) => s.id === currentStatus);

  // Get vote info for each status
  const getVoteInfo = (statusId) => {
    const voteData = statusVotes[statusId] || { voters: [] };
    const voters = voteData.voters || [];
    const hasVoted = voters.includes(userId);
    const votesCount = voters.length;
    const totalMembers = members.length;
    const isUnanimous = votesCount === totalMembers;

    return { hasVoted, votesCount, totalMembers, isUnanimous, voters };
  };

  // Handle vote
  const handleVote = async (statusId) => {
    if (isVoting) return;

    const voteInfo = getVoteInfo(statusId);

    if (voteInfo.hasVoted) {
      // Revoke vote (no confirmation needed)
      setIsVoting(true);
      await onRevokeVote(statusId);
      setIsVoting(false);
    } else {
      // Cast vote (requires confirmation)
      setStatusToVote(statusId);
      setConfirmModalOpen(true);
    }
  };

  const handleConfirmVote = async () => {
    if (!statusToVote) return;

    setIsVoting(true);
    await onVote(statusToVote);
    setIsVoting(false);
    setStatusToVote(null);
  };

  // Get next possible status
  const getNextStatus = () => {
    if (currentStatus === "not-started") return "in-progress";
    if (currentStatus === "in-progress") return "completed";
    return null; // completed has no next status
  };

  const nextStatusId = getNextStatus();
  const nextStatusInfo = statuses.find((s) => s.id === nextStatusId);
  const nextVoteInfo = nextStatusId ? getVoteInfo(nextStatusId) : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Stato Campagna">
      <div className="campaign-status-content">
        {/* Current Status Display */}
        <div className="status-current-card">
          <div className="status-current-header">
            <div className="status-current-icon-wrapper">
              {currentStatusInfo && (
                <currentStatusInfo.icon size={28} strokeWidth={2.5} />
              )}
            </div>
            <div className="status-current-info">
              <span className="status-current-label">Stato Attuale</span>
              <h3 className="status-current-name">
                {currentStatusInfo?.name || "Sconosciuto"}
              </h3>
            </div>
          </div>
          <p className="status-current-description">
            {currentStatusInfo?.description}
          </p>
        </div>

        {/* Next Status Section */}
        {nextStatusInfo && nextVoteInfo && (
          <div className="status-change-section">
            <div className="status-change-header">
              <Vote size={20} />
              <h4 className="status-change-title">Cambia Stato</h4>
            </div>
            <p className="status-change-description">
              Tutti i membri devono votare per passare allo stato successivo.
            </p>

            {/* Next Status Option */}
            <div className="status-options-list">
              <div
                className={`status-option ${nextVoteInfo.hasVoted ? "status-option-voted" : ""}`}
              >
                <div className="status-option-header">
                  <div
                    className={`status-option-icon-wrapper status-icon-${nextStatusInfo.color}`}
                  >
                    <nextStatusInfo.icon size={24} />
                  </div>
                  <div className="status-option-info">
                    <h5 className="status-option-name">
                      {nextStatusInfo.name}
                    </h5>
                    <p className="status-option-description">
                      {nextStatusInfo.description}
                    </p>
                  </div>
                </div>

                {/* Vote Status */}
                <div className="status-option-votes">
                  <div className="status-vote-count">
                    <Users size={16} />
                    <span>
                      {nextVoteInfo.votesCount}/{nextVoteInfo.totalMembers}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`status-vote-btn ${nextVoteInfo.hasVoted ? "status-vote-btn-active" : ""}`}
                    onClick={() => handleVote(nextStatusId)}
                    disabled={isVoting}
                  >
                    {nextVoteInfo.hasVoted ? "Revoca Voto" : "Vota"}
                  </button>
                </div>

                {/* Voters List (if any) */}
                {nextVoteInfo.votesCount > 0 && (
                  <div className="status-voters-list">
                    {nextVoteInfo.voters.map((voterId) => (
                      <span key={voterId} className="status-voter-badge">
                        {memberDetails[voterId]?.username || "Sconosciuto"}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Completed Status Message */}
        {currentStatus === "completed" && (
          <div className="status-info-footer">
            <p>
              <strong>Campagna Terminata</strong>
            </p>
            <p>La campagna è conclusa. Non è possibile cambiarla stato.</p>
          </div>
        )}
      </div>

      {/* Confirm Vote Modal */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setStatusToVote(null);
        }}
        onConfirm={handleConfirmVote}
        title="Conferma Voto"
        message={
          statusToVote
            ? `Sei sicuro di voler votare per cambiare lo stato della campagna a "${statuses.find((s) => s.id === statusToVote)?.name || "Sconosciuto"}"? Questa azione richiede il consenso di tutti i membri.`
            : ""
        }
        confirmLabel="Conferma"
      />
    </Modal>
  );
}
