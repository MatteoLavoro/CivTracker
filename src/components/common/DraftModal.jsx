// Draft Modal - Multi-phase draft system in modal format
import { useState, useEffect, useRef, useCallback } from "react";
import { Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Modal } from "./Modal";
import { Avatar } from "./Avatar";
import { LeaderTooltip } from "./LeaderTooltip";
import "./DraftModal.css";

/**
 * DraftModal Component
 * Handles all phases of the classic draft system in a modal format
 * - Waiting: Players mark themselves as ready
 * - Countdown: 5-second server-synced countdown before draft starts
 * - Active: Step-by-step banning phase (one opponent at a time)
 * - Completed: Final leader selection from remaining leaders (roulette reveal)
 */
export function DraftModal({
  isOpen,
  onClose,
  campaign,
  draft,
  leaders,
  user,
  countdownStartAt,
  onToggleReady,
  onSubmitBan,
  onSelectLeader,
}) {
  const [myCountdown, setMyCountdown] = useState(5);
  // Step-by-step ban state
  const [banStep, setBanStep] = useState(0);
  const [localBanSelections, setLocalBanSelections] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  // Roulette reveal state
  // revealIndex: index of last fully-revealed leader (-1 = none yet)
  // shuffleLeader: the random leader currently shown during slot animation (null when idle)
  // banRevealed: whether the banned leader dim has played
  // choosingMode: all reveals done, show SCEGLI/BANNATO tags
  // revealState: "idle" | "animating" | "done"
  const [revealIndex, setRevealIndex] = useState(-1);
  const [shuffleLeader, setShuffleLeader] = useState(null);
  const [banRevealed, setBanRevealed] = useState(false);
  const [choosingMode, setChoosingMode] = useState(false);
  const [revealState, setRevealState] = useState("idle");
  const cancelRef = useRef(null);

  const draftPhase = draft?.phase || null;
  const isReady = draft?.readyPlayers?.includes(user?.uid) || false;
  const myDraftedLeaders = draft?.playerDrafts?.[user?.uid] || [];
  const bannedLeaderId = draft?.bannedLeaders?.[user?.uid] || null;
  const myPlayerState = draft?.playerStates?.[user?.uid] || {};
  const hasCompletedBans = myPlayerState.hasCompletedBans || false;
  const selectedLeaders = draft?.selectedLeaders || {};
  const mySelectedLeader = selectedLeaders[user?.uid] || null;

  // Other players (opponents)
  const otherPlayers =
    campaign?.members?.filter((id) => id !== user?.uid) || [];

  // Server-synced countdown — requestAnimationFrame for smooth SVG ring
  useEffect(() => {
    if (!isOpen || draftPhase !== "countdown" || !countdownStartAt) {
      setMyCountdown(5);
      return;
    }
    let rafId;
    const startMs = new Date(countdownStartAt).getTime();
    const tick = () => {
      const remaining = Math.max(0, 5 - (Date.now() - startMs) / 1000);
      setMyCountdown(remaining);
      if (remaining > 0) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isOpen, draftPhase, countdownStartAt]);

  // Reset ban state when modal opens
  useEffect(() => {
    if (isOpen) {
      setBanStep(0);
      setLocalBanSelections({});
      setIsSubmitting(false);
      setIsSelecting(false);
    }
  }, [isOpen]);

  // Reset animation state when draft phase leaves "completed" (new draft started)
  useEffect(() => {
    if (draftPhase !== "completed") {
      cancelRef.current?.();
      setRevealIndex(-1);
      setShuffleLeader(null);
      setBanRevealed(false);
      setChoosingMode(false);
      setRevealState("idle");
    }
  }, [draftPhase]);

  // Cancel running animation when modal closes (but preserve progress)
  useEffect(() => {
    if (!isOpen && revealState === "animating") {
      // Stop the loop, keep revealIndex where it is
      cancelRef.current?.();
      setShuffleLeader(null);
      setRevealState("idle");
    }
  }, [isOpen, revealState]);

  // Roulette reveal orchestrator — only runs when modal is open
  const runReveal = useCallback(
    async (startFrom) => {
      if (!myDraftedLeaders.length || !leaders?.length) return;

      let cancelled = false;
      cancelRef.current = () => {
        cancelled = true;
      };
      setRevealState("animating");

      const wait = (ms) => new Promise((r) => setTimeout(r, ms));

      // Small pause before starting
      if (startFrom <= 0) {
        await wait(400);
      } else {
        await wait(200);
      }

      for (let i = Math.max(0, startFrom); i < myDraftedLeaders.length; i++) {
        if (cancelled) return;
        setRevealIndex(i);

        // Slot-machine shuffle with deceleration
        const frames = 8 + Math.floor(Math.random() * 4);
        for (let f = 0; f < frames; f++) {
          if (cancelled) return;
          const rand = leaders[Math.floor(Math.random() * leaders.length)];
          setShuffleLeader(rand);
          await wait(55 + Math.pow(f / frames, 1.8) * 160);
        }

        // Land on actual leader
        setShuffleLeader(null);
        await wait(450);
      }

      // Ban reveal
      if (bannedLeaderId && !cancelled) {
        await wait(500);
        if (cancelled) return;
        setBanRevealed(true);
        await wait(800);
      }

      if (!cancelled) {
        setChoosingMode(true);
        setRevealState("done");
      }
    },
    [myDraftedLeaders, leaders, bannedLeaderId],
  );

  // Trigger reveal when conditions are met
  useEffect(() => {
    if (!isOpen) return;
    if (draftPhase !== "completed") return;
    if (mySelectedLeader) return;
    if (revealState !== "idle") return;
    if (choosingMode) return; // already done from a previous run
    if (!myDraftedLeaders.length || !leaders?.length) return;

    // Determine start position
    const startFrom = revealIndex + 1; // -1 → 0 (fresh), or resume position
    runReveal(startFrom);
  }, [
    isOpen,
    draftPhase,
    mySelectedLeader,
    revealState,
    choosingMode,
    myDraftedLeaders,
    leaders,
    revealIndex,
    runReveal,
  ]);

  // Auto-close modal after leader selection is confirmed
  useEffect(() => {
    if (isOpen && mySelectedLeader && draftPhase === "completed") {
      onClose();
    }
  }, [isOpen, mySelectedLeader, draftPhase, onClose]);

  // Handle modal close
  const handleClose = () => {
    if (draftPhase === "waiting" && isReady) {
      onToggleReady();
    }
    onClose();
  };

  const getLeaderById = (leaderId) => leaders?.find((l) => l.id === leaderId);

  // Toggle selection for the leader at the current ban step
  const handleSelectBanLeader = (leaderId) => {
    const targetId = otherPlayers[banStep];
    setLocalBanSelections((prev) => {
      if (prev[targetId] === leaderId) {
        const next = { ...prev };
        delete next[targetId];
        return next;
      }
      return { ...prev, [targetId]: leaderId };
    });
  };

  // Advance to next step or submit all bans on last step
  const handleNextStep = async () => {
    if (banStep < otherPlayers.length - 1) {
      setBanStep((prev) => prev + 1);
    } else {
      setIsSubmitting(true);
      await onSubmitBan(localBanSelections);
      setIsSubmitting(false);
    }
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

  // Render countdown phase — smooth SVG ring
  const renderCountdownPhase = () => {
    const readyCount = draft?.readyPlayers?.length || 0;
    const totalPlayers = campaign?.members?.length || 0;
    const displaySeconds = Math.ceil(myCountdown);
    const circumference = 2 * Math.PI * 42;
    const progress = myCountdown / 5;

    return (
      <>
        <div className="draft-modal-body">
          <div className="countdown-display">
            <div className="countdown-ring-wrapper">
              <svg className="countdown-ring" viewBox="0 0 100 100">
                <circle className="countdown-ring-bg" cx="50" cy="50" r="42" />
                <circle
                  className="countdown-ring-fill"
                  cx="50"
                  cy="50"
                  r="42"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                />
              </svg>
              <div className="countdown-number">{displaySeconds}</div>
            </div>
          </div>

          <p className="draft-modal-description">
            L&apos;estrazione dei leader inizierà a breve&hellip;
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

  // Render active phase (step-by-step banning)
  const renderActivePhase = () => {
    // Check if playerDrafts are ready
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

    // Player has completed all ban votes — wait for others
    if (hasCompletedBans) {
      const totalPlayers = otherPlayers.length + 1;
      const completedCount = Object.values(draft?.playerStates || {}).filter(
        (s) => s.hasCompletedBans,
      ).length;

      return (
        <div className="draft-modal-body">
          <div className="draft-modal-waiting">
            <p className="draft-modal-description">
              Hai completato i tuoi ban. Attendi gli altri giocatori.
            </p>
            <div className="ban-wait-progress">
              <div className="ban-wait-count">
                {completedCount} / {totalPlayers} giocatori pronti
              </div>
              <div className="ban-wait-bar-track">
                <div
                  className="ban-wait-bar-fill"
                  style={{ width: `${(completedCount / totalPlayers) * 100}%` }}
                />
              </div>
            </div>
            <div className="waiting-spinner">
              <div className="spinner"></div>
            </div>
          </div>
        </div>
      );
    }

    // Solo player — skip banning entirely
    if (otherPlayers.length === 0) {
      return (
        <div className="draft-modal-body">
          <p className="draft-modal-description">
            Sei l&apos;unico giocatore, nessun ban necessario.
          </p>
        </div>
      );
    }

    // Step-by-step banning
    const currentTargetId = otherPlayers[banStep];
    const currentTargetData = campaign?.memberDetails?.[currentTargetId];
    const currentTargetLeaders = draft?.playerDrafts?.[currentTargetId] || [];
    const currentStepSelection = localBanSelections[currentTargetId] || null;
    const isLastStep = banStep === otherPlayers.length - 1;
    const allStepsSelected = otherPlayers.every(
      (id) => !!localBanSelections[id],
    );

    return (
      <>
        <div className="draft-modal-body">
          {/* Step progress header */}
          <div className="ban-step-header">
            <span className="ban-step-label">
              Ban {banStep + 1} di {otherPlayers.length}
            </span>
            <div className="ban-step-dots">
              {otherPlayers.map((targetId, i) => (
                <button
                  key={targetId}
                  type="button"
                  className={`ban-step-dot ${
                    i < banStep ? "completed" : i === banStep ? "active" : ""
                  } ${localBanSelections[targetId] ? "has-selection" : ""}`}
                  aria-label={`Vai al giocatore ${i + 1}`}
                  onClick={() => setBanStep(i)}
                />
              ))}
            </div>
          </div>

          {/* Target player card */}
          <div className="ban-target-player">
            <Avatar
              photoURL={currentTargetData?.photoURL}
              displayName={currentTargetData?.username}
              email={null}
              size={44}
            />
            <div className="ban-target-info">
              <div className="ban-target-name">
                {currentTargetData?.username || "Sconosciuto"}
              </div>
              <div className="ban-target-hint">Scegli 1 leader da bannare</div>
            </div>
          </div>

          {/* Leader list for this opponent */}
          <div className="ban-leaders">
            {currentTargetLeaders.map((leaderId) => {
              const leader = getLeaderById(leaderId);
              if (!leader) return null;
              const isSelected = currentStepSelection === leaderId;

              return (
                <div
                  key={leaderId}
                  className={`ban-leader-card ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelectBanLeader(leaderId)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleSelectBanLeader(leaderId);
                  }}
                >
                  <LeaderTooltip leader={leader} type="leader">
                    <img
                      src={leader.leaderIconPath}
                      alt={leader.name}
                      className="ban-leader-icon"
                    />
                  </LeaderTooltip>
                  <LeaderTooltip leader={leader} type="civilization">
                    <img
                      src={leader.civilizationIconPath}
                      alt={leader.civilization}
                      className="ban-civ-icon"
                    />
                  </LeaderTooltip>
                  <div className="ban-leader-info">
                    <div className="ban-leader-name">{leader.name}</div>
                    {leader.variant && (
                      <div className="ban-leader-variant">{leader.variant}</div>
                    )}
                    <div className="ban-leader-civ">{leader.civilization}</div>
                  </div>
                  {isSelected && (
                    <div className="ban-selected-indicator">
                      <Check size={20} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="draft-modal-divider"></div>

        <div className="ban-step-footer">
          {/* Previous step button */}
          <button
            className="ban-prev-btn"
            onClick={() => setBanStep((prev) => prev - 1)}
            disabled={banStep === 0}
            type="button"
            aria-label="Giocatore precedente"
          >
            <ChevronLeft size={18} />
            Indietro
          </button>

          {/* Next / confirm button */}
          <button
            className="draft-action-btn ban-next-btn"
            onClick={handleNextStep}
            disabled={
              !currentStepSelection ||
              (isLastStep && !allStepsSelected) ||
              isSubmitting
            }
            type="button"
          >
            {isSubmitting ? (
              <>
                <div className="btn-spinner"></div>
                Invio...
              </>
            ) : isLastStep ? (
              <>
                <Check size={18} />
                Conferma tutti i ban
              </>
            ) : (
              <>
                Avanti
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </>
    );
  };

  // Render completed phase — roulette reveal + selection
  const renderCompletedPhase = () => {
    if (mySelectedLeader) {
      return (
        <div className="draft-modal-body">
          <p className="draft-modal-subtitle">
            Leader selezionato! Controlla la card della partita per vedere tutti
            i leader.
          </p>
        </div>
      );
    }

    return (
      <div className="draft-modal-body">
        {/* Progress indicator during reveal */}
        {!choosingMode && (
          <div className="reveal-progress">
            <span className="reveal-progress-text">
              Leader{" "}
              {Math.max(1, Math.min(revealIndex + 1, myDraftedLeaders.length))}{" "}
              di {myDraftedLeaders.length}
            </span>
            <div className="reveal-progress-dots">
              {myDraftedLeaders.map((_, i) => (
                <div
                  key={i}
                  className={`reveal-dot ${
                    i < revealIndex || (i === revealIndex && !shuffleLeader)
                      ? "done"
                      : i === revealIndex
                        ? "active"
                        : ""
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Leader cards */}
        <div className="reveal-leaders">
          {myDraftedLeaders.map((leaderId, i) => {
            const actualLeader = getLeaderById(leaderId);
            if (!actualLeader) return null;

            const isBanned = leaderId === bannedLeaderId;
            const isHidden = i > revealIndex && !choosingMode;
            const isShuffling =
              i === revealIndex && shuffleLeader && !choosingMode;
            const isJustRevealed =
              i === revealIndex && !shuffleLeader && !choosingMode;
            const displayLeader = isShuffling ? shuffleLeader : actualLeader;

            if (isHidden) {
              return (
                <div key={leaderId} className="reveal-card mystery">
                  <div className="mystery-placeholder">
                    <span className="mystery-mark">?</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={leaderId}
                className={[
                  "reveal-card",
                  isShuffling && "shuffling",
                  isJustRevealed && "just-revealed",
                  isBanned && banRevealed && "banned",
                  choosingMode && "choosable",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {isShuffling ? (
                  <img
                    src={displayLeader.leaderIconPath}
                    alt=""
                    className="reveal-leader-icon"
                  />
                ) : (
                  <LeaderTooltip leader={actualLeader} type="leader">
                    <img
                      src={actualLeader.leaderIconPath}
                      alt={actualLeader.name}
                      className="reveal-leader-icon"
                    />
                  </LeaderTooltip>
                )}
                {isShuffling ? (
                  <img
                    src={displayLeader.civilizationIconPath}
                    alt=""
                    className="reveal-civ-icon"
                  />
                ) : (
                  <LeaderTooltip leader={actualLeader} type="civilization">
                    <img
                      src={actualLeader.civilizationIconPath}
                      alt={actualLeader.civilization}
                      className="reveal-civ-icon"
                    />
                  </LeaderTooltip>
                )}
                <div className="reveal-leader-info">
                  <div className="reveal-leader-name">{displayLeader.name}</div>
                  {displayLeader.variant && (
                    <div className="reveal-leader-variant">
                      {displayLeader.variant}
                    </div>
                  )}
                  <div className="reveal-leader-civ">
                    {displayLeader.civilization}
                  </div>
                </div>
                {choosingMode && isBanned && (
                  <div className="leader-tag banned-tag">BANNATO</div>
                )}
                {choosingMode && !isBanned && (
                  <button
                    className="leader-tag choose-tag"
                    onClick={() => {
                      if (isSelecting) return;
                      setIsSelecting(true);
                      onSelectLeader(leaderId);
                    }}
                    disabled={isSelecting}
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
        if (hasCompletedBans) return "In Attesa...";
        if (otherPlayers.length === 0) return "Nessun Ban";
        return `Banna un Leader — ${banStep + 1} / ${otherPlayers.length}`;
      case "completed":
        if (mySelectedLeader) return "Risultati Draft";
        if (choosingMode) return "Scegli il tuo Leader!";
        return "Rivelazione Leader";
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
