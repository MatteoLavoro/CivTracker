// Campaign Page - Individual Campaign View with Draft System and Matches
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical, Info, Trophy } from "lucide-react";
import { useDocument, useLeaders } from "../../hooks";
import { useAuthContext } from "../../contexts";
import {
  leaveCampaign,
  updateCampaignName,
  initializeDraft,
  togglePlayerReady,
  executeDraft,
  submitBanVote,
  finalizeBans,
  selectFinalLeader,
  createMatch,
  updateMatchTurns,
  completeMatch,
} from "../../services/firebase";
import {
  CampaignInfoModal,
  VictoryInfoModal,
  CompleteMatchModal,
  LeaderConfirmModal,
  TextInputModal,
  DraftModal,
  MatchRow,
  AddMatchButton,
} from "../../components/common";
import "./Campaign.css";

/**
 * Campaign Page
 * Individual campaign view with draft system
 */
export function Campaign() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [campaignInfoModalOpen, setCampaignInfoModalOpen] = useState(false);
  const [victoryInfoModalOpen, setVictoryInfoModalOpen] = useState(false);
  const [kebabMenuOpen, setKebabMenuOpen] = useState(false);
  const kebabMenuRef = useRef(null);
  const [draftModalOpen, setDraftModalOpen] = useState(false);
  const [confirmSelectOpen, setConfirmSelectOpen] = useState(false);
  const [leaderToSelect, setLeaderToSelect] = useState(null);

  // Match system state
  const [turnsModalOpen, setTurnsModalOpen] = useState(false);
  const [completeMatchModalOpen, setCompleteMatchModalOpen] = useState(false);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [currentMatchId, setCurrentMatchId] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [currentTurns, setCurrentTurns] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [currentParticipantId, setCurrentParticipantId] = useState(null);

  // Load campaign data with real-time updates
  const {
    document: campaign,
    loading,
    error: _error,
  } = useDocument("campaigns", campaignId);

  // Load all leaders
  const {
    leaders,
    loading: leadersLoading,
    error: leadersError,
  } = useLeaders();

  // Check if user is a member
  const isMember = campaign && user && campaign.members?.includes(user.uid);

  // Get draft state
  const draft = campaign?.draft || null;
  const draftPhase = draft?.phase || null;
  const selectedLeaders = draft?.selectedLeaders || {};
  const mySelectedLeader = selectedLeaders[user?.uid] || null;

  // Close kebab menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        kebabMenuRef.current &&
        !kebabMenuRef.current.contains(event.target)
      ) {
        setKebabMenuOpen(false);
      }
    };

    if (kebabMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [kebabMenuOpen]);

  // Initialize draft if not exists
  useEffect(() => {
    if (campaign && !draft && isMember) {
      initializeDraft(campaignId);
    }
  }, [campaign, draft, isMember, campaignId]);

  // Execute draft server-side when countdown phase starts (only once)
  useEffect(() => {
    if (
      draftPhase === "countdown" &&
      campaign?.members &&
      draft?.countdownStartAt
    ) {
      const startTime = new Date(draft.countdownStartAt).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);

      // If 5 seconds have passed, execute draft immediately
      if (elapsed >= 5) {
        executeDraft(campaignId, campaign.members);
      } else {
        // Otherwise wait for the remaining time
        const timeout = setTimeout(
          () => {
            executeDraft(campaignId, campaign.members);
          },
          (5 - elapsed) * 1000,
        );

        return () => clearTimeout(timeout);
      }
    }
  }, [draftPhase, draft?.countdownStartAt, campaignId, campaign?.members]);

  // Auto-finalize bans when all players completed
  useEffect(() => {
    if (draftPhase === "active" && campaign?.members && draft?.playerStates) {
      const allCompleted = campaign.members.every(
        (id) => draft.playerStates[id]?.hasCompletedBans === true,
      );
      if (allCompleted) {
        finalizeBans(campaignId, campaign.members);
      }
    }
  }, [draftPhase, draft?.playerStates, campaignId, campaign?.members]);

  // Auto-skip banning phase if solo player
  useEffect(() => {
    if (draftPhase === "active" && campaign?.members) {
      const otherPlayers = campaign.members.filter((id) => id !== user?.uid);
      if (otherPlayers.length === 0) {
        // Solo player - no banning needed, go straight to completed
        finalizeBans(campaignId, campaign.members);
      }
    }
  }, [draftPhase, campaign?.members, campaignId, user?.uid]);

  // Redirect if not a member or campaign doesn't exist
  useEffect(() => {
    if (!loading && (!campaign || !isMember)) {
      navigate("/home", { replace: true });
    }
  }, [campaign, isMember, loading, navigate]);

  const handleBack = () => {
    navigate("/home");
  };

  const handleLeaveCampaign = async () => {
    if (!campaign || !user) return;

    const { error } = await leaveCampaign(campaign.id, user.uid);

    if (error) {
      console.error("Errore uscita campagna:", error);
      alert("Errore nell'uscita dalla campagna. Riprova.");
    } else {
      // Navigate to home after leaving
      navigate("/home", { replace: true });
    }
  };

  const handleUpdateCampaignName = async (newName) => {
    if (!campaign) return;

    const { error } = await updateCampaignName(campaign.id, newName);

    if (error) {
      console.error("Errore aggiornamento nome:", error);
      alert("Errore nell'aggiornamento del nome. Riprova.");
    }
  };

  // Match handlers
  const handleCreateMatch = async () => {
    if (!campaign || !user) return;

    const { success, error } = await createMatch(
      campaignId,
      campaign.members,
      campaign.memberDetails,
    );

    if (error) {
      console.error("Errore creazione partita:", error);
      alert(error);
    }
  };

  const handleUpdateTurnsRequest = (matchId, currentTurns) => {
    setCurrentMatchId(matchId);
    setCurrentTurns(currentTurns);
    setTurnsModalOpen(true);
  };

  const handleUpdateTurnsConfirm = async (turnsValue) => {
    if (!currentMatchId) return;

    const { error } = await updateMatchTurns(
      campaignId,
      currentMatchId,
      turnsValue,
    );

    if (error) {
      console.error("Errore aggiornamento turni:", error);
      alert("Errore nell'aggiornamento dei turni. Riprova.");
    }

    setTurnsModalOpen(false);
    setCurrentMatchId(null);
  };

  const handleUpdateScoreConfirm = async (scoreValue) => {
    if (!currentMatchId || !currentParticipantId) return;

    // TODO: Implement score update functionality
    console.log("Update score:", {
      matchId: currentMatchId,
      participantId: currentParticipantId,
      score: scoreValue,
    });

    setScoreModalOpen(false);
    setCurrentMatchId(null);
    setCurrentParticipantId(null);
    setCurrentScore(0);
  };

  const handleCompleteMatch = (matchId) => {
    // Find the match
    const match = campaign?.matches?.find((m) => m.id === matchId);
    if (!match) return;

    setSelectedMatch(match);
    setCurrentMatchId(matchId);
    setCompleteMatchModalOpen(true);
  };

  const handleCompleteMatchConfirm = async (matchData) => {
    if (!currentMatchId) return;

    const { error } = await completeMatch(
      campaignId,
      currentMatchId,
      matchData.turns,
      matchData.scores,
      matchData.bonusTags || {},
      matchData.winnerId,
      matchData.victoryType,
    );

    if (error) {
      console.error("Errore completamento partita:", error);
      alert("Errore nel completamento della partita. Riprova.");
    } else {
      setCompleteMatchModalOpen(false);
      setCurrentMatchId(null);
      setSelectedMatch(null);
    }
  };

  // Draft handlers
  const handleToggleReady = async () => {
    if (!campaign || !user) return;
    const isReady = draft?.readyPlayers?.includes(user.uid) || false;
    await togglePlayerReady(campaignId, user.uid, !isReady, campaign.members);
  };

  const handleSubmitBan = async (targetPlayerId, bannedLeaderId) => {
    if (!campaign) return;
    await submitBanVote(
      campaignId,
      user.uid,
      targetPlayerId,
      bannedLeaderId,
      campaign.members,
    );
  };

  const handleSelectLeader = async (leaderId) => {
    setLeaderToSelect(leaderId);
    setConfirmSelectOpen(true);
  };

  const handleConfirmSelectLeader = async () => {
    if (!leaderToSelect) return;

    const { error } = await selectFinalLeader(
      campaignId,
      user.uid,
      leaderToSelect,
    );

    if (error) {
      console.error("Errore nella selezione del leader:", error);
      alert("Errore nella selezione del leader. Riprova.");
    } else {
      // Close draft modal after selection
      setDraftModalOpen(false);
    }

    setConfirmSelectOpen(false);
    setLeaderToSelect(null);
  };

  const handleOpenDraftModal = () => {
    setDraftModalOpen(true);
  };

  // Match system logic
  const matches = campaign?.matches || [];
  const hasMatches = matches.length > 0;
  const currentMatch = hasMatches ? matches[matches.length - 1] : null;
  const isCurrentMatchActive =
    currentMatch && currentMatch.status === "in-progress";
  const canCreateNewMatch = !hasMatches || !isCurrentMatchActive;

  // Calculate victory counts from completed matches
  const victoryCounts = matches
    .filter((match) => match.status === "completed" && match.victoryType)
    .reduce((acc, match) => {
      acc[match.victoryType] = (acc[match.victoryType] || 0) + 1;
      return acc;
    }, {});

  // Draft button logic
  const isDraftInProgress =
    draftPhase && draftPhase !== "waiting" && !mySelectedLeader;
  const hasUserCompletedDraft =
    !!mySelectedLeader && !currentMatch?.draftCompleted;
  const readyPlayersCount = draft?.readyPlayers?.length || 0;
  const totalPlayersCount = campaign?.members?.length || 0;

  if (loading || leadersLoading) {
    return (
      <div className="campaign-loading">
        <div className="spinner"></div>
        <p>Caricamento...</p>
      </div>
    );
  }

  if (!campaign || !isMember) {
    return null; // Will redirect via useEffect
  }

  if (leadersError || !leaders || leaders.length === 0) {
    return (
      <div className="campaign-page">
        <header className="campaign-header">
          <button
            className="campaign-back-btn"
            onClick={handleBack}
            aria-label="Torna alla home"
            type="button"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="campaign-title">{campaign.name}</h1>
          <button
            className="campaign-info-btn"
            onClick={() => setCampaignInfoModalOpen(true)}
            aria-label="Info campagna"
            type="button"
          >
            <Info size={24} />
          </button>
        </header>

        <main className="campaign-content">
          <div className="leaders-empty">
            <p>⚠️ Errore nel caricamento dei leader</p>
            <p className="leaders-empty-hint">
              È necessario popolare il database dei leader con almeno{" "}
              {campaign.members.length * 5} leader.
            </p>
          </div>
        </main>

        <CampaignInfoModal
          isOpen={campaignInfoModalOpen}
          onClose={() => setCampaignInfoModalOpen(false)}
          campaign={campaign}
          onUpdateName={handleUpdateCampaignName}
          onLeaveCampaign={handleLeaveCampaign}
        />
      </div>
    );
  }

  return (
    <div className="campaign-page">
      {/* Header */}
      <header className="campaign-header">
        <button
          className="campaign-back-btn"
          onClick={handleBack}
          aria-label="Torna alla home"
          type="button"
        >
          <ArrowLeft size={24} />
        </button>

        <h1 className="campaign-title">{campaign.name}</h1>

        <div className="campaign-kebab-menu" ref={kebabMenuRef}>
          <button
            className="campaign-kebab-btn"
            onClick={() => setKebabMenuOpen(!kebabMenuOpen)}
            aria-label="Menu opzioni"
            type="button"
          >
            <MoreVertical size={24} />
          </button>
          {kebabMenuOpen && (
            <div className="campaign-kebab-dropdown">
              <button
                className="campaign-kebab-item"
                onClick={() => {
                  setVictoryInfoModalOpen(true);
                  setKebabMenuOpen(false);
                }}
                type="button"
              >
                <Trophy size={18} />
                <span>Punteggi Vittorie</span>
              </button>
              <button
                className="campaign-kebab-item"
                onClick={() => {
                  setCampaignInfoModalOpen(true);
                  setKebabMenuOpen(false);
                }}
                type="button"
              >
                <Info size={18} />
                <span>Info Campagna</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Matches and Draft System */}
      <main className="campaign-content">
        {/* Matches Section */}
        <section className="matches-section">
          {/* Match List - Oldest first, newest last */}
          {matches.map((match) => (
            <MatchRow
              key={match.id}
              match={match}
              leaders={leaders}
              draft={draft}
              onStartDraft={handleOpenDraftModal}
              onCompleteMatch={handleCompleteMatch}
              isCurrentMatch={match.id === currentMatch?.id}
              isDraftInProgress={isDraftInProgress}
              hasUserCompletedDraft={hasUserCompletedDraft}
              readyPlayersCount={readyPlayersCount}
              totalPlayersCount={totalPlayersCount}
            />
          ))}

          {/* Add Match Button */}
          <AddMatchButton
            onClick={handleCreateMatch}
            disabled={!canCreateNewMatch}
          />
        </section>
      </main>

      {/* Campaign Info Modal */}
      <CampaignInfoModal
        isOpen={campaignInfoModalOpen}
        onClose={() => setCampaignInfoModalOpen(false)}
        campaign={campaign}
        onUpdateName={handleUpdateCampaignName}
        onLeaveCampaign={handleLeaveCampaign}
      />

      {/* Victory Info Modal */}
      <VictoryInfoModal
        isOpen={victoryInfoModalOpen}
        onClose={() => setVictoryInfoModalOpen(false)}
        victoryCounts={victoryCounts}
      />

      {/* Draft Modal */}
      <DraftModal
        isOpen={draftModalOpen}
        onClose={() => setDraftModalOpen(false)}
        campaign={campaign}
        draft={draft}
        leaders={leaders}
        user={user}
        onToggleReady={handleToggleReady}
        onSubmitBan={handleSubmitBan}
        onSelectLeader={handleSelectLeader}
      />

      {/* Confirm Select Leader Modal */}
      <LeaderConfirmModal
        isOpen={confirmSelectOpen}
        onClose={() => {
          setConfirmSelectOpen(false);
          setLeaderToSelect(null);
        }}
        onConfirm={handleConfirmSelectLeader}
        leader={
          leaderToSelect ? leaders?.find((l) => l.id === leaderToSelect) : null
        }
      />

      {/* Update Turns Modal */}
      <TextInputModal
        isOpen={turnsModalOpen}
        onClose={() => {
          setTurnsModalOpen(false);
          setCurrentMatchId(null);
        }}
        onConfirm={handleUpdateTurnsConfirm}
        title="Aggiorna Turni"
        label="Numero di Turni"
        placeholder="Es: 300"
        confirmLabel="Salva"
        defaultValue={currentTurns > 0 ? currentTurns.toString() : ""}
        customValidation={(value) => {
          const num = parseInt(value);
          return !isNaN(num) && num > 0 && num <= 9999;
        }}
      />

      {/* Update Score Modal */}
      <TextInputModal
        isOpen={scoreModalOpen}
        onClose={() => {
          setScoreModalOpen(false);
          setCurrentMatchId(null);
          setCurrentParticipantId(null);
        }}
        onConfirm={handleUpdateScoreConfirm}
        title="Aggiorna Punteggio"
        label="Punteggio"
        placeholder="Es: 450"
        confirmLabel="Salva"
        defaultValue={currentScore > 0 ? currentScore.toString() : ""}
        customValidation={(value) => {
          const num = parseInt(value);
          return !isNaN(num) && num >= 0 && num <= 9999;
        }}
      />

      {/* Complete Match Modal */}
      <CompleteMatchModal
        key={selectedMatch?.id || "empty"}
        isOpen={completeMatchModalOpen}
        onClose={() => {
          setCompleteMatchModalOpen(false);
          setCurrentMatchId(null);
          setSelectedMatch(null);
        }}
        match={selectedMatch}
        onConfirm={handleCompleteMatchConfirm}
        leaders={leaders}
        victoryCounts={victoryCounts}
      />
    </div>
  );
}
