// Draft Modal - Multi-phase draft system in modal format
import { useState, useEffect } from "react";
import { Check, X, Clock, Ban } from "lucide-react";
import { Modal } from "./Modal";
import { Avatar } from "./Avatar";
import "./DraftModal.css";

/**
 * DraftModal Component
 * Handles all phases of the draft system in a modal format
 * - Waiting: Players mark themselves as ready
 * - Countdown: 5-second countdown before draft starts
 * - Active: Banning phase where players vote to ban opponents' leaders
 * - Completed: Final leader selection from remaining leaders
 */
export function DraftModal({
  isOpen,
  onClose,
  campaign,
  draft,
  leaders,
  user,
  onToggleReady,
  onSubmitBan,
  onSelectLeader,
}) {
  const [myCountdown, setMyCountdown] = useState(5);
  const [hasStartedDraft, setHasStartedDraft] = useState(false);
  const [currentBanTargetIndex, setCurrentBanTargetIndex] = useState(0);
  const [selectedLeaderForBan, setSelectedLeaderForBan] = useState(null);

  const draftPhase = draft?.phase || null;
  const isReady = draft?.readyPlayers?.includes(user?.uid) || false;
  const myDraftedLeaders = draft?.playerDrafts?.[user?.uid] || [];
  const bannedLeaderId = draft?.bannedLeaders?.[user?.uid] || null;
  const myPlayerState = draft?.playerStates?.[user?.uid] || {};
  const hasCompletedBans = myPlayerState.hasCompletedBans || false;
  const selectedLeaders = draft?.selectedLeaders || {};
  const mySelectedLeader = selectedLeaders[user?.uid] || null;

  // Get other players for banning
  const otherPlayers =
    campaign?.members?.filter((id) => id !== user?.uid) || [];
  const currentBanTarget = otherPlayers[currentBanTargetIndex];

  // My personal countdown timer
  useEffect(() => {
    if (draftPhase === "countdown" && !hasStartedDraft) {
      setMyCountdown(5);
      const interval = setInterval(() => {
        setMyCountdown((prev) => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            clearInterval(interval);
            setHasStartedDraft(true);
            return 0;
          }
          return newValue;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [draftPhase, hasStartedDraft]);

  // Reset local state when phase changes to active
  useEffect(() => {
    if (draftPhase === "active") {
      setHasStartedDraft(false);
      setMyCountdown(5);
    }
  }, [draftPhase]);

  // Handle modal close - revoke ready if in waiting phase
  const handleClose = () => {
    if (draftPhase === "waiting" && isReady) {
      onToggleReady();
    }
    onClose();
  };

  // Handle select leader for ban
  const handleSelectLeaderForBan = (leaderId) => {
    setSelectedLeaderForBan(leaderId);
  };

  // Handle confirm ban
  const handleConfirmBan = async () => {
    if (!selectedLeaderForBan || !currentBanTarget) return;

    await onSubmitBan(currentBanTarget, selectedLeaderForBan);

    // Move to next player or finish
    if (currentBanTargetIndex < otherPlayers.length - 1) {
      setCurrentBanTargetIndex(currentBanTargetIndex + 1);
      setSelectedLeaderForBan(null);
    } else {
      // All votes submitted - reset to see results
      setCurrentBanTargetIndex(0);
      setSelectedLeaderForBan(null);
    }
  };

  // Get leader object by ID
  const getLeaderById = (leaderId) => {
    return leaders?.find((l) => l.id === leaderId);
  };

  // Render waiting phase
  const renderWaitingPhase = () => {
    const readyCount = draft?.readyPlayers?.length || 0;
    const totalPlayers = campaign?.members?.length || 0;

    return (
      <>
        <div className="draft-modal-body">
          <p className="draft-modal-description">
            Quando tutti i giocatori saranno pronti, inizierà un countdown di 5
            secondi prima dell'estrazione dei leader.
          </p>

          <div className="ready-status">
            <div className="ready-count">
              {readyCount} / {totalPlayers} giocatori pronti
            </div>

            <div className="ready-players">
              {campaign?.members?.map((memberId) => {
                const memberData = campaign.memberDetails?.[memberId];
                const isPlayerReady =
                  draft?.readyPlayers?.includes(memberId) || false;

                return (
                  <div
                    key={memberId}
                    className={`ready-player ${isPlayerReady ? "ready" : ""}`}
                  >
                    <Avatar
                      photoURL={memberData?.photoURL}
                      displayName={memberData?.username}
                      email={null}
                      size={32}
                    />
                    <span className="ready-player-name">
                      {memberData?.username || "Sconosciuto"}
                    </span>
                    {isPlayerReady && (
                      <Check size={20} className="ready-check-icon" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="draft-modal-divider"></div>

        <div className="draft-modal-footer">
          <button
            className={`draft-ready-btn ${isReady ? "ready" : ""}`}
            onClick={onToggleReady}
            type="button"
          >
            {isReady ? (
              <>
                <X size={20} />
                Non Pronto
              </>
            ) : (
              <>
                <Check size={20} />
                Pronto
              </>
            )}
          </button>
        </div>
      </>
    );
  };

  // Render countdown phase
  const renderCountdownPhase = () => {
    const readyCount = draft?.readyPlayers?.length || 0;
    const totalPlayers = campaign?.members?.length || 0;

    return (
      <>
        <div className="draft-modal-body">
          <div className="countdown-display">
            <Clock size={48} />
            <div className="countdown-number">{myCountdown}</div>
          </div>

          <p className="draft-modal-description">
            L'estrazione dei leader inizierà tra {myCountdown} second
            {myCountdown !== 1 ? "i" : "o"}...
          </p>

          <div className="countdown-ready-status">
            <div className="ready-count">
              {readyCount} / {totalPlayers} giocatori pronti
            </div>
          </div>
        </div>

        <div className="draft-modal-divider"></div>

        <div className="draft-modal-footer">
          <button
            className="draft-ready-btn ready"
            onClick={onToggleReady}
            type="button"
          >
            <X size={20} />
            Annulla
          </button>
        </div>
      </>
    );
  };

  // Render active phase (banning)
  const renderActivePhase = () => {
    // Check if playerDrafts are ready to avoid flash
    const myDraftLeaders = draft?.playerDrafts?.[user?.uid];
    if (!myDraftLeaders || myDraftLeaders.length === 0) {
      return (
        <div className="draft-modal-body">
          <div className="draft-modal-waiting">
            <p className="draft-modal-description">
              Preparazione draft in corso...
            </p>
            <div className="waiting-spinner">
              <div className="spinner"></div>
            </div>
          </div>
        </div>
      );
    }

    // Player has completed bans - waiting for others
    if (hasCompletedBans) {
      return (
        <div className="draft-modal-body">
          <div className="draft-modal-waiting">
            <p className="draft-modal-description">
              Hai completato i tuoi ban. Attendere che tutti i giocatori
              finiscano.
            </p>

            <div className="waiting-spinner">
              <div className="spinner"></div>
            </div>
          </div>
        </div>
      );
    }

    // Player is banning - show other players' leaders
    if (!currentBanTarget || otherPlayers.length === 0) {
      // Solo player - skip banning
      return (
        <div className="draft-modal-body">
          <p className="draft-modal-description">
            Sei l'unico giocatore, quindi nessun ban è necessario.
          </p>
        </div>
      );
    }

    const targetMemberData = campaign?.memberDetails?.[currentBanTarget];
    const targetLeaders = draft?.playerDrafts?.[currentBanTarget] || [];

    // If no leaders were drafted, show error
    if (!myDraftedLeaders || myDraftedLeaders.length === 0) {
      return (
        <div className="draft-modal-body">
          <p className="draft-modal-description">
            I leader non sono stati estratti correttamente. Riprova ad avviare
            il draft.
          </p>
        </div>
      );
    }

    if (!targetLeaders || targetLeaders.length === 0) {
      return (
        <div className="draft-modal-body">
          <p className="draft-modal-description">
            Attendere l'estrazione dei leader...
          </p>
          <div className="waiting-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="draft-modal-body">
          <div className="ban-target-player">
            <Avatar
              photoURL={targetMemberData?.photoURL}
              displayName={targetMemberData?.username}
              email={null}
              size={40}
            />
            <div className="ban-target-name">
              {targetMemberData?.username || "Sconosciuto"}
            </div>
          </div>

          <p className="draft-modal-description">
            Seleziona un leader da bannare
          </p>

          <div className="ban-leaders">
            {targetLeaders.map((leaderId) => {
              const leader = getLeaderById(leaderId);
              if (!leader) return null;

              const isSelected = selectedLeaderForBan === leaderId;

              return (
                <div
                  key={leaderId}
                  className={`ban-leader-card ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelectLeaderForBan(leaderId)}
                >
                  <img
                    src={leader.leaderIconPath}
                    alt={leader.name}
                    className="ban-leader-icon"
                  />
                  <img
                    src={leader.civilizationIconPath}
                    alt={leader.civilization}
                    className="ban-civ-icon"
                  />
                  <div className="ban-leader-info">
                    <div className="ban-leader-name">{leader.name}</div>
                    {leader.variant && (
                      <div className="ban-leader-variant">{leader.variant}</div>
                    )}
                    <div className="ban-leader-civ">{leader.civilization}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="draft-modal-divider"></div>

        <div className="draft-modal-footer">
          <button
            className="draft-action-btn"
            onClick={handleConfirmBan}
            disabled={!selectedLeaderForBan}
            type="button"
          >
            <Ban size={20} />
            Conferma Ban
          </button>
        </div>
      </>
    );
  };

  // Render completed phase (final selection)
  const renderCompletedPhase = () => {
    // If player has already selected a leader, close modal (results in match card)
    if (mySelectedLeader) {
      // Close modal automatically
      setTimeout(() => onClose(), 100);
      return (
        <div className="draft-modal-body">
          <p className="draft-modal-subtitle">
            Leader selezionato! Controlla la card della partita per vedere tutti
            i leader.
          </p>
        </div>
      );
    }

    // Player hasn't selected yet - show selection interface
    return (
      <>
        <div className="draft-modal-body">
          <p className="draft-modal-subtitle">
            Seleziona uno dei tuoi leader per giocare
          </p>

          <div className="final-leaders">
            {myDraftedLeaders.map((leaderId) => {
              const leader = getLeaderById(leaderId);
              if (!leader) return null;

              const isBanned = leaderId === bannedLeaderId;

              return (
                <div
                  key={leaderId}
                  className={`final-leader-card ${isBanned ? "banned" : ""}`}
                >
                  <img
                    src={leader.leaderIconPath}
                    alt={leader.name}
                    className="final-leader-icon"
                  />
                  <img
                    src={leader.civilizationIconPath}
                    alt={leader.civilization}
                    className="final-civ-icon"
                  />
                  <div className="final-leader-info">
                    <div className="final-leader-name">{leader.name}</div>
                    {leader.variant && (
                      <div className="final-leader-variant">
                        {leader.variant}
                      </div>
                    )}
                    <div className="final-leader-civ">
                      {leader.civilization}
                    </div>
                  </div>

                  {isBanned ? (
                    <div className="leader-tag banned-tag">BANNATO</div>
                  ) : (
                    <button
                      className="leader-tag choose-tag"
                      onClick={() => onSelectLeader(leaderId)}
                      type="button"
                    >
                      SCEGLI
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  // Get modal title based on phase
  const getTitle = () => {
    switch (draftPhase) {
      case "waiting":
        return "Pronto per il Draft?";
      case "countdown":
        return "Inizia il Draft!";
      case "active":
        return hasCompletedBans ? "In Attesa..." : "Banna un Leader";
      case "completed":
        return mySelectedLeader ? "Risultati Draft" : "Scegli il tuo Leader!";
      default:
        return "Draft";
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={getTitle()}
      size="large"
    >
      <div className="draft-modal-container">
        {draftPhase === "waiting" && renderWaitingPhase()}
        {draftPhase === "countdown" && renderCountdownPhase()}
        {draftPhase === "active" && renderActivePhase()}
        {draftPhase === "completed" && renderCompletedPhase()}
      </div>
    </Modal>
  );
}
