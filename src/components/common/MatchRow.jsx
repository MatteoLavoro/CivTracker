// Match Row Component
import { useState, useEffect } from "react";
import {
  Check,
  Users,
  Pencil,
  Clock,
  Info,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Avatar } from "./Avatar";
import { PlayerDraftInfoModal } from "./PlayerDraftInfoModal";
import "./MatchRow.css";

/**
 * MatchRow component - displays a single match with all details
 * @param {Object} match - Match data
 * @param {number} matchNumber - Match number (1-indexed)
 * @param {Object} leaders - All leaders data
 * @param {Object} draft - Draft data for real-time leader selection
 * @param {Function} onStartDraft - Handler for starting draft
 * @param {Function} onCompleteMatch - Handler for completing match
 * @param {Function} onPenalty - Handler for opening penalty modal
 * @param {boolean} isCurrentMatch - Whether this is the current active match
 * @param {boolean} isDraftInProgress - Whether draft is in progress
 * @param {boolean} hasUserCompletedDraft - Whether current user has completed draft
 * @param {number} readyPlayersCount - Number of ready players
 * @param {number} totalPlayersCount - Total number of players
 * @param {Object} editLock - Current edit lock from campaign { matchId, userId, username, lockedAt }
 * @param {string} currentUserId - Current user's ID
 */
