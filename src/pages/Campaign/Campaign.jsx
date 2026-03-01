// Campaign Page - Individual Campaign View
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import { useDocument, useLeaders } from "../../hooks";
import { useAuthContext } from "../../contexts";
import { leaveCampaign, updateCampaignName } from "../../services/firebase";
import { CampaignInfoModal } from "../../components/common";
import "./Campaign.css";

/**
 * Campaign Page
 * Individual campaign view with full screen layout
 */
export function Campaign() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [campaignInfoModalOpen, setCampaignInfoModalOpen] = useState(false);

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

  if (loading) {
    return (
      <div className="campaign-loading">
        <div className="spinner"></div>
        <p>Caricamento campagna...</p>
      </div>
    );
  }

  if (!campaign || !isMember) {
    return null; // Will redirect via useEffect
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

      {/* Main Content - Leaders Table */}
      <main className="campaign-content">
        <div className="leaders-section">
          <h2 className="leaders-section-title">Leader Civilization VI</h2>

          {leadersLoading ? (
            <div className="leaders-loading">
              <div className="spinner"></div>
              <p>Caricamento leader...</p>
            </div>
          ) : leadersError ? (
            <div className="leaders-empty">
              <p>⚠️ Errore nel caricamento dei leader</p>
              <p className="leaders-empty-hint">
                È necessario popolare il database dei leader.
              </p>
              <p
                className="leaders-empty-hint"
                style={{ fontSize: "0.75rem", marginTop: "1rem" }}
              >
                Errore: {leadersError}
              </p>
            </div>
          ) : leaders && leaders.length > 0 ? (
            <div className="leaders-table-container">
              <table className="leaders-table">
                <thead>
                  <tr>
                    <th>Leader</th>
                    <th>Civiltà</th>
                    <th>Nome</th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((leader) => (
                    <tr key={leader.id} className="leader-row">
                      <td className="leader-icon-cell">
                        <img
                          src={leader.leaderIconPath}
                          alt={leader.name}
                          className="leader-icon"
                          loading="lazy"
                        />
                      </td>
                      <td className="civ-icon-cell">
                        <img
                          src={leader.civilizationIconPath}
                          alt={leader.civilization}
                          className="civ-icon"
                          loading="lazy"
                        />
                      </td>
                      <td className="leader-name-cell">
                        <div className="leader-name-wrapper">
                          <span className="leader-name">{leader.name}</span>
                          {leader.variant && (
                            <span className="leader-variant">
                              ({leader.variant})
                            </span>
                          )}
                          <span className="leader-civilization">
                            {leader.civilization}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="leaders-empty">
              <p>📋 Nessun leader disponibile</p>
              <p className="leaders-empty-hint">
                Il database è vuoto. Popola il database con i 77 leader di
                Civilization VI.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Campaign Info Modal */}
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
