// Direct Choice Modal - Players pick their leader directly from the full pool
import { useState } from "react";
import { Clock, Check, X, Search } from "lucide-react";
import { Modal } from "./Modal";
import { Avatar } from "./Avatar";
import { useCountdown } from "../../hooks";
import { DRAFT_COUNTDOWN_SECONDS } from "../../utils/draftUtils";
import "./DirectChoiceModal.css";

export function DirectChoiceModal({
  isOpen,
  onClose,
  campaign,
  draft,
  leaders,
  user,
  onToggleDirectReady,
  onChooseLeader,
  tierMap,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingLeader, setPendingLeader] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const draftPhase = draft?.phase || null;
  const draftMode = draft?.mode || null;
  const directReadyPlayers = draft?.directReadyPlayers || [];
  const isDirectReady = directReadyPlayers.includes(user?.uid);
  const directChoices = draft?.directChoices || {};
  const myChoice = directChoices[user?.uid] || null;

  const countdown = useCountdown(draft?.countdownStartAt, {
    seconds: DRAFT_COUNTDOWN_SECONDS,
    enabled: isOpen && draftPhase === "countdown" && draftMode === "direct",
  });

  const takenByOthers = new Set(
    Object.entries(directChoices)
      .filter(([uid]) => uid !== user?.uid)
      .map(([, leaderId]) => leaderId),
  );

  const sortedLeaders = [...(leaders || [])].sort((a, b) => {
    const aTaken = takenByOthers.has(a.id) ? 1 : 0;
    const bTaken = takenByOthers.has(b.id) ? 1 : 0;
    if (aTaken !== bTaken) return aTaken - bTaken;
    return (a.number || 0) - (b.number || 0);
  });

  const filteredLeaders = sortedLeaders.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.civilization.toLowerCase().includes(q) ||
      (l.variant && l.variant.toLowerCase().includes(q))
    );
  });

  const getLeaderById = (id) => leaders?.find((l) => l.id === id);

  // Reset transient UI state when the modal is closed
  const handleClose = () => {
    setSearchQuery("");
    setPendingLeader(null);
    onClose();
  };

  const handleConfirmChoice = async () => {
    if (!pendingLeader || confirming) return;
    setConfirming(true);
    const result = await onChooseLeader(pendingLeader.id);
    setConfirming(false);
    if (result?.error) {
      alert(result.error);
    }
    setPendingLeader(null);
    setSearchQuery("");
  };

  if (!isOpen) return null;

  // ─── FASE: CONFERMA SELEZIONE ───────────────────────────────────────────
  if (pendingLeader) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => setPendingLeader(null)}
        title="Conferma Scelta"
      >
        <div className="draft-modal-container">
          <div className="draft-modal-body dc-confirm-body">
            <div className="dc-confirm-leader-card">
              <img
                src={pendingLeader.leaderIconPath}
                alt={pendingLeader.name}
                className="dc-confirm-leader-icon"
              />
              <img
                src={pendingLeader.civilizationIconPath}
                alt={pendingLeader.civilization}
                className="dc-confirm-civ-icon"
              />
              <div className="dc-confirm-leader-info">
                <div className="dc-confirm-leader-name">
                  {pendingLeader.name}
                </div>
                {pendingLeader.variant && (
                  <div className="dc-confirm-leader-variant">
                    {pendingLeader.variant}
                  </div>
                )}
                <div className="dc-confirm-leader-civ">
                  {pendingLeader.civilization}
                </div>
              </div>
            </div>
            <p className="draft-modal-description" style={{ marginBottom: 0 }}>
              Sei sicuro di voler scegliere questo personaggio?{" "}
              <strong>La scelta è definitiva.</strong>
            </p>
          </div>

          <div className="draft-modal-divider" />

          <div className="draft-modal-footer">
            <div className="dc-confirm-actions">
              <button
                className="dc-action-btn dc-btn-secondary"
                onClick={() => setPendingLeader(null)}
                type="button"
                disabled={confirming}
              >
                <X size={18} />
                Annulla
              </button>
              <button
                className="dc-action-btn dc-btn-primary"
                onClick={handleConfirmChoice}
                type="button"
                disabled={confirming}
              >
                <Check size={18} />
                {confirming ? "Attendere..." : "Conferma"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  // ─── FASE: COUNTDOWN ─────────────────────────────────────────
  if (draftPhase === "countdown" && draftMode === "direct") {
    const displayCountdown = Math.ceil(countdown);
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Inizia la Scelta Diretta!"
      >
        <div className="draft-modal-container">
          <div className="draft-modal-body">
            <div className="countdown-display">
              <Clock size={48} />
              <div className="countdown-number">{displayCountdown}</div>
            </div>
            <p className="draft-modal-description">
              La scelta dei personaggi inizierà tra {displayCountdown} second
              {displayCountdown !== 1 ? "i" : "o"}...
            </p>
            <div className="countdown-ready-status">
              <div className="ready-count">
                {directReadyPlayers.length} / {campaign?.members?.length || 0}{" "}
                giocatori pronti
              </div>
            </div>
          </div>
          <div className="draft-modal-divider" />
          <div className="draft-modal-footer">
            <button
              className="draft-ready-btn ready"
              onClick={onToggleDirectReady}
              type="button"
            >
              <X size={20} />
              Annulla
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  // ─── FASE ACTIVE, mode=direct: ATTENDERE (già scelto) ───────────────────
  if (draftMode === "direct" && draftPhase === "active" && myChoice) {
    const chosenLeader = getLeaderById(myChoice);
    const chosenCount = Object.keys(directChoices).length;
    const totalCount = campaign?.members?.length || 0;

    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="In Attesa..."
      >
        <div className="draft-modal-container">
          <div className="draft-modal-body">
            <div className="draft-modal-waiting">
              {chosenLeader && (
                <div className="dc-chosen-leader-card">
                  <img
                    src={chosenLeader.leaderIconPath}
                    alt={chosenLeader.name}
                    className="dc-chosen-leader-icon"
                  />
                  <img
                    src={chosenLeader.civilizationIconPath}
                    alt={chosenLeader.civilization}
                    className="dc-chosen-civ-icon"
                  />
                  <div className="dc-chosen-leader-info">
                    <div className="dc-chosen-leader-name">
                      {chosenLeader.name}
                    </div>
                    {chosenLeader.variant && (
                      <div className="dc-chosen-leader-variant">
                        {chosenLeader.variant}
                      </div>
                    )}
                    <div className="dc-chosen-leader-civ">
                      {chosenLeader.civilization}
                    </div>
                  </div>
                </div>
              )}

              <p className="draft-modal-description">
                Hai scelto il tuo personaggio! Attendi che gli altri giocatori
                completino la loro scelta.
              </p>

              <div className="dc-progress">
                <div className="dc-progress-bar">
                  <div
                    className="dc-progress-fill"
                    style={{ width: `${(chosenCount / totalCount) * 100}%` }}
                  />
                </div>
                <span className="ready-count">
                  {chosenCount} / {totalCount} giocatori hanno scelto
                </span>
              </div>

              <div className="ready-players" style={{ width: "100%" }}>
                {campaign?.members?.map((memberId) => {
                  const memberData = campaign.memberDetails?.[memberId];
                  const hasChosen = !!directChoices[memberId];
                  const chosenL = hasChosen
                    ? getLeaderById(directChoices[memberId])
                    : null;
                  return (
                    <div
                      key={memberId}
                      className={`ready-player ${hasChosen ? "ready" : ""}`}
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
                      {hasChosen && chosenL && (
                        <span className="dc-chosen-badge">
                          {chosenL.name}
                          {chosenL.variant ? ` (${chosenL.variant})` : ""}
                        </span>
                      )}
                      {hasChosen && (
                        <Check size={20} className="ready-check-icon" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="waiting-spinner">
                <div className="spinner" />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  // ─── FASE ACTIVE, mode=direct: SELEZIONE ────────────────────────────────
  if (draftMode === "direct" && draftPhase === "active" && !myChoice) {
    const takenCount = Object.keys(directChoices).length;
    const totalCount = campaign?.members?.length || 0;

    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Scegli il tuo Personaggio"
      >
        <div className="draft-modal-container">
          <div className="dc-search-header">
            {takenCount > 0 && (
              <p className="draft-modal-subtitle" style={{ margin: 0 }}>
                {takenCount}/{totalCount} già selezionati — chi sceglie prima ha
                la priorità!
              </p>
            )}
            <div className="dc-search-bar">
              <Search size={18} className="dc-search-icon" />
              <input
                className="dc-search-input"
                type="text"
                placeholder="Cerca per nome, civiltà..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button
                  className="dc-search-clear"
                  onClick={() => setSearchQuery("")}
                  type="button"
                  aria-label="Cancella ricerca"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="dc-leaders-body">
            <div className="dc-leaders-list">
              {filteredLeaders.map((leader) => {
                const isTaken = takenByOthers.has(leader.id);
                const takenByUid = isTaken
                  ? Object.entries(directChoices).find(
                      ([, lId]) => lId === leader.id,
                    )?.[0]
                  : null;
                const takenByName = takenByUid
                  ? campaign?.memberDetails?.[takenByUid]?.username
                  : null;

                return (
                  <div
                    key={leader.id}
                    className={`dc-leader-card ${
                      isTaken ? "taken" : "available"
                    }`}
                    onClick={() => !isTaken && setPendingLeader(leader)}
                    title={
                      isTaken ? `Già scelto da ${takenByName}` : leader.name
                    }
                  >
                    <img
                      src={leader.leaderIconPath}
                      alt={leader.name}
                      className="dc-leader-icon"
                    />
                    <img
                      src={leader.civilizationIconPath}
                      alt={leader.civilization}
                      className="dc-civ-icon"
                    />
                    <div className="dc-leader-info">
                      <div className="dc-leader-name">{leader.name}</div>
                      {leader.variant && (
                        <div className="dc-leader-variant">
                          {leader.variant}
                        </div>
                      )}
                      <div className="dc-leader-civ">{leader.civilization}</div>
                    </div>
                    {tierMap?.[leader.id] && (
                      <span
                        className="draft-tier-badge"
                        data-tier={tierMap[leader.id]}
                      >
                        {tierMap[leader.id]}
                      </span>
                    )}
                    {isTaken && <div className="dc-taken-badge">Scelto</div>}
                  </div>
                );
              })}
              {filteredLeaders.length === 0 && (
                <p className="dc-no-results">Nessun personaggio trovato.</p>
              )}
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  // ─── FASE WAITING: COORDINAMENTO ────────────────────────────────────────
  const totalPlayers = campaign?.members?.length || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Pronto per la Scelta Diretta?"
    >
      <div className="draft-modal-container">
        <div className="draft-modal-body">
          <p className="draft-modal-description">
            Quando tutti i giocatori saranno pronti, ognuno sceglierà
            liberamente il proprio personaggio. Chi sceglie prima ha la
            priorità.
          </p>

          <div className="ready-status">
            <div className="ready-count">
              {directReadyPlayers.length} / {totalPlayers} giocatori pronti
            </div>

            <div className="ready-players">
              {campaign?.members?.map((memberId) => {
                const memberData = campaign.memberDetails?.[memberId];
                const isPlayerReady = directReadyPlayers.includes(memberId);

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

        <div className="draft-modal-divider" />

        <div className="draft-modal-footer">
          <button
            className={`draft-ready-btn ${isDirectReady ? "ready" : ""}`}
            onClick={onToggleDirectReady}
            type="button"
          >
            {isDirectReady ? (
              <>
                <X size={20} />
                Non Pronto
              </>
            ) : (
              <>
                <Check size={20} />
                Sono Pronto
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
