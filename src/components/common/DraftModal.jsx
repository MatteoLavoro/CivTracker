// Draft Modal - Multi-phase draft system in modal format
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Check, X, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Modal } from "./Modal";
import { Avatar } from "./Avatar";
import { LeaderTooltip } from "./LeaderTooltip";
import { useCountdown } from "../../hooks";
import { DRAFT_COUNTDOWN_SECONDS } from "../../utils/draftUtils";
import { getLeaderPalette, paletteStyle } from "../../utils/leaderColors";
import "./DraftModal.css";

/**
 * DraftModal Component
 * Handles all phases of the draft system (classic and preference variants):
 * - Waiting: Players mark themselves as ready
 * - Countdown: 5-second server-synced countdown before draft starts
 * - Active: Step-by-step banning phase (one opponent at a time)
 *   Preference mode also asks for one +10% preference per ban step
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
  onTogglePreferenceReady,
  onSubmitBan,
  onSelectLeader,
  tierMap,
  confirmSelectOpen = false,
}) {
  // Step-by-step ban state
  const [banStep, setBanStep] = useState(0);
  const [localBanSelections, setLocalBanSelections] = useState({});
  const [localPreferences, setLocalPreferences] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  // Roulette reveal state
  // revealIndex: number of fully-revealed leaders (0 = none, 5 = all)
  // shuffleLeaders: random leader shown on each still-animating row
  // banRevealed: whether the banned leader dim has played
  // choosingMode: all reveals done, show SCEGLI/BANNATO tags
  // revealState: "idle" | "animating" | "done"
  const [revealIndex, setRevealIndex] = useState(0);
  const [shuffleLeaders, setShuffleLeaders] = useState([]);
  const [banRevealed, setBanRevealed] = useState(false);
  const [choosingMode, setChoosingMode] = useState(false);
  const [revealState, setRevealState] = useState("idle");
  const cancelRef = useRef(null);

  const draftPhase = draft?.phase || null;
  const isPreferenceMode = draft?.mode === "preference";
  const isReady = isPreferenceMode
    ? draft?.preferenceReadyPlayers?.includes(user?.uid) || false
    : draft?.readyPlayers?.includes(user?.uid) || false;
  const myDraftedLeaders = useMemo(
    () => draft?.playerDrafts?.[user?.uid] || [],
    [draft?.playerDrafts, user?.uid],
  );
  const bannedLeaderId = draft?.bannedLeaders?.[user?.uid] || null;
  const myPreferences = useMemo(
    () => draft?.preferences?.[user?.uid] || [],
    [draft?.preferences, user?.uid],
  );
  const myPlayerState = draft?.playerStates?.[user?.uid] || {};
  const hasCompletedBans = myPlayerState.hasCompletedBans || false;
  const selectedLeaders = draft?.selectedLeaders || {};
  const mySelectedLeader = selectedLeaders[user?.uid] || null;

  // Other players (opponents)
  const otherPlayers =
    campaign?.members?.filter((id) => id !== user?.uid) || [];

  // Server-synced countdown shared with the other draft windows
  const myCountdown = useCountdown(countdownStartAt, {
    seconds: DRAFT_COUNTDOWN_SECONDS,
    enabled: isOpen && draftPhase === "countdown",
  });

  // Reset ban state when modal opens (deferred to avoid a cascading render)
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      setBanStep(0);
      setLocalBanSelections({});
      setLocalPreferences({});
      setIsSubmitting(false);
      setIsSelecting(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Reset the "selecting" guard when the confirmation modal is dismissed
  // (including with the browser back button), otherwise SCEGLI stays disabled.
  useEffect(() => {
    if (!confirmSelectOpen) setIsSelecting(false);
  }, [confirmSelectOpen]);

  // Reset animation state when draft phase leaves "completed" (new draft started)
  useEffect(() => {
    if (draftPhase === "completed") return;
    cancelRef.current?.();
    const timer = setTimeout(() => {
      setRevealIndex(0);
      setShuffleLeaders([]);
      setBanRevealed(false);
      setChoosingMode(false);
      setRevealState("idle");
    }, 0);
    return () => clearTimeout(timer);
  }, [draftPhase]);

  // Cancel running animation when modal closes (but preserve progress)
  useEffect(() => {
    if (isOpen || revealState !== "animating") return;
    // Stop the loop, keep revealIndex where it is
    cancelRef.current?.();
    const timer = setTimeout(() => {
      setShuffleLeaders([]);
      setRevealState("idle");
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen, revealState]);

  // Roulette reveal orchestrator — only runs when modal is open.
  // All rows spin continuously; one locks at a time, the others never pause.
  const runReveal = useCallback(
    async (startFrom) => {
      if (!myDraftedLeaders.length || !leaders?.length) return;

      let cancelled = false;
      let spinTimer = null;
      cancelRef.current = () => {
        cancelled = true;
        if (spinTimer) clearInterval(spinTimer);
      };
      setRevealState("animating");

      const total = myDraftedLeaders.length;
      const randomLeader = () =>
        leaders[Math.floor(Math.random() * leaders.length)];
      const seed = myDraftedLeaders.map(() => randomLeader());
      setShuffleLeaders(seed);

      let lockedIndex = Math.min(Math.max(0, startFrom), total);
      setRevealIndex(lockedIndex);

      // Continuous slot-machine spin for every row that is not locked yet.
      // This keeps running during the delays between one lock and the next.
      spinTimer = setInterval(() => {
        if (cancelled || lockedIndex >= total) return;
        setShuffleLeaders((prev) => {
          const next = prev.length === total ? [...prev] : [...seed];
          for (let index = lockedIndex; index < total; index++) {
            next[index] = randomLeader();
          }
          return next;
        });
      }, 65);

      const wait = (ms) => new Promise((r) => setTimeout(r, ms));

      try {
        // Small pause before the first lock
        await wait(startFrom <= 0 ? 450 : 200);

        for (let i = lockedIndex; i < total; i++) {
          if (cancelled) return;
          // The row keeps spinning for a moment, then locks forever.
          await wait(1150);
          if (cancelled) return;
          setRevealIndex(i + 1);
          lockedIndex = i + 1;
          // Others keep spinning through this short beat.
          await wait(140);
        }
      } finally {
        if (spinTimer) clearInterval(spinTimer);
        spinTimer = null;
      }

      if (cancelled) return;

      // Ban reveal only after all five leaders have been shown
      if (bannedLeaderId) {
        await wait(450);
        if (cancelled) return;
        setBanRevealed(true);
        await wait(850);
      }

      if (!cancelled) {
        setShuffleLeaders([]);
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

    // Determine start position: number of already-locked leaders
    const startFrom = revealIndex;
    const timer = setTimeout(() => runReveal(startFrom), 0);
    return () => clearTimeout(timer);
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
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (isOpen && mySelectedLeader && draftPhase === "completed") {
      onCloseRef.current();
    }
  }, [isOpen, mySelectedLeader, draftPhase]);

  // Handle modal close
  const handleClose = () => {
    if (draftPhase === "waiting" && isReady) {
      if (isPreferenceMode) {
        onTogglePreferenceReady?.();
      } else {
        onToggleReady();
      }
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

  // Toggle the current preference for the opponent being banned.
  // Preferences are picked from the opponent's pool, not from our own.
  const handleSelectPreference = (leaderId) => {
    const targetId = otherPlayers[banStep];
    setLocalPreferences((prev) => {
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
      let preferenceMap = null;
      if (isPreferenceMode) {
        preferenceMap = {};
        otherPlayers.forEach((targetId) => {
          if (localPreferences[targetId]) {
            preferenceMap[targetId] = localPreferences[targetId];
          }
        });
      }
      await onSubmitBan(localBanSelections, preferenceMap);
      setIsSubmitting(false);
    }
  };

  // Render waiting phase
  const renderWaitingPhase = () => {
    const readyList = isPreferenceMode
      ? draft?.preferenceReadyPlayers || []
      : draft?.readyPlayers || [];
    const readyCount = readyList.length;
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
                const isPlayerReady = readyList.includes(memberId);

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
            onClick={
              isPreferenceMode ? onTogglePreferenceReady : onToggleReady
            }
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
    const readyList = isPreferenceMode
      ? draft?.preferenceReadyPlayers || []
      : draft?.readyPlayers || [];
    const readyCount = readyList.length;
    const totalPlayers = campaign?.members?.length || 0;
    const displaySeconds = Math.ceil(myCountdown);
    const circumference = 2 * Math.PI * 42;
    const progress = myCountdown / DRAFT_COUNTDOWN_SECONDS;

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
            onClick={
              isPreferenceMode ? onTogglePreferenceReady : onToggleReady
            }
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
    const currentPreference = localPreferences[currentTargetId] || null;
    const isLastStep = banStep === otherPlayers.length - 1;
    const allStepsSelected = otherPlayers.every(
      (id) => !!localBanSelections[id],
    );
    const allPreferencesSelected =
      !isPreferenceMode ||
      otherPlayers.every((id) => !!localPreferences[id]);

    return (
      <>
        <div className="draft-modal-body">
          {/* Step progress header */}
          <div className="ban-step-header">
            <span className="ban-step-label">
              {isPreferenceMode
                ? `Ban e preferenza ${banStep + 1} di ${otherPlayers.length}`
                : `Ban ${banStep + 1} di ${otherPlayers.length}`}
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
                  {tierMap?.[leaderId] && (
                    <span
                      className="draft-tier-badge"
                      data-tier={tierMap[leaderId]}
                    >
                      {tierMap[leaderId]}
                    </span>
                  )}
                  {isSelected && (
                    <div className="ban-selected-indicator">
                      <Check size={20} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {isPreferenceMode && (
            <div className="preference-picker">
              <div className="preference-picker-head">
                <Star size={15} />
                <span>
                  Preferenza per {currentTargetData?.username || "l'avversario"}
                </span>
                <em>se la sceglie, +10%</em>
              </div>
              <div className="preference-leaders">
                {currentTargetLeaders.map((leaderId) => {
                  const leader = getLeaderById(leaderId);
                  if (!leader) return null;
                  const selected = currentPreference === leaderId;
                  return (
                    <button
                      key={leaderId}
                      type="button"
                      className={`preference-leader-card ${selected ? "selected" : ""}`}
                      onClick={() => handleSelectPreference(leaderId)}
                      aria-pressed={selected}
                    >
                      <img
                        src={leader.leaderIconPath}
                        alt=""
                        className="preference-leader-icon"
                      />
                      <span className="preference-leader-name">
                        {leader.name}
                        {leader.variant ? ` (${leader.variant})` : ""}
                      </span>
                      {selected && <Check size={15} />}
                    </button>
                  );
                })}
              </div>
              <p className="preference-hint">
                Scegli un leader del suo pool: se lo sceglierà, riceverà +10%
                per ogni preferenza. Se verrà bannato, la preferenza non darà
                alcun bonus.
              </p>
            </div>
          )}
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
              (isPreferenceMode && !currentPreference) ||
              (isLastStep &&
                (!allStepsSelected ||
                  (isPreferenceMode && !allPreferencesSelected))) ||
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
                {isPreferenceMode
                  ? "Conferma ban e preferenze"
                  : "Conferma tutti i ban"}
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
        {/* Leader cards */}
        <div className="reveal-leaders">
          {myDraftedLeaders.map((leaderId, i) => {
            const actualLeader = getLeaderById(leaderId);
            if (!actualLeader) return null;

            const isBanned = leaderId === bannedLeaderId;
            const isRevealed = i < revealIndex;
            // Every row that has not locked yet keeps spinning (all 5 at first)
            const isShuffling = !choosingMode && !isRevealed;
            const isJustRevealed =
              !choosingMode && isRevealed && i === revealIndex - 1;
            const displayLeader = isShuffling
              ? shuffleLeaders[i] || actualLeader
              : actualLeader;
            const palette = getLeaderPalette(actualLeader);
            const prefCount = myPreferences.filter(
              (id) => id === leaderId,
            ).length;
            const showPreference =
              prefCount > 0 && (isRevealed || choosingMode);

            return (
              <div
                key={leaderId}
                style={paletteStyle(palette)}
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
                  <div className="reveal-leader-name-row">
                    <div className="reveal-leader-name">
                      {displayLeader.name}
                    </div>
                    {showPreference && (
                      <span
                        className="reveal-pref-pill"
                        title={`Preferenza ×${prefCount} (+${prefCount * 10}%)`}
                      >
                        <Star size={11} />
                        {prefCount}
                      </span>
                    )}
                  </div>
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
                  <div className="draft-pick-actions">
                    {tierMap?.[leaderId] && (
                      <span
                        className="draft-tier-badge"
                        data-tier={tierMap[leaderId]}
                      >
                        {tierMap[leaderId]}
                      </span>
                    )}
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
                  </div>
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
        return isPreferenceMode
          ? "Pronto per il Draft Preferenze?"
          : "Pronto per il Draft?";
      case "countdown":
        return "Inizia il Draft!";
      case "active":
        if (hasCompletedBans) return "In Attesa...";
        if (otherPlayers.length === 0) return "Nessun Ban";
        return isPreferenceMode
          ? `Ban e Preferenza — ${banStep + 1} / ${otherPlayers.length}`
          : `Banna un Leader — ${banStep + 1} / ${otherPlayers.length}`;
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
