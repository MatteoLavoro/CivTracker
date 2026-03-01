// Home Page - Campaign Management
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Info, UserPlus, Trophy } from "lucide-react";
import { useAuthContext } from "../../contexts";
import { useCollection } from "../../hooks";
import {
  logOut,
  updateUserProfile,
  createCampaign,
  joinCampaign,
  leaveCampaign,
  updateCampaignName,
} from "../../services/firebase";
import {
  TextInputModal,
  ProfileModal,
  CampaignInfoModal,
} from "../../components/common";
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

    const { campaign, error } = await joinCampaign(code, user.uid, username);

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

  const handleCampaignInfo = (campaign, e) => {
    e.stopPropagation();
    setSelectedCampaign(campaign);
    setCampaignInfoModalOpen(true);
  };

  const handleUpdateUsername = async (newUsername) => {
    const { error } = await updateUserProfile(newUsername);
    if (error) {
      console.error("Errore aggiornamento username:", error);
    } else {
      console.log("Username aggiornato con successo:", newUsername);
    }
  };

  const getUserInitials = () => {
    if (user?.displayName) {
      const names = user.displayName.split(" ");
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return user.displayName.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
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
            <div className="profile-avatar-initials">{getUserInitials()}</div>
          </button>
        </header>

        <main className="home-content">
          <div className="campaigns-grid">
            {/* Render existing campaigns */}
            {campaigns.map((campaign) => {
              const membersList =
                campaign.members
                  ?.map(
                    (memberId) => campaign.memberDetails?.[memberId]?.username,
                  )
                  .filter(Boolean) || [];

              return (
                <div
                  key={campaign.id}
                  className="campaign-card"
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
                    <button
                      className="campaign-card-info-btn"
                      type="button"
                      onClick={(e) => handleCampaignInfo(campaign, e)}
                      aria-label="Informazioni campagna"
                    >
                      <Info size={16} />
                    </button>
                  </div>

                  {/* Ranking Section */}
                  <div className="campaign-members">
                    <div className="campaign-members-label">Classifica</div>
                    <div className="campaign-members-list">
                      {membersList
                        .sort((a, b) => a.localeCompare(b))
                        .map((member, index) => (
                          <div key={index} className="campaign-member">
                            <div
                              className={`campaign-member-rank ${
                                index === 0 ? "trophy" : ""
                              }`}
                            >
                              {index === 0 ? (
                                <Trophy size={16} />
                              ) : (
                                `${index + 1}`
                              )}
                            </div>
                            <span className="campaign-member-divider">|</span>
                            <div className="campaign-member-avatar">
                              {member.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="campaign-member-name">
                              {member}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="campaign-stats">
                    <div className="campaign-stats-placeholder">
                      {/* Future statistics */}
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
