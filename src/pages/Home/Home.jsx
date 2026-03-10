// Home Page - Campaign Management
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Info, UserPlus, Trophy, Star } from "lucide-react";
import { useAuthContext } from "../../contexts";
import { useCollection } from "../../hooks";
import {
  logOut,
  updateUserProfile,
  updateMemberDetailsInCampaigns,
  createCampaign,
  joinCampaign,
  leaveCampaign,
  updateCampaignName,
  toggleCampaignImportant,
} from "../../services/firebase";
import {
  Avatar,
  TextInputModal,
  ProfileModal,
  CampaignInfoModal,
} from "../../components/common";
import { preloadImages } from "../../utils/imagePreloader";
import "./Home.css";

/**
 * Home Page
 * Main dashboard for managing campaigns
 */
export function Home() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthContext();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [createCampaignModalOpen, setCreateCampaignModalOpen] = useState(false);
  const [joinCampaignModalOpen, setJoinCampaignModalOpen] = useState(false);
  const [campaignInfoModalOpen, setCampaignInfoModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Calculate player rankings for a campaign
  const calculatePlayerRankings = (campaign) => {
    if (!campaign.members || !campaign.memberDetails) return [];

    // Get completed matches - ensure matches is an array
    const matches = Array.isArray(campaign.matches) ? campaign.matches : [];
    const completedMatches = matches.filter((m) => m.status === "completed");

    // If no completed matches, return alphabetically sorted list
    if (completedMatches.length === 0) {
      return campaign.members
        .map((memberId) => ({
          memberId,
          username: campaign.memberDetails[memberId]?.username || "Sconosciuto",
          totalScore: 0,
          hasMatches: false,
        }))
        .sort((a, b) => a.username.localeCompare(b.username));
    }

    // Calculate scores for each player
    const playerScores = campaign.members.map((memberId) => {
      let totalScore = 0;

      completedMatches.forEach((match) => {
        const participant = match.participants?.[memberId];
        if (participant) {
          const score =
            participant.finalScore !== undefined
              ? participant.finalScore
              : participant.processedScore !== undefined
                ? participant.processedScore
                : participant.score || 0;
          totalScore += score;
        }
      });

      return {
        memberId,
        username: campaign.memberDetails[memberId]?.username || "Sconosciuto",
        totalScore,
        hasMatches: true,
      };
    });

    // Sort by total score descending
    return playerScores.sort((a, b) => b.totalScore - a.totalScore);
  };

  // Load campaigns from Firestore with real-time updates
  // Filter by user membership using Firestore query
  const {
    documents: campaigns,
    loading: campaignsLoading,
    error: campaignsError,
  } = useCollection("campaigns", [
    {
      type: "where",
      field: "members",
      operator: "array-contains",
      value: user?.uid || "",
    },
  ]);

  // Preload all member profile images when campaigns load
  useEffect(() => {
    if (campaigns && campaigns.length > 0) {
      const photoURLs = campaigns.flatMap((campaign) => {
        if (!campaign.memberDetails) return [];
        return Object.values(campaign.memberDetails)
          .filter((member) => member) // Filter out null/undefined members
          .map((member) => member.photoURL)
          .filter(Boolean);
      });

      if (photoURLs.length > 0) {
        preloadImages(photoURLs).then(() => {
          console.log(`Preloaded ${photoURLs.length} profile images`);
        });
      }
    }
  }, [campaigns]);

  const handleLogout = async () => {
    await logOut();
    navigate("/");
  };

  const handleCreateCampaign = async (campaignName) => {
    if (isCreating || !user) return;

    setIsCreating(true);
    const username = user.displayName || user.email?.split("@")[0] || "Utente";

    const { campaign, error } = await createCampaign(
      campaignName,
      user.uid,
      username,
      user.photoURL || null,
    );

    setIsCreating(false);

    if (error) {
      console.error("Errore creazione campagna:", error);
      alert("Errore nella creazione della campagna. Riprova.");
    }
  };

  const handleJoinCampaign = async (code) => {
    if (isJoining || !user) return;

    setIsJoining(true);
    const username = user.displayName || user.email?.split("@")[0] || "Utente";

    const { campaign, error } = await joinCampaign(
      code,
      user.uid,
      username,
      user.photoURL || null,
    );

    setIsJoining(false);

    if (error) {
      console.error("Errore unione campagna:", error);
      alert(error);
    }
  };

  const handleLeaveCampaign = async () => {
    if (!selectedCampaign || !user) return;

    const { success, error } = await leaveCampaign(
      selectedCampaign.id,
      user.uid,
    );

    if (error) {
      console.error("Errore uscita campagna:", error);
      alert("Errore nell'uscita dalla campagna. Riprova.");
    } else {
      setCampaignInfoModalOpen(false);
      setSelectedCampaign(null);
    }
  };

  const handleUpdateCampaignName = async (newName) => {
    if (!selectedCampaign) return;

    const { success, error } = await updateCampaignName(
      selectedCampaign.id,
      newName,
    );

    if (error) {
      console.error("Errore aggiornamento nome:", error);
      alert("Errore nell'aggiornamento del nome. Riprova.");
    }
  };

  const handleToggleImportant = async (campaign, e) => {
    e.stopPropagation();
    const newImportantStatus = !campaign.isImportant;

    const { success, error } = await toggleCampaignImportant(
      campaign.id,
      newImportantStatus,
    );

    if (error) {
      console.error("Errore aggiornamento importante:", error);
      alert("Errore nell'aggiornamento. Riprova.");
    }
  };

  const handleCampaignInfo = (campaign, e) => {
    e.stopPropagation();
    setSelectedCampaign(campaign);
    setCampaignInfoModalOpen(true);
  };

  const handleUpdateUsername = async (newUsername) => {
    if (!user) return;

    const { error } = await updateUserProfile(newUsername, user.photoURL);
    if (error) {
      console.error("Errore aggiornamento username:", error);
    } else {
      console.log("Username aggiornato con successo:", newUsername);

      // Update member details in all campaigns
      await updateMemberDetailsInCampaigns(user.uid, {
        username: newUsername,
        photoURL: user.photoURL || null,
      });
    }
  };

  const loading = authLoading || campaignsLoading;

  if (loading) {
    return (
      <div className="home-loading">
        <div className="spinner"></div>
        <p>Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-container">
        <header className="home-header">
          <div className="home-logo">
            <h1>CivTracker</h1>
          </div>
          <button
            className="profile-avatar-btn"
            onClick={() => setProfileModalOpen(true)}
            aria-label="Apri profilo"
            type="button"
          >
            <Avatar
              photoURL={user?.photoURL}
              displayName={user?.displayName}
              email={user?.email}
              size={48}
            />
          </button>
        </header>

        <main className="home-content">
          <div className="campaigns-grid">
            {/* Render existing campaigns */}
            {campaigns
              .sort((a, b) => {
                // Sort by important status first (true before false)
                if (a.isImportant && !b.isImportant) return -1;
                if (!a.isImportant && b.isImportant) return 1;
                // Then by name alphabetically
                return a.name.localeCompare(b.name);
              })
              .map((campaign) => {
                const rankedPlayers = calculatePlayerRankings(campaign);
                const completedMatchCount = (campaign.matches || []).filter(
                  (m) => m.status === "completed",
                ).length;

                // Check if draft is in progress
                const matches = Array.isArray(campaign.matches)
                  ? campaign.matches
                  : [];
                const currentMatch =
                  matches.length > 0 ? matches[matches.length - 1] : null;
                const draft = campaign.draft || {};
                const isDraftInProgress =
                  currentMatch &&
                  currentMatch.status === "in-progress" &&
                  !currentMatch.draftCompleted &&
                  (draft.phase !== "waiting" ||
                    (draft.readyPlayers && draft.readyPlayers.length > 0));

                return (
                  <div
                    key={campaign.id}
                    className={`campaign-card ${isDraftInProgress ? "blinking" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/campaign/${campaign.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/campaign/${campaign.id}`);
                      }
                    }}
                  >
                    {/* Header Section */}
                    <div className="campaign-card-header">
                      <h3 className="campaign-card-title">{campaign.name}</h3>
                      <div className="campaign-card-actions">
                        <button
                          className={`campaign-card-star-btn ${
                            campaign.isImportant ? "active" : ""
                          }`}
                          type="button"
                          onClick={(e) => handleToggleImportant(campaign, e)}
                          aria-label="Segna come importante"
                        >
                          <Star size={16} />
                        </button>
                        <button
                          className="campaign-card-info-btn"
                          type="button"
                          onClick={(e) => handleCampaignInfo(campaign, e)}
                          aria-label="Informazioni campagna"
                        >
                          <Info size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Ranking Section */}
                    <div className="campaign-members">
                      <div className="campaign-members-label">Classifica</div>
                      <div className="campaign-members-list">
                        {rankedPlayers.map((player, index) => (
                          <div
                            key={player.memberId}
                            className="campaign-member"
                          >
                            <div
                              className={`campaign-member-rank ${
                                player.hasMatches && index === 0 ? "trophy" : ""
                              }`}
                            >
                              {player.hasMatches ? (
                                index === 0 ? (
                                  <Trophy size={16} />
                                ) : (
                                  `${index + 1}`
                                )
                              ) : (
                                "-"
                              )}
                            </div>
                            <span className="campaign-member-divider">|</span>
                            <Avatar
                              photoURL={
                                campaign.memberDetails[player.memberId]
                                  ?.photoURL
                              }
                              displayName={player.username}
                              email={null}
                              size={32}
                              className="campaign-member-avatar"
                            />
                            <span className="campaign-member-name">
                              {player.username}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats Section */}
                    <div className="campaign-stats">
                      <div className="campaign-stats-placeholder">
                        {completedMatchCount === 0
                          ? "Nessuna partita completata"
                          : `${completedMatchCount} ${completedMatchCount === 1 ? "partita completata" : "partite completate"}`}
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* Add Campaign Card - Combined Join and Create */}
            <div className="campaign-add-container">
              {/* Join Campaign Section (2/3) */}
              <button
                className="campaign-join-btn"
                type="button"
                onClick={() => setJoinCampaignModalOpen(true)}
                aria-label="Unisciti ad una campagna"
              >
                <UserPlus size={38} className="campaign-join-icon" />
                <span className="campaign-join-text">
                  Unisciti ad una Campagna
                </span>
              </button>

              {/* Create Campaign Section (1/3) */}
              <button
                className="campaign-create-btn"
                type="button"
                onClick={() => setCreateCampaignModalOpen(true)}
                aria-label="Nuova campagna"
              >
                <Plus size={28} className="campaign-create-icon" />
                <span className="campaign-create-text">Nuova Campagna</span>
              </button>
            </div>
          </div>
        </main>

        <footer className="home-footer">
          <p>© 2026 CivTracker. Tutti i diritti riservati.</p>
        </footer>
      </div>

      {/* Create Campaign Modal */}
      <TextInputModal
        isOpen={createCampaignModalOpen}
        onClose={() => setCreateCampaignModalOpen(false)}
        onConfirm={handleCreateCampaign}
        title="Nuova Campagna"
        label="Nome Campagna"
        placeholder="Es: Campagna Italia, Gruppo Nord..."
        maxLength={50}
        minLength={3}
        confirmLabel="Crea"
      />

      {/* Join Campaign Modal */}
      <TextInputModal
        isOpen={joinCampaignModalOpen}
        onClose={() => setJoinCampaignModalOpen(false)}
        onConfirm={handleJoinCampaign}
        title="Unisciti a Campagna"
        label="Codice Campagna"
        placeholder="Inserisci codice 8 caratteri..."
        maxLength={8}
        minLength={8}
        confirmLabel="Unisciti"
        customValidation={(code) => {
          // Check if code doesn't match any existing campaign
          const existingCampaign = campaigns.find(
            (c) => c.code?.toUpperCase() === code.toUpperCase(),
          );
          return !existingCampaign;
        }}
      />

      {/* Campaign Info Modal */}
      <CampaignInfoModal
        isOpen={campaignInfoModalOpen}
        onClose={() => {
          setCampaignInfoModalOpen(false);
          setSelectedCampaign(null);
        }}
        campaign={selectedCampaign}
        onUpdateName={handleUpdateCampaignName}
        onLeaveCampaign={handleLeaveCampaign}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
        onUpdateUsername={handleUpdateUsername}
        onLogout={handleLogout}
      />
    </div>
  );
}
