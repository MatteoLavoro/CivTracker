// Match Row Component
import { Check, Users } from "lucide-react";
import "./MatchRow.css";

/**
 * MatchRow component - displays a single match with all details
 * @param {Object} match - Match data
 * @param {Object} leaders - All leaders data
 * @param {Object} draft - Draft data for real-time leader selection
 * @param {Function} onStartDraft - Handler for starting draft
 * @param {Function} onCompleteMatch - Handler for completing match
 * @param {Function} onUpdateTurns - Handler for updating turns
 * @param {Function} onUpdateScore - Handler for updating score
 * @param {boolean} isCurrentMatch - Whether this is the current active match
 * @param {boolean} isDraftInProgress - Whether draft is in progress
 * @param {number} readyPlayersCount - Number of ready players
 * @param {number} totalPlayersCount - Total number of players
 */
export function MatchRow({
  match,
  leaders,
  draft,
  onStartDraft,
  onCompleteMatch,
  onUpdateTurns,
  onUpdateScore,
  isCurrentMatch,
  isDraftInProgress,
  readyPlayersCount,
  totalPlayersCount,
}) {
  const getLeaderById = (leaderId) => {
    return leaders?.find((l) => l.id === leaderId);
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

  const participants = Object.entries(match.participants || {});
  const isCompleted = match.status === "completed";

  return (
    <div className={`match-row ${isCompleted ? "completed" : ""}`}>
      {/* Column 1: Dates */}
      <div className="match-col match-col-dates">
        <div className="match-date-label">Inizio</div>
        <div className="match-date-value">{formatDate(match.startDate)}</div>
        {isCompleted && (
          <>
            <div className="match-date-label">Fine</div>
            <div className="match-date-value">{formatDate(match.endDate)}</div>
          </>
        )}
      </div>

      {/* Column 2: Turns */}
      <div className="match-col match-col-turns">
        <div className="match-turns-label">Turni</div>
        <button
          className="match-turns-value"
          onClick={() => onUpdateTurns(match.id, match.turns)}
          disabled={isCompleted}
          type="button"
        >
          {match.turns > 0 ? match.turns : "Imposta"}
        </button>
      </div>

      {/* Column 3: Participants */}
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
            <div key={userId} className="match-participant">
              <div className="match-participant-user">
                <div className="match-participant-avatar">
                  {participant.username?.substring(0, 2).toUpperCase() || "?"}
                </div>
                <span className="match-participant-name">
                  {participant.username}
                </span>
              </div>
              <div className="match-participant-divider">|</div>
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
            </div>
          );
        })}
      </div>

      {/* Column 4: Scores */}
      <div className="match-col match-col-scores">
        <div className="match-scores-label">Punteggi</div>
        {participants.map(([userId, participant]) => (
          <button
            key={userId}
            className="match-score-btn"
            onClick={() => onUpdateScore(match.id, userId, participant.score)}
            disabled={isCompleted}
            type="button"
          >
            {participant.score > 0 ? participant.score : "Imposta"}
          </button>
        ))}
      </div>

      {/* Column 5: Reserved */}
      <div className="match-col match-col-reserved">
        {/* Future features */}
      </div>

      {/* Column 6: Actions */}
      <div className="match-col match-col-actions">
        {!match.draftCompleted && isCurrentMatch && (
          <button
            className={`match-action-btn draft-btn ${isDraftInProgress || readyPlayersCount > 0 ? "blinking" : ""}`}
            onClick={() => onStartDraft(match.id)}
            disabled={isCompleted}
            type="button"
          >
            <Users size={20} />
            {isDraftInProgress
              ? "Continua Draft"
              : `Draft (${readyPlayersCount}/${totalPlayersCount} pronti)`}
          </button>
        )}
        {match.draftCompleted && !isCompleted && (
          <button
            className="match-action-btn complete-btn"
            onClick={() => onCompleteMatch(match.id)}
            disabled={isCompleted}
            type="button"
          >
            <Check size={20} />
            Segna Finita
          </button>
        )}
      </div>
    </div>
  );
}
