import { useEffect, useRef, useState } from "react";
import {
  Check,
  Shuffle,
  Sparkles,
  Star,
  Zap,
  Send,
} from "lucide-react";
import { Modal } from "./Modal";
import { Avatar } from "./Avatar";
import { useCountdown } from "../../hooks";
import { DRAFT_COUNTDOWN_SECONDS } from "../../utils/draftUtils";
import "./ChoiceMethodModal.css";

/**
 * Intermediate modal to choose character selection method.
 * Coordinates ready states for:
 * - Classic draft
 * - Preference draft (ban + one +10% preference per step)
 * - Direct choice
 * - Future methods (with a suggestion box)
 */
export function ChoiceMethodModal({
  isOpen,
  onClose,
  campaign,
  draft,
  user,
  onToggleDraftReady,
  onTogglePreferenceReady,
  onToggleDirectReady,
  onCountdownComplete,
  onSaveSuggestion,
}) {
  const members = campaign?.members || [];
  const memberDetails = campaign?.memberDetails || {};
  const draftPhase = draft?.phase || "waiting";
  const draftMode = draft?.mode || null;
  const countdownStartAt = draft?.countdownStartAt || null;

  const draftReadyPlayers = draft?.readyPlayers || [];
  const preferenceReadyPlayers = draft?.preferenceReadyPlayers || [];
  const directReadyPlayers = draft?.directReadyPlayers || [];

  const isDraftReady = draftReadyPlayers.includes(user?.uid);
  const isPreferenceReady = preferenceReadyPlayers.includes(user?.uid);
  const isDirectReady = directReadyPlayers.includes(user?.uid);

  const countdownMethod =
    draftPhase === "countdown"
      ? draftMode === "direct"
        ? "direct"
        : draftMode === "preference"
          ? "preference"
          : "draft"
      : null;

  const countdown = useCountdown(countdownStartAt, {
    seconds: DRAFT_COUNTDOWN_SECONDS,
    enabled: isOpen && draftPhase === "countdown",
  });

  const [suggestion, setSuggestion] = useState(draft?.suggestion || "");
  const [savingSuggestion, setSavingSuggestion] = useState(false);
  const [suggestionSaved, setSuggestionSaved] = useState(false);

  const canWriteSuggestion = draftPhase === "waiting";

  // Auto-open the correct modal when countdown finishes (phase → active)
  const onCountdownCompleteRef = useRef(onCountdownComplete);
  useEffect(() => {
    onCountdownCompleteRef.current = onCountdownComplete;
  }, [onCountdownComplete]);

  useEffect(() => {
    if (!isOpen || draftPhase !== "active") return;
    onCountdownCompleteRef.current?.(draftMode);
  }, [isOpen, draftPhase, draftMode]);

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
    const isReady =
      method === "draft"
        ? isDraftReady
        : method === "preference"
          ? isPreferenceReady
          : isDirectReady;
    const locked = isMethodLocked(method);

    if (draftPhase !== "waiting" && draftPhase !== "countdown") {
      return {
        label: "Scelta avviata",
        className: "choice-method-btn locked",
        disabled: true,
      };
    }

    if (draftPhase === "countdown") {
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
  const preferenceBtn = getReadyButtonConfig("preference");
  const directBtn = getReadyButtonConfig("direct");

  const handleCancelCountdown = () => {
    if (countdownMethod === "direct") {
      onToggleDirectReady?.();
    } else if (countdownMethod === "preference") {
      onTogglePreferenceReady?.();
    } else {
      onToggleDraftReady?.();
    }
  };

  const handleSaveSuggestion = async () => {
    if (!canWriteSuggestion || !onSaveSuggestion || savingSuggestion) return;
    setSavingSuggestion(true);
    const result = await onSaveSuggestion(suggestion.trim());
    setSavingSuggestion(false);
    const ok = result?.success !== false;
    setSuggestionSaved(ok);
    if (ok) setTimeout(() => setSuggestionSaved(false), 2200);
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
                className={`cmm-countdown-badge${
                  countdownMethod === "direct"
                    ? " direct"
                    : countdownMethod === "preference"
                      ? " preference"
                      : ""
                }`}
              >
                {countdownMethod === "direct"
                  ? "Scelta Diretta"
                  : countdownMethod === "preference"
                    ? "Draft Preferenze"
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

          {/* ─── Draft Preferenze ─── */}
          <section className="choice-method-column preference">
            <div className="cmcol-head">
              <div className="choice-method-badge preference">
                <Star size={17} />
                Draft Preferenze
              </div>
              <p>
                Come il classico, ma a ogni ban scegli anche una preferenza: se
                poi scegli quel leader guadagni +10% per ogni preferenza.
              </p>
            </div>
            <div className="cmcol-body">
              {renderReadyList(preferenceReadyPlayers)}
            </div>
            <div className="cmcol-foot">
              <div className="choice-method-count-pill">
                {preferenceReadyPlayers.length}&thinsp;/&thinsp;{members.length}{" "}
                pronti
              </div>
              <button
                className={preferenceBtn.className}
                onClick={onTogglePreferenceReady}
                disabled={preferenceBtn.disabled}
                type="button"
              >
                {preferenceBtn.label}
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

          {/* ─── Nuovi Metodi + suggerimento ─── */}
          <section className="choice-method-column future">
            <div className="cmcol-head">
              <div className="choice-method-badge future">
                <Sparkles size={17} />
                Nuovi Metodi
              </div>
              <p>
                Idee per un nuovo sistema di scelta? Scrivi un suggerimento per
                la prossima modalità.
              </p>
            </div>
            <div className="cmcol-body">
              <div className="choice-method-suggestion">
                <label htmlFor="draft-method-suggestion">
                  Il tuo suggerimento
                </label>
                <textarea
                  id="draft-method-suggestion"
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  maxLength={500}
                  disabled={!canWriteSuggestion}
                  placeholder={
                    canWriteSuggestion
                      ? "Es. un draft a squadre, con ruoli, con obiettivi…"
                      : "Non modificabile durante il countdown"
                  }
                  rows={4}
                />
                <div className="choice-method-suggestion-foot">
                  <span>{suggestion.length}/500</span>
                  <button
                    type="button"
                    className="choice-method-suggestion-save"
                    onClick={handleSaveSuggestion}
                    disabled={
                      !canWriteSuggestion ||
                      savingSuggestion ||
                      !suggestion.trim()
                    }
                  >
                    {suggestionSaved ? (
                      <>
                        <Check size={14} /> Salvato
                      </>
                    ) : (
                      <>
                        <Send size={14} /> Invia
                      </>
                    )}
                  </button>
                </div>
                <p className="choice-method-suggestion-hint">
                  {canWriteSuggestion
                    ? "Puoi scrivere mentre siete in attesa; il box si blocca durante il countdown."
                    : "Il countdown è in corso: il suggerimento è temporaneamente bloccato."}
                </p>
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
