// Home Page - Campaign Management
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Info,
  UserPlus,
  Trophy,
  Star,
  Clock,
  LayoutGrid,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
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

const SORT_OPTIONS = [
  { value: "alpha", label: "Alfabetico" },
  { value: "members", label: "Numero membri" },
  { value: "lastAccess", label: "Ultimo accesso" },
  { value: "created", label: "Data creazione" },
];

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

  // Recent campaign IDs, localStorage-backed (most recent first)
  const [recentCampaignIds, setRecentCampaignIds] = useState([]);
  // Last access timestamps { campaignId: timestamp }
  const [lastAccessMap, setLastAccessMap] = useState({});
  // Sort type for "Tutte" section
  const [sortType, setSortType] = useState("alpha");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortMenuRef = useRef(null);

  // Collapse state for collapsible sections (default expanded)
  const [favoritesExpanded, setFavoritesExpanded] = useState(true);
  const [recentsExpanded, setRecentsExpanded] = useState(true);

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
        preloadImages(photoURLs);
      }
    }
  }, [campaigns]);

  // Load recents and last access from localStorage on mount
  useEffect(() => {
    if (!user?.uid) return;
    try {
      const storedRecents = localStorage.getItem(
        `civtracker_recent_${user.uid}`,
      );
      if (storedRecents) setRecentCampaignIds(JSON.parse(storedRecents));
      const storedAccess = localStorage.getItem(
        `civtracker_last_access_${user.uid}`,
      );
      if (storedAccess) setLastAccessMap(JSON.parse(storedAccess));
      const storedFavExp = localStorage.getItem(
        `civtracker_sect_fav_${user.uid}`,
      );
      if (storedFavExp !== null) setFavoritesExpanded(JSON.parse(storedFavExp));
      const storedRecExp = localStorage.getItem(
        `civtracker_sect_rec_${user.uid}`,
      );
      if (storedRecExp !== null) setRecentsExpanded(JSON.parse(storedRecExp));
    } catch {
      // ignore parse errors
    }
  }, [user?.uid]);

  // Close sort dropdown on outside click
  useEffect(() => {
    if (!sortMenuOpen) return;
    const handleOutsideClick = (e) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) {
        setSortMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [sortMenuOpen]);

  const handleNavigateToCampaign = useCallback(
    (campaignId) => {
      if (!user?.uid) return;
      const now = Date.now();

      setLastAccessMap((prev) => {
        const next = { ...prev, [campaignId]: now };
        localStorage.setItem(
          `civtracker_last_access_${user.uid}`,
          JSON.stringify(next),
        );
        return next;
      });

      setRecentCampaignIds((prev) => {
        const next = [
          campaignId,
          ...prev.filter((id) => id !== campaignId),
        ].slice(0, 5);
        localStorage.setItem(
          `civtracker_recent_${user.uid}`,
          JSON.stringify(next),
        );
        return next;
      });

      navigate(`/campaign/${campaignId}`);
    },
    [user, navigate],
  );

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
    } else {
      handleNavigateToCampaign(campaign.id);
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
    } else {
      handleNavigateToCampaign(campaign.id);
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

    // Check if current user has this campaign marked as important
    const importantFor = campaign.importantFor || [];
    const isCurrentlyImportant = importantFor.includes(user.uid);
    const newImportantStatus = !isCurrentlyImportant;

    const { success, error } = await toggleCampaignImportant(
      campaign.id,
      user.uid,
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
      // Update member details in all campaigns
      await updateMemberDetailsInCampaigns(user.uid, {
        username: newUsername,
        photoURL: user.photoURL || null,
      });
    }
  };

  const toggleFavorites = () => {
    setFavoritesExpanded((v) => {
      const next = !v;
      localStorage.setItem(
        `civtracker_sect_fav_${user?.uid}`,
        JSON.stringify(next),
      );
      return next;
    });
  };

  const toggleRecents = () => {
    setRecentsExpanded((v) => {
      const next = !v;
      localStorage.setItem(
        `civtracker_sect_rec_${user?.uid}`,
        JSON.stringify(next),
      );
      return next;
    });
  };

  const sortCampaigns = useCallback(
    (camps) => {
      const sorted = [...camps];
      switch (sortType) {
        case "members":
          return sorted.sort(
            (a, b) => (b.members?.length || 0) - (a.members?.length || 0),
          );
        case "lastAccess":
          return sorted.sort((a, b) => {
            const aTime = lastAccessMap[a.id] || 0;
            const bTime = lastAccessMap[b.id] || 0;
            return bTime - aTime;
          });
        case "created":
          return sorted.sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
          });
        default: // "alpha"
          return sorted.sort((a, b) => a.name.localeCompare(b.name));
      }
    },
    [sortType, lastAccessMap],
  );

  // Campaign sections
  const favoriteCampaigns = campaigns.filter((c) =>
    (c.importantFor || []).includes(user?.uid),
  );
  const recentCampaignsFiltered = recentCampaignIds
    .map((id) => campaigns.find((c) => c.id === id))
    .filter(Boolean)
    .slice(0, 5);
  const allCampaignsSorted = sortCampaigns(campaigns);

  const loading = authLoading || campaignsLoading;

  // Renders a single campaign card (reused across all sections)
  const renderCampaignCard = (campaign) => {
    const rankedPlayers = calculatePlayerRankings(campaign);
    const completedMatchCount = (campaign.matches || []).filter(
      (m) => m.status === "completed",
    ).length;
    const isImportantForMe = (campaign.importantFor || []).includes(user?.uid);
    const matches = Array.isArray(campaign.matches) ? campaign.matches : [];
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
        onClick={() => handleNavigateToCampaign(campaign.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleNavigateToCampaign(campaign.id);
          }
        }}
      >
        {/* Header Section */}
        <div className="campaign-card-header">
          <h3 className="campaign-card-title">{campaign.name}</h3>
          <div className="campaign-card-actions">
            <button
              className={`campaign-card-star-btn ${isImportantForMe ? "active" : ""}`}
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
          <div className="campaign-members-list">
            {rankedPlayers.map((player, index) => (
              <div key={player.memberId} className="campaign-member">
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
                  photoURL={campaign.memberDetails[player.memberId]?.photoURL}
                  displayName={player.username}
                  email={null}
                  size={32}
                  className="campaign-member-avatar"
                />
                <span className="campaign-member-name">{player.username}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="campaign-stats">
          <div className="campaign-stats-placeholder">
            {completedMatchCount === 0
              ? "Nessuna partita completata"
              : `${completedMatchCount} ${
                  completedMatchCount === 1
                    ? "partita completata"
                    : "partite completate"
                }`}
          </div>
        </div>
      </div>
    );
  };

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
      {/* Sticky full-width header */}
      <header className="home-header">
        <div className="home-header-inner">
          <div className="home-logo">
            <h1>CivTracker</h1>
          </div>
          <div className="home-header-actions">
            <button
              className="header-action-btn header-action-btn--join"
              type="button"
              onClick={() => setJoinCampaignModalOpen(true)}
              aria-label="Unisciti ad una campagna"
            >
              <UserPlus size={20} />
              <span>Unisciti</span>
            </button>
            <button
              className="header-action-btn header-action-btn--create"
              type="button"
              onClick={() => setCreateCampaignModalOpen(true)}
              aria-label="Nuova campagna"
            >
              <Plus size={20} />
              <span>Crea</span>
            </button>
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
          </div>
        </div>
      </header>

      {/* Scrollable area */}
      <div className="home-scroll">
        <div className="home-container">
          <main className="home-content">
            <div className="home-sections">
              {/* ── Preferiti ── */}
              {favoriteCampaigns.length > 0 && (
                <div className="section-block">
                  <div className="section-divider">
                    <div className="section-divider-line" />
                    <button
                      className="section-label-pill"
                      type="button"
                      onClick={toggleFavorites}
                      aria-expanded={favoritesExpanded}
                      aria-label={`${favoritesExpanded ? "Comprimi" : "Espandi"} Preferiti`}
                    >
                      <Star size={13} />
                      <span>Preferiti</span>
                      <ChevronDown
                        size={12}
                        className={`section-chevron ${favoritesExpanded ? "expanded" : ""}`}
                      />
                    </button>
                    <div className="section-divider-line" />
                  </div>
                  <div
                    className={`section-content ${favoritesExpanded ? "" : "collapsed"}`}
                  >
                    <div className="campaigns-grid">
                      {favoriteCampaigns.map(renderCampaignCard)}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Recenti ── */}
              {recentCampaignsFiltered.length > 0 && (
                <div className="section-block">
                  <div className="section-divider">
                    <div className="section-divider-line" />
                    <button
                      className="section-label-pill"
                      type="button"
                      onClick={toggleRecents}
                      aria-expanded={recentsExpanded}
                      aria-label={`${recentsExpanded ? "Comprimi" : "Espandi"} Recenti`}
                    >
                      <Clock size={13} />
                      <span>Recenti</span>
                      <ChevronDown
                        size={12}
                        className={`section-chevron ${recentsExpanded ? "expanded" : ""}`}
                      />
                    </button>
                    <div className="section-divider-line" />
                  </div>
                  <div
                    className={`section-content ${recentsExpanded ? "" : "collapsed"}`}
                  >
                    <div className="campaigns-grid">
                      {recentCampaignsFiltered.map(renderCampaignCard)}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tutte ── */}
              <div className="section-block">
                <div className="section-divider">
                  <div className="section-divider-line" />
                  <div className="section-label-area">
                    <LayoutGrid size={13} />
                    <span>Tutte</span>
                    <div className="section-sort-sep" />
                    <div className="section-sort-wrapper" ref={sortMenuRef}>
                      <button
                        className="section-sort-inline-btn"
                        type="button"
                        onClick={() => setSortMenuOpen((v) => !v)}
                        aria-label="Ordina campagne"
                      >
                        <ArrowUpDown size={11} />
                        <span>
                          {
                            SORT_OPTIONS.find((o) => o.value === sortType)
                              ?.label
                          }
                        </span>
                        <ChevronDown
                          size={11}
                          className={`sort-chevron ${sortMenuOpen ? "open" : ""}`}
                        />
                      </button>
                      {sortMenuOpen && (
                        <div className="section-sort-dropdown">
                          {SORT_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              className={`sort-option ${sortType === opt.value ? "active" : ""}`}
                              onClick={() => {
                                setSortType(opt.value);
                                setSortMenuOpen(false);
                              }}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="section-divider-line" />
                </div>
                <div className="campaigns-grid">
                  {allCampaignsSorted.map(renderCampaignCard)}
                </div>
              </div>
            </div>
          </main>

          <footer className="home-footer">
            <p>© 2026 CivTracker. Tutti i diritti riservati.</p>
          </footer>
        </div>
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