export function MatchRow({
  match,
  matchNumber,
  leaders,
  draft,
  onStartDraft,
  onCompleteMatch,
  onPenalty,
  isCurrentMatch,
  isDraftInProgress,
  hasUserCompletedDraft,
  readyPlayersCount,
  totalPlayersCount,
  editLock,
  currentUserId,
}) {
  const [draftInfoModalOpen, setDraftInfoModalOpen] = useState(false);
  const [selectedPlayerDraft, setSelectedPlayerDraft] = useState(null);
  const [selectedPlayerName, setSelectedPlayerName] = useState("");

  // Check if this match is locked by another user (real-time)
  const isLockedByOther =
    editLock &&
    editLock.matchId === match.id &&
    editLock.userId !== currentUserId;
  const lockedByUsername = isLockedByOther ? editLock.username : null;

  const getLeaderById = (leaderId) => {
    return leaders?.find((l) => l.id === leaderId);
  };

  const handleOpenDraftInfo = (userId, username) => {
    // Check if draft history exists in match (completed draft)
    if (match.draftHistory && match.draftHistory[userId]) {
      setSelectedPlayerDraft(match.draftHistory[userId]);
      setSelectedPlayerName(username);
      setDraftInfoModalOpen(true);
      return;
    }

    // If current match and draft is in progress, check if player has selected
    if (
      isCurrentMatch &&
      draft &&
      draft.selectedLeaders &&
      draft.selectedLeaders[userId]
    ) {
      // Build draft history from current draft data
      const liveDraftHistory = {
        draftedLeaders: draft.playerDrafts?.[userId] || [],
        bannedLeader: draft.bannedLeaders?.[userId] || null,
        selectedLeader: draft.selectedLeaders[userId],
      };
      setSelectedPlayerDraft(liveDraftHistory);
      setSelectedPlayerName(username);
      setDraftInfoModalOpen(true);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const participants = Object.entries(match.participants || {}).sort((a, b) => {
    const nameA = a[1].username?.toLowerCase() || "";
    const nameB = b[1].username?.toLowerCase() || "";
    return nameA.localeCompare(nameB);
  });
  const isCompleted = match.status === "completed";

  // Debug: Log when participants change
  useEffect(() => {
    console.log(
      `[MatchRow #${matchNumber}] Participants updated:`,
      participants.length,
      participants,
    );
  }, [match.participants, matchNumber]);

  // Get winner from match data
  const winner =
    isCompleted && match.winnerId && match.participants[match.winnerId]
      ? match.participants[match.winnerId]
      : null;

  // Get victory type name and icon
  const victoryTypes = {
    science: {
      name: "Scientifica",
      icon: "/IconeVittorie/ScienceVictory.webp",
    },
    culture: { name: "Culturale", icon: "/IconeVittorie/CultureVictory.webp" },
    diplomatic: {
      name: "Diplomatica",
      icon: "/IconeVittorie/DiplomaticVictory.webp",
    },
    domination: {
      name: "Dominio",
      icon: "/IconeVittorie/DominationVictory.webp",
    },
    religious: {
      name: "Religiosa",
      icon: "/IconeVittorie/ReligiousVictory.webp",
    },
    score: { name: "Per Punti", icon: "/IconeVittorie/ScoreVictory.webp" },
    forfait: {
      name: "Per Forfait",
      icon: "/IconeVittorie/ForfaitVictory .webp",
    },
    defeat: { name: "Sconfitta", icon: "/IconeVittorie/Defeat.webp" },
    canceled: { name: "Annullata", icon: "/IconeVittorie/Cancelled.png" },
  };

  const victoryInfo =
    match.victoryType && victoryTypes[match.victoryType]
      ? victoryTypes[match.victoryType]
      : null;

  return (
    <div className={`match-row ${isCompleted ? "completed" : ""}`}>
      {/* Column 1: Dates */}
      <div className="match-col match-col-dates">
        <div className="match-number-tag">Partita {matchNumber}</div>
        <div className="match-date-label">Inizio</div>
        <div className="match-date-value">{formatDate(match.startDate)}</div>
        {isCompleted && (
          <>
            <div className="match-date-label">Fine</div>
            <div className="match-date-value">{formatDate(match.endDate)}</div>
          </>
        )}
      </div>

      {/* Column 2: Participants */}
      <div className="match-col match-col-participants">
        {participants.map(([userId, participant]) => {
          // Check for leader from match OR from draft real-time
          let leader = null;
          if (participant.leaderId) {
            leader = getLeaderById(participant.leaderId);
          } else if (isCurrentMatch && draft?.selectedLeaders?.[userId]) {
            leader = getLeaderById(draft.selectedLeaders[userId]);
          }

          return (
            <div key={userId} className="match-participant-row">
              {/* 4/9 - Player Section */}
              <div className="match-participant-player">
                <Avatar
                  photoURL={participant.photoURL}
                  displayName={participant.username}
                  email={null}
                  size={32}
                  className="match-participant-avatar"
                />
                <span className="match-participant-name">
                  {participant.username}
                </span>
              </div>

              {/* Divider */}
              <div className="match-participant-divider">|</div>

              {/* 4/9 - Leader Section */}
              <div className="match-participant-leader">
                {leader ? (
                  <>
                    <img
                      src={leader.leaderIconPath}
                      alt={leader.name}
                      className="match-leader-icon"
                    />
                    <img
                      src={leader.civilizationIconPath}
                      alt={leader.civilization}
                      className="match-civ-icon"
                    />
                    <div className="match-leader-info">
                      <span className="match-leader-name">{leader.name}</span>
                      {leader.variant && (
                        <span className="match-leader-variant">
                          {leader.variant}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="match-leader-placeholder">???</div>
                    <span className="match-leader-pending">Da selezionare</span>
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="match-participant-divider">|</div>

              {/* 1/9 - Info Button */}
              <button
                className="match-participant-info-btn"
                onClick={() =>
                  handleOpenDraftInfo(userId, participant.username)
                }
                type="button"
                title="Vedi draft"
                disabled={
                  !(
                    (match.draftHistory && match.draftHistory[userId]) ||
                    (isCurrentMatch &&
                      draft?.selectedLeaders &&
                      draft.selectedLeaders[userId])
                  )
                }
              >
                <Info size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Column 3: Winner */}
      <div className="match-col match-col-winner">
        {isCompleted && victoryInfo ? (
          <>
            {match.victoryType === "defeat" ||
            match.victoryType === "canceled" ? (
              /* Testo per sconfitta e annullata */
              <div className="match-winner-info">
                <img
                  src={victoryInfo.icon}
                  alt={victoryInfo.name}
                  className="match-victory-icon"
                />
                <span
                  className={`match-winner-name ${match.victoryType === "defeat" ? "defeat-text" : "canceled-text"}`}
                >
                  {match.victoryType === "defeat" ? "SCONFITTA" : "ANNULLATA"}
                </span>
              </div>
            ) : winner ? (
              /* Icona + nome vincitore per vittorie normali e forfait */
              <div className="match-winner-info">
                <img
                  src={victoryInfo.icon}
                  alt={victoryInfo.name}
                  className="match-victory-icon"
                />
                <span className="match-winner-name">{winner.username}</span>
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      {/* Column 4: Scores */}
      <div className="match-col match-col-scores">
        {participants.map(([userId, participant]) => {
          // Check if any participant has a raw score set
          const hasAnyRawScores = participants.some(
            ([, p]) => p.score !== undefined && p.score > 0,
          );

          return (
            <div key={userId} className="match-score-item">
              {isCompleted ? (
                <div className="match-score-display">
                  {participant.finalScore !== undefined
                    ? participant.finalScore
                    : participant.processedScore !== undefined
                      ? participant.processedScore
                      : participant.score > 0
                        ? participant.score
                        : "-"}
                </div>
              ) : hasAnyRawScores ? (
                <div className="match-score-display">
                  {participant.score > 0 ? participant.score : "-"}
                </div>
              ) : (
                <div className="match-score-display match-score-pending">?</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Column 5: Actions */}
      <div className="match-col match-col-actions">
        {!match.draftCompleted && isCurrentMatch && (
          <>
            {hasUserCompletedDraft ? (
              <button
                className="match-action-btn waiting-btn"
                disabled
                type="button"
              >
                <Clock size={20} className="waiting-icon" />
                <div className="draft-text-container">
                  <span className="draft-text">
                    Attendi gli altri giocatori
                  </span>
                </div>
              </button>
            ) : (
              <button
                className={`match-action-btn draft-btn ${isDraftInProgress || readyPlayersCount > 0 ? "blinking" : ""}`}
                onClick={() => onStartDraft(match.id)}
                disabled={isCompleted}
                type="button"
              >
                <Users size={20} />
                <div className="draft-text-container">
                  {isDraftInProgress ? (
                    <>
                      <span className="draft-text">Continua</span>
                      <span className="draft-text">Draft</span>
                    </>
                  ) : (
                    <>
                      <span className="draft-text">Draft</span>
                      <span className="draft-counter">
                        [{readyPlayersCount}/{totalPlayersCount}]
                      </span>
                    </>
                  )}
                </div>
              </button>
            )}
          </>
        )}
        {match.draftCompleted && !isCompleted && (
          <>
            <button
              className={`match-action-btn complete-btn ${
                isLockedByOther ? "disabled-no-cursor" : ""
              }`}
              onClick={() => !isLockedByOther && onCompleteMatch(match.id)}
              disabled={isLockedByOther}
              type="button"
            >
              {isLockedByOther ? (
                <>
                  <Loader2 size={20} className="spinner-icon" />
                  <span>In modifica da {lockedByUsername}</span>
                </>
              ) : (
                <>
                  <Check size={20} />
                  Segna Finita
                </>
              )}
            </button>
            <button
              className="match-action-btn penalty-btn"
              onClick={() => onPenalty && onPenalty(match.id)}
              type="button"
              title="Assegna penalità"
            >
              <AlertTriangle size={20} />
              Penalità
            </button>
          </>
        )}
        {isCompleted && (
          <>
            <button
              className={`match-action-btn edit-btn ${
                isLockedByOther ? "disabled-no-cursor" : ""
              }`}
              onClick={() => !isLockedByOther && onCompleteMatch(match.id)}
              disabled={isLockedByOther}
              type="button"
            >
              {isLockedByOther ? (
                <>
                  <Loader2 size={20} className="spinner-icon" />
                  <span>In modifica da {lockedByUsername}</span>
                </>
              ) : (
                <>
                  <Pencil size={20} />
                  Modifica
                </>
              )}
            </button>
            <button
              className="match-action-btn penalty-btn"
              onClick={() => onPenalty && onPenalty(match.id)}
              type="button"
              title="Assegna penalità"
            >
              <AlertTriangle size={20} />
              Penalità
            </button>
          </>
        )}
      </div>

      {/* Player Draft Info Modal */}
      <PlayerDraftInfoModal
        isOpen={draftInfoModalOpen}
        onClose={() => {
          setDraftInfoModalOpen(false);
          setSelectedPlayerDraft(null);
          setSelectedPlayerName("");
        }}
        playerDraftData={selectedPlayerDraft}
        playerName={selectedPlayerName}
        leaders={leaders}
      />
    </div>
  );
}
