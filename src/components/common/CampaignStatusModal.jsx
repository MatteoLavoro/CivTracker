// Campaign Status Modal - Manage campaign lifecycle status
import { useState } from "react";
import { CheckCircle, Users, Vote } from "lucide-react";
import { Modal } from "./Modal";
import { ConfirmModal } from "./ConfirmModal";
import "./CampaignStatusModal.css";

/**
 * CampaignStatusModal Component
 * Allows campaign members to vote unanimously to end the campaign
 *
 * Status flow:
 * - Campaigns automatically go to "in-progress" when draft countdown finishes
 * - This modal allows voting to end the campaign (in-progress → completed)
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

  // Only show end campaign voting when campaign is in-progress
  const canEndCampaign = currentStatus === "in-progress";

  // Status definition for completed
  const completedStatus = {
    id: "completed",
    name: "Terminata",
    icon: CheckCircle,
    color: "green",
    description: "La campagna è conclusa.",
  };

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
    setConfirmModalOpen(false);
  };

  // Get vote info for end campaign
  const endVoteInfo = canEndCampaign ? getVoteInfo("completed") : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Termina Campagna">
      <div className="campaign-status-content">
        {/* Campaign Already Completed */}
        {currentStatus === "completed" && (
          <div className="status-info-footer">
            <div className="status-completed-icon">
              <CheckCircle size={48} strokeWidth={2} />
            </div>
            <p className="status-completed-title">
              <strong>Campagna Terminata</strong>
            </p>
            <p>La campagna è già conclusa.</p>
          </div>
        )}

        {/* Campaign Not Started Yet */}
        {currentStatus === "not-started" && (
          <div className="status-info-footer">
            <p className="status-info-title">
              <strong>Campagna Non Ancora Iniziata</strong>
            </p>
            <p>
              La campagna passerà automaticamente a "In Corso" quando il
              countdown del primo draft finisce. Potrai terminare la campagna
              solo dopo che sarà iniziata.
            </p>
          </div>
        )}

        {/* Vote to End Campaign (in-progress only) */}
        {canEndCampaign && endVoteInfo && (
          <div className="status-change-section">
            <div className="status-change-header">
              <Vote size={20} />
              <h4 className="status-change-title">Vota per Terminare</h4>
            </div>
            <p className="status-change-description">
              Tutti i membri devono votare per terminare la campagna. Una volta
              terminata, la campagna non può più essere modificata.
            </p>

            {/* End Campaign Option */}
            <div className="status-options-list">
              <div
                className={`status-option ${endVoteInfo.hasVoted ? "status-option-voted" : ""}`}
              >
                <div className="status-option-header">
                  <div
                    className={`status-option-icon-wrapper status-icon-${completedStatus.color}`}
                  >
                    <completedStatus.icon size={24} />
                  </div>
                  <div className="status-option-info">
                    <h5 className="status-option-name">
                      {completedStatus.name}
                    </h5>
                    <p className="status-option-description">
                      {completedStatus.description}
                    </p>
                  </div>
                </div>

                {/* Vote Status */}
                <div className="status-option-votes">
                  <div className="status-vote-count">
                    <Users size={16} />
                    <span>
                      {endVoteInfo.votesCount}/{endVoteInfo.totalMembers}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`status-vote-btn ${endVoteInfo.hasVoted ? "status-vote-btn-active" : ""}`}
                    onClick={() => handleVote("completed")}
                    disabled={isVoting}
                  >
                    {endVoteInfo.hasVoted ? "Revoca Voto" : "Vota"}
                  </button>
                </div>

                {/* Voters List (if any) */}
                {endVoteInfo.votesCount > 0 && (
                  <div className="status-voters-list">
                    {endVoteInfo.voters.map((voterId) => (
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
          statusToVote === "completed"
            ? "Sei sicuro di voler votare per terminare la campagna? Una volta terminata, non potrai più creare partite o modificare i dati. Questa azione richiede il consenso di tutti i membri."
            : ""
        }
        confirmLabel="Conferma"
      />
    </Modal>
  );
}
