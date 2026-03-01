// Campaign Page - Individual Campaign View with Draft System
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Info, Check, X, Clock, Eye, Ban } from "lucide-react";
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
  voteResetDraft,
  resetDraft,
  selectFinalLeader,
} from "../../services/firebase";
import { CampaignInfoModal, LeaderConfirmModal } from "../../components/common";
import {
  hasPlayerVoted,
  haveAllPlayersVoted,
  getRemainingLeaders,
} from "../../utils/draftUtils";
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
  const [myCountdown, setMyCountdown] = useState(5);
  const [hasStartedDraft, setHasStartedDraft] = useState(false);
  const [currentBanTargetIndex, setCurrentBanTargetIndex] = useState(0);
  const [selectedLeaderForBan, setSelectedLeaderForBan] = useState(null);
  const [confirmSelectOpen, setConfirmSelectOpen] = useState(false);
  const [leaderToSelect, setLeaderToSelect] = useState(null);

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
  const isReady = draft?.readyPlayers?.includes(user?.uid) || false;
  const myDraftedLeaders = draft?.playerDrafts?.[user?.uid] || [];
  const bannedLeaderId = draft?.bannedLeaders?.[user?.uid] || null;
  const myPlayerState = draft?.playerStates?.[user?.uid] || {};
  const hasCompletedBans = myPlayerState.hasCompletedBans || false;
  const votesReset = myPlayerState.votesReset || false;
  const selectedLeaders = draft?.selectedLeaders || {};
  const mySelectedLeader = selectedLeaders[user?.uid] || null;

  // Get other players for banning
  const otherPlayers =
    campaign?.members?.filter((id) => id !== user?.uid) || [];
  const currentBanTarget = otherPlayers[currentBanTargetIndex];

  // Check if all players have completed bans
  const allPlayersCompletedBans =
    draft?.playerStates && campaign?.members
      ? campaign.members.every(
          (id) => draft.playerStates[id]?.hasCompletedBans === true,
        )
      : false;

  // Check if all players vote for reset
  const allPlayersVoteReset =
    draft?.playerStates && campaign?.members
      ? campaign.members.every(
          (id) => draft.playerStates[id]?.votesReset === true,
        )
      : false;

  // Initialize draft if not exists
  useEffect(() => {
    if (campaign && !draft && isMember) {
      initializeDraft(campaignId);
    }
  }, [campaign, draft, isMember, campaignId]);

  // My personal countdown timer (starts when phase becomes countdown)
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

  // Reset local state when phase changes to active
  useEffect(() => {
    if (draftPhase === "active") {
      setHasStartedDraft(false);
      setMyCountdown(5);
    }
  }, [draftPhase]);

  // Auto-finalize bans when all players completed
  useEffect(() => {
    if (
      draftPhase === "active" &&
      allPlayersCompletedBans &&
      campaign?.members
    ) {
      finalizeBans(campaignId, campaign.members);
    }
  }, [draftPhase, allPlayersCompletedBans, campaignId, campaign?.members]);

  // Auto-skip banning phase if solo player
  useEffect(() => {
    if (
      draftPhase === "active" &&
      otherPlayers.length === 0 &&
      campaign?.members
    ) {
      // Solo player - no banning needed, go straight to completed
      finalizeBans(campaignId, campaign.members);
    }
  }, [draftPhase, otherPlayers.length, campaignId, campaign?.members]);

  // Auto-reset when all players vote for reset
  useEffect(() => {
    if (draftPhase === "completed" && allPlayersVoteReset) {
      resetDraft(campaignId);
      setCurrentBanTargetIndex(0);
      setSelectedLeaderForBan(null);
    }
  }, [draftPhase, allPlayersVoteReset, campaignId]);

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

  // Draft handlers
  const handleToggleReady = async () => {
    if (!campaign || !user) return;
    await togglePlayerReady(campaignId, user.uid, !isReady, campaign.members);
  };

  const handleSelectLeaderForBan = (leaderId) => {
    setSelectedLeaderForBan(leaderId);
  };

  const handleConfirmBan = async () => {
    if (!selectedLeaderForBan || !currentBanTarget || !campaign) return;

    await submitBanVote(
      campaignId,
      user.uid,
      currentBanTarget,
      selectedLeaderForBan,
      campaign.members,
    );

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

  const handleToggleVoteReset = async () => {
    await voteResetDraft(campaignId, user.uid, !votesReset);
  };

  const handleRequestSelectLeader = (leaderId) => {
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
    }

    setConfirmSelectOpen(false);
    setLeaderToSelect(null);
  };

  // Get leader object by ID
  const getLeaderById = (leaderId) => {
    return leaders?.find((l) => l.id === leaderId);
  };

  // Render functions for different phases
  const renderWaitingPhase = () => {
    const readyCount = draft?.readyPlayers?.length || 0;
    const totalPlayers = campaign?.members?.length || 0;

    return (
      <div className="draft-waiting">
        <div className="draft-card">
          <div className="draft-header">
            <h2 className="draft-title">Pronto per il Draft?</h2>
          </div>

          <div className="draft-divider"></div>

          <div className="draft-body">
            <p className="draft-description">
              Quando tutti i giocatori saranno pronti, inizierà un countdown di
              5 secondi prima dell'estrazione dei leader.
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
                      <div className="ready-player-avatar">
                        {memberData?.username?.substring(0, 2).toUpperCase() ||
                          "?"}
                      </div>
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

          <div className="draft-divider"></div>

          <div className="draft-footer">
            <button
              className={`draft-ready-btn ${isReady ? "ready" : ""}`}
              onClick={handleToggleReady}
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
        </div>
      </div>
    );
  };

  const renderCountdownPhase = () => {
    const readyCount = draft?.readyPlayers?.length || 0;
    const totalPlayers = campaign?.members?.length || 0;

    return (
      <div className="draft-countdown">
        <div className="draft-card">
          <div className="draft-header">
            <h2 className="draft-title">Inizia il Draft!</h2>
          </div>

          <div className="draft-divider"></div>

          <div className="draft-body">
            <div className="countdown-display">
              <Clock size={48} />
              <div className="countdown-number">{myCountdown}</div>
            </div>

            <p className="draft-description">
              L'estrazione dei leader inizierà tra {myCountdown} second
              {myCountdown !== 1 ? "i" : "o"}...
            </p>

            <div className="countdown-ready-status">
              <div className="ready-count">
                {readyCount} / {totalPlayers} giocatori pronti
              </div>
            </div>
          </div>

          <div className="draft-divider"></div>

          <div className="draft-footer">
            <button
              className="draft-ready-btn ready"
              onClick={handleToggleReady}
              type="button"
            >
              <X size={20} />
              Annulla
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderActivePhase = () => {
    // Player has completed bans - waiting for others
    if (hasCompletedBans) {
      return (
        <div className="draft-waiting-results">
          <div className="draft-card">
            <div className="draft-header">
              <h2 className="draft-title">In Attesa...</h2>
            </div>

            <div className="draft-divider"></div>

            <div className="draft-body">
              <p className="draft-description">
                Hai completato i tuoi ban. Attendere che tutti i giocatori
                finiscano.
              </p>

              <div className="waiting-spinner">
                <div className="spinner"></div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Player is banning - show other players' leaders
    if (!currentBanTarget || otherPlayers.length === 0) {
      // Solo player - skip banning
      return (
        <div className="draft-banning">
          <div className="draft-card">
            <div className="draft-header">
              <h2 className="draft-title">Nessun Ban Necessario</h2>
            </div>

            <div className="draft-divider"></div>

            <div className="draft-body">
              <p className="draft-description">
                Sei l'unico giocatore, quindi nessun ban è necessario.
              </p>
            </div>
          </div>
        </div>
      );
    }

    const targetMemberData = campaign?.memberDetails?.[currentBanTarget];
    const targetLeaders = draft?.playerDrafts?.[currentBanTarget] || [];

    // If no leaders were drafted, show error
    if (!myDraftedLeaders || myDraftedLeaders.length === 0) {
      return (
        <div className="draft-banning">
          <div className="draft-card">
            <div className="draft-header">
              <h2 className="draft-title">Errore Draft</h2>
            </div>

            <div className="draft-divider"></div>

            <div className="draft-body">
              <p className="draft-description">
                I leader non sono stati estratti correttamente. Riprova ad
                avviare il draft.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (!targetLeaders || targetLeaders.length === 0) {
      return (
        <div className="draft-banning">
          <div className="draft-card">
            <div className="draft-header">
              <h2 className="draft-title">Caricamento...</h2>
            </div>

            <div className="draft-divider"></div>

            <div className="draft-body">
              <p className="draft-description">
                Attendere l'estrazione dei leader...
              </p>
              <div className="waiting-spinner">
                <div className="spinner"></div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="draft-banning">
        <div className="draft-card">
          <div className="draft-header">
            <h2 className="draft-title">Banna un Leader</h2>
          </div>

          <div className="draft-divider"></div>

          <div className="draft-body">
            <div className="ban-target-player">
              <div className="ban-target-avatar">
                {targetMemberData?.username?.substring(0, 2).toUpperCase() ||
                  "?"}
              </div>
              <div className="ban-target-name">
                {targetMemberData?.username || "Sconosciuto"}
              </div>
            </div>

            <p className="draft-description">Seleziona un leader da bannare</p>

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
                      <div className="ban-leader-name">
                        {leader.name}
                        {leader.variant && (
                          <span className="ban-leader-variant">
                            {" "}
                            - {leader.variant}
                          </span>
                        )}
                      </div>
                      <div className="ban-leader-civ">
                        {leader.civilization}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="ban-selected-indicator">
                        <Check size={24} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="draft-divider"></div>

          <div className="draft-footer">
            <button
              className="draft-action-btn"
              onClick={handleConfirmBan}
              disabled={!selectedLeaderForBan}
              type="button"
            >
              Conferma Ban
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCompletedPhase = () => {
    // If player has already selected a leader, show results table
    if (mySelectedLeader) {
      return (
        <div className="draft-results-view">
          <div className="draft-card">
            <div className="draft-header">
              <h2 className="draft-title">Risultati Draft</h2>
            </div>

            <div className="draft-divider"></div>

            <div className="draft-body">
              <p className="draft-subtitle">
                Leader selezionati da tutti i giocatori
              </p>

              <div className="results-table-container">
                {campaign?.members?.map((memberId) => {
                  const memberData = campaign.memberDetails?.[memberId];
                  const selectedLeaderId = selectedLeaders[memberId];
                  const leader = selectedLeaderId
                    ? getLeaderById(selectedLeaderId)
                    : null;
                  const hasSelected = !!selectedLeaderId;

                  return (
                    <div key={memberId} className="result-row">
                      <div className="result-player-section">
                        <div className="result-player-avatar">
                          {memberData?.username
                            ?.substring(0, 2)
                            .toUpperCase() || "?"}
                        </div>
                        <span className="result-player-name">
                          {memberData?.username || "Sconosciuto"}
                        </span>
                      </div>

                      <div className="result-divider">|</div>

                      {hasSelected && leader ? (
                        <div className="result-leader-section">
                          <img
                            src={leader.leaderIconPath}
                            alt={leader.name}
                            className="result-leader-icon"
                          />
                          <img
                            src={leader.civilizationIconPath}
                            alt={leader.civilization}
                            className="result-civ-icon"
                          />
                          <div className="result-leader-details">
                            <div className="result-leader-name">
                              {leader.name}
                              {leader.variant && (
                                <span className="result-leader-variant">
                                  {" "}
                                  - {leader.variant}
                                </span>
                              )}
                            </div>
                            <div className="result-leader-civ">
                              {leader.civilization}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="result-waiting">
                          <div className="waiting-spinner-small">
                            <div className="spinner-small"></div>
                          </div>
                          <span>In attesa...</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Player hasn't selected yet - show selection interface
    return (
      <div className="draft-completed">
        <div className="draft-card">
          <div className="draft-header">
            <h2 className="draft-title">Scegli il tuo Leader!</h2>
          </div>

          <div className="draft-divider"></div>

          <div className="draft-body">
            <p className="draft-subtitle">
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
                      <div className="final-leader-name">
                        {leader.name}
                        {leader.variant && (
                          <span className="final-leader-variant">
                            {" "}
                            - {leader.variant}
                          </span>
                        )}
                      </div>
                      <div className="final-leader-civ">
                        {leader.civilization}
                      </div>
                    </div>

                    {isBanned ? (
                      <div className="leader-tag banned-tag">BANNATO</div>
                    ) : (
                      <button
                        className="leader-tag choose-tag"
                        onClick={() => handleRequestSelectLeader(leaderId)}
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
        </div>
      </div>
    );
  };

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

        <button
          className="campaign-info-btn"
          onClick={() => setCampaignInfoModalOpen(true)}
          aria-label="Info campagna"
          type="button"
        >
          <Info size={24} />
        </button>
      </header>

      {/* Main Content - Draft System */}
      <main className="campaign-content">
        {draftPhase === "waiting" && renderWaitingPhase()}
        {draftPhase === "countdown" && renderCountdownPhase()}
        {draftPhase === "active" && renderActivePhase()}
        {draftPhase === "completed" && renderCompletedPhase()}
      </main>

      {/* Campaign Info Modal */}
      <CampaignInfoModal
        isOpen={campaignInfoModalOpen}
        onClose={() => setCampaignInfoModalOpen(false)}
        campaign={campaign}
        onUpdateName={handleUpdateCampaignName}
        onLeaveCampaign={handleLeaveCampaign}
      />

      {/* Confirm Select Leader Modal */}
      <LeaderConfirmModal
        isOpen={confirmSelectOpen}
        onClose={() => {
          setConfirmSelectOpen(false);
          setLeaderToSelect(null);
        }}
        onConfirm={handleConfirmSelectLeader}
        leader={leaderToSelect ? getLeaderById(leaderToSelect) : null}
      />
    </div>
  );
}
