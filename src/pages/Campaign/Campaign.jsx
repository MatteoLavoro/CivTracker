// Campaign Page - Individual Campaign View
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import { useDocument } from "../../hooks";
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

      {/* Main Content - Empty for now, ready for future features */}
      <main className="campaign-content">
        <div className="campaign-placeholder">
          <p>Contenuto campagna in arrivo...</p>
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
