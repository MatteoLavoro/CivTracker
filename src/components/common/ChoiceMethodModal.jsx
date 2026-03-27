import { useEffect, useState } from "react";
import { Check, Clock, Shuffle, Sparkles, Zap } from "lucide-react";
import { Modal } from "./Modal";
import { Avatar } from "./Avatar";
import "./ChoiceMethodModal.css";

/**
 * Intermediate modal to choose character selection method.
 * It coordinates ready states for:
 * - Classic draft
 * - Direct choice
 * - Future methods (placeholder)
 */
export function ChoiceMethodModal({
  isOpen,
  onClose,
  campaign,
  draft,
  user,
  onToggleDraftReady,
  onToggleDirectReady,
  onCountdownComplete,
}) {
  const [countdown, setCountdown] = useState(5);

  const members = campaign?.members || [];
  const memberDetails = campaign?.memberDetails || {};
  const draftPhase = draft?.phase || "waiting";
  const draftMode = draft?.mode || null;
  const countdownStartAt = draft?.countdownStartAt || null;

  const draftReadyPlayers = draft?.readyPlayers || [];
  const directReadyPlayers = draft?.directReadyPlayers || [];

  const isDraftReady = draftReadyPlayers.includes(user?.uid);
  const isDirectReady = directReadyPlayers.includes(user?.uid);

  const countdownMethod =
    draftPhase === "countdown"
      ? draftMode === "direct"
        ? "direct"
        : "draft"
      : null;

  useEffect(() => {
    if (!isOpen || draftPhase !== "countdown" || !countdownStartAt) {
      setCountdown(5);
      return;
    }
    let rafId;
    const startMs = new Date(countdownStartAt).getTime();
    const tick = () => {
      const remaining = Math.max(0, 5 - (Date.now() - startMs) / 1000);
      setCountdown(remaining);
      if (remaining > 0) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isOpen, draftPhase, countdownStartAt]);

  // Auto-open the correct modal when countdown finishes (phase → active)
  useEffect(() => {
    if (!isOpen || draftPhase !== "active") return;
    onCountdownComplete?.(draftMode);
  }, [isOpen, draftPhase, draftMode, onCountdownComplete]);

  const renderReadyList = (readyPlayers) => {
    return (
      <div className="choice-method-ready-list">
        {members.map((memberId) => {
          const member = memberDetails[memberId];
          const isReady = readyPlayers.includes(memberId);

          return (
            <div
              key={memberId}
              className={`choice-method-player-row ${isReady ? "ready" : ""}`}
            >
              <Avatar
                photoURL={member?.photoURL}
                displayName={member?.username}
                email={null}
                size={28}
              />
              <span className="choice-method-player-name">
                {member?.username || "Sconosciuto"}
              </span>
              {isReady && (
                <Check size={16} className="choice-method-ready-icon" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const isMethodLocked = (method) => {
    if (draftPhase !== "countdown") return false;
    return countdownMethod !== method;
  };

  const getReadyButtonConfig = (method) => {
    const isReady = method === "draft" ? isDraftReady : isDirectReady;
    const locked = isMethodLocked(method);

    if (draftPhase !== "waiting" && draftPhase !== "countdown") {
      return {
        label: "Scelta avviata",
        className: "choice-method-btn locked",
        disabled: true,
      };
    }

    if (draftPhase === "countdown") {
      // Overlay handles cancel; all buttons stay frozen in their visual state
      return {
        label: isReady ? "Non pronto" : "Pronto",
        className: `choice-method-btn ${isReady ? "ready" : ""} locked`,
        disabled: true,
      };
    }

    if (locked) {
      return {
        label: "Metodo bloccato",
        className: "choice-method-btn locked",
        disabled: true,
      };
    }

    return {
      label: isReady ? "Non pronto" : "Pronto",
      className: `choice-method-btn ${isReady ? "ready" : ""}`,
      disabled: false,
    };
  };

  const draftBtn = getReadyButtonConfig("draft");
  const directBtn = getReadyButtonConfig("direct");

  const handleCancelCountdown = () => {
    if (countdownMethod === "direct") {
      onToggleDirectReady?.();
    } else {
      onToggleDraftReady?.();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scegli Metodo" wide>
      <div className="choice-method-modal-container">
        {/* ── Countdown nested overlay ── */}
        {draftPhase === "countdown" && (
          <div
            className="cmm-countdown-overlay"
            role="button"
            tabIndex={0}
            aria-label="Clicca per annullare il countdown"
            onClick={handleCancelCountdown}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleCancelCountdown();
            }}
          >
            <div className="cmm-countdown-card">
              <div className="cmm-countdown-number">{Math.ceil(countdown)}</div>
              <span
                className={`cmm-countdown-badge${countdownMethod === "direct" ? " direct" : ""}`}
              >
                {countdownMethod === "direct"
                  ? "Scelta Diretta"
                  : "Draft Classico"}
              </span>
              <p className="cmm-countdown-hint">Tocca ovunque per annullare</p>
            </div>
          </div>
        )}

        {/* ── Active / completed info banner ── */}
        {(draftPhase === "active" || draftPhase === "completed") && (
          <div className="choice-method-header">
            <div className="choice-method-info-banner">
              La scelta personaggi è già avviata. Usa{" "}
              <strong>Continua Scelta</strong> nella card partita.
            </div>
          </div>
        )}

        <div className="choice-method-columns">
          {/* ─── Draft Classico ─── */}
          <section className="choice-method-column">
            <div className="cmcol-head">
              <div className="choice-method-badge">
                <Shuffle size={17} />
                Draft Classico
              </div>
              <p>
                Estrazione di 5 leader casuali, fase di ban e scelta finale del
                proprio eroe.
              </p>
            </div>
            <div className="cmcol-body">
              {renderReadyList(draftReadyPlayers)}
            </div>
            <div className="cmcol-foot">
              <div className="choice-method-count-pill">
                {draftReadyPlayers.length}&thinsp;/&thinsp;{members.length}{" "}
                pronti
              </div>
              <button
                className={draftBtn.className}
                onClick={onToggleDraftReady}
                disabled={draftBtn.disabled}
                type="button"
              >
                {draftBtn.label}
              </button>
            </div>
          </section>

          {/* ─── Scelta Diretta ─── */}
          <section className="choice-method-column">
            <div className="cmcol-head">
              <div className="choice-method-badge direct">
                <Zap size={17} />
                Scelta Diretta
              </div>
              <p>
                Chiunque può selezionare un leader disponibile per primo, senza
                fase di ban.
              </p>
            </div>
            <div className="cmcol-body">
              {renderReadyList(directReadyPlayers)}
            </div>
            <div className="cmcol-foot">
              <div className="choice-method-count-pill">
                {directReadyPlayers.length}&thinsp;/&thinsp;{members.length}{" "}
                pronti
              </div>
              <button
                className={directBtn.className}
                onClick={onToggleDirectReady}
                disabled={directBtn.disabled}
                type="button"
              >
                {directBtn.label}
              </button>
            </div>
          </section>

          {/* ─── Nuovi Metodi (futuro) ─── */}
          <section className="choice-method-column future">
            <div className="cmcol-head">
              <div className="choice-method-badge future">
                <Sparkles size={17} />
                Nuovi Metodi
              </div>
              <p>
                Nuovi sistemi di assegnazione dei personaggi arriveranno presto.
              </p>
            </div>
            <div className="cmcol-body">
              <div className="choice-method-ready-list placeholder">
                {members.map((memberId) => {
                  const member = memberDetails[memberId];
                  return (
                    <div key={memberId} className="choice-method-player-row">
                      <Avatar
                        photoURL={member?.photoURL}
                        displayName={member?.username}
                        email={null}
                        size={28}
                      />
                      <span className="choice-method-player-name">
                        {member?.username || "Sconosciuto"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="cmcol-foot">
              <div className="cmcol-pill-placeholder" aria-hidden="true" />
              <div className="choice-method-future-banner">In arrivo</div>
            </div>
          </section>
        </div>
      </div>
    </Modal>
  );
}
