// TierList Page - Global shared tier list for all leaders
import { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { ArrowLeft, Swords } from "lucide-react";
import { useAuthContext } from "../../contexts";
import { useLeaders } from "../../hooks";
import {
  subscribeTierList,
  initTierList,
  moveTierListLeader,
} from "../../services/firebase";
import "./TierList.css";

const TIERS = [
  { id: "S" },
  { id: "A" },
  { id: "B" },
  { id: "C" },
  { id: "D" },
  { id: "E" },
  { id: "F" },
];

const ALL_TIER_IDS = [...TIERS.map((t) => t.id), "unranked"];

// Replaces [IconName] tokens in descriptions with inline <img> elements
function parseDescriptionWithIcons(description) {
  if (!description) return "";
  const iconMap = {
    ScienceIcon: "ScienceIcon.webp",
    CultureIcon: "CultureIcon.webp",
    FoodIcon: "FoodIcon.webp",
    ProductionIcon: "ProductionIcon.webp",
    GoldIcon: "GoldIcon.webp",
    FaithIcon: "FaithIcon.webp",
    TourismIcon: "TourismIcon.webp",
    PowerIcon: "PowerIcon.webp",
    IronIcon: "IronIcon.webp",
    CoalIcon: "CoalIcon.webp",
    OilIcon: "OilIcon.webp",
    AluminumIcon: "AluminumIcon.webp",
    UraniumIcon: "UraniumIcon.webp",
    CitizenIcon: "CitizenIcon.webp",
    CapitalIcon: "CapitalIcon.webp",
    AmenitiesIcon: "AmenitiesIcon.webp",
    DistrictIcon: "DistrictIcon.webp",
    StrengthIcon: "StrengthIcon.webp",
    ReligiousStrengthIcon: "ReligiousStrengthIcon.webp",
    MovementIcon: "MovementIcon.webp",
    PromotionIcon: "PromotionIcon.webp",
    GeneralIcon: "GeneralIcon.webp",
    NuclearDeviceIcon: "NuclearDeviceIcon.webp",
    ThermonuclearDeviceIcon: "ThermonuclearDeviceIcon.webp",
    DiplomaticFavorIcon: "DiplomaticFavorIcon.webp",
    DiplomaticVisibilityIcon: "DiplomaticVisibilityIcon.webp",
    EnvoyIcon: "EnvoyIcon.webp",
    TradeRouteIcon: "TradeRouteIcon.webp",
    TradingPostIcon: "TradingPostIcon.webp",
    AllianceIcon: "AllianceIcon.webp",
    GossipIcon: "GossipIcon.webp",
    GrievancesIcon: "GrievancesIcon.webp",
    GreatPersonIcon: "GreatPersonIcon.webp",
    GreatProphetIcon: "GreatProphetIcon.webp",
    ScientistIcon: "ScientistIcon.webp",
    MerchantIcon: "MerchantIcon.webp",
    GreatWorkArtIcon: "GreatWorkArtIcon.webp",
    GreatWorkMusicIcon: "GreatWorkMusicIcon.webp",
    GreatWorkWritingIcon: "GreatWorkWritingIcon.webp",
    ReligiousArtIcon: "ReligiousArtIcon.webp",
    SculptureIcon: "SculptureIcon.webp",
    ArtifactAncientIcon: "ArtifactAncientIcon.webp",
    RelicIcon: "RelicIcon.webp",
    PortraitIcon: "PortraitIcon.webp",
    EurekaIcon: "EurekaIcon.webp",
    InspirationIcon: "InspirationIcon.webp",
    BuildChargesIcon: "BuildChargesIcon.webp",
    TurnIcon: "TurnIcon.webp",
  };
  let processed = description;
  Object.entries(iconMap).forEach(([key, filename]) => {
    processed = processed.replace(
      new RegExp(`\\[${key}\\]`, "g"),
      `<img src="/IconePerTooltip/${filename}" class="tooltip-icon" alt="${key}" />`,
    );
  });
  return processed.replace(/\n/g, "<br>");
}

function getTitleFontSize(text) {
  const len = (text || "").length;
  if (len <= 20) return undefined;
  if (len <= 30) return "0.875rem";
  return "0.72rem";
}

function AbilityList({ abilities }) {
  if (!abilities || abilities.length === 0) {
    return <p className="leader-tooltip-empty">Da aggiungere...</p>;
  }
  return abilities.map((ability, i) => (
    <div key={i} className="leader-tooltip-ability">
      <div className="leader-tooltip-ability-header">
        <strong>{ability.name}</strong>
        <span className="leader-tooltip-ability-separator"> | </span>
        <em>{ability.type}</em>
      </div>
      <div
        className="leader-tooltip-ability-description"
        dangerouslySetInnerHTML={{
          __html: parseDescriptionWithIcons(ability.description),
        }}
      />
    </div>
  ));
}

function LeaderCard({ leader, tierId, isDragging, onDragStart }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef(null);
  const cursorRef = useRef({ x: 0, y: 0 });

  const hasLeaderAbilities = (leader?.abilities || []).length > 0;
  const hasCivAbilities = (leader?.civilizationAbilities || []).length > 0;
  const leaderTitle = `${leader.name}${leader.variant ? ` (${leader.variant})` : ""}`;

  const recalcPos = (cx, cy) => {
    const M = 10,
      O = 18;
    let x = cx + O,
      y = cy + O;
    if (tooltipRef.current) {
      const { width, height } = tooltipRef.current.getBoundingClientRect();
      if (x + width > window.innerWidth - M) x = cx - width - O;
      if (y + height > window.innerHeight - M) y = cy - height - O;
    }
    setPos({ x: Math.max(M, x), y: Math.max(M, y) });
  };

  // Recompute position once tooltip has rendered and its dimensions are known
  useLayoutEffect(() => {
    if (visible) recalcPos(cursorRef.current.x, cursorRef.current.y);
  }, [visible]);

  // Hide tooltip immediately when this card starts being dragged
  useEffect(() => {
    if (isDragging) setVisible(false);
  }, [isDragging]);

  return (
    <>
      <div
        className={`tierlist-card${isDragging ? " dragging" : ""}`}
        draggable
        onDragStart={(e) => onDragStart(e, leader.id, tierId)}
        onMouseEnter={(e) => {
          if (isDragging) return;
          cursorRef.current = { x: e.clientX, y: e.clientY };
          setVisible(true);
          recalcPos(e.clientX, e.clientY);
        }}
        onMouseMove={(e) => {
          if (!visible) return;
          cursorRef.current = { x: e.clientX, y: e.clientY };
          recalcPos(e.clientX, e.clientY);
        }}
        onMouseLeave={() => setVisible(false)}
      >
        <div className="tierlist-card-icon">
          <img
            src={leader.leaderIconPath}
            alt={leader.name}
            draggable={false}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
        <div className="tierlist-card-name">
          {leader.name}
          {leader.variant && (
            <span className="card-variant">{leader.variant}</span>
          )}
        </div>
      </div>

      {visible &&
        createPortal(
          <div
            ref={tooltipRef}
            className="tl-dual-tooltip"
            style={{ position: "fixed", left: pos.x, top: pos.y }}
          >
            {/* Leader panel */}
            <div className="leader-tooltip">
              <div className="leader-tooltip-header">
                <div className="leader-tooltip-title">
                  <span
                    className="leader-tooltip-title-text"
                    style={{ fontSize: getTitleFontSize(leaderTitle) }}
                  >
                    {leaderTitle}
                  </span>
                </div>
              </div>
              <div className="leader-tooltip-content">
                <AbilityList abilities={leader.abilities} />
              </div>
            </div>

            {/* Central connector badge */}
            <div className="tl-connector" aria-hidden="true">
              <div className="tl-connector-badge">
                <Swords size={13} />
              </div>
            </div>

            {/* Civilization panel */}
            <div className="leader-tooltip">
              <div className="leader-tooltip-header">
                <div className="leader-tooltip-title">
                  <span
                    className="leader-tooltip-title-text"
                    style={{ fontSize: getTitleFontSize(leader.civilization) }}
                  >
                    {leader.civilization}
                  </span>
                </div>
              </div>
              <div className="leader-tooltip-content">
                <AbilityList abilities={leader.civilizationAbilities} />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export function TierList() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { leaders, loading: leadersLoading } = useLeaders();

  const [localTiers, setLocalTiers] = useState(null);
  const [tierMeta, setTierMeta] = useState(null);
  const [dragState, setDragState] = useState(null); // { leaderId, fromTier }
  const [dragOverTier, setDragOverTier] = useState(null);
  const draggingRef = useRef(null);
  // Initialize tier list when leaders are loaded
  useEffect(() => {
    if (leaders && leaders.length > 0) {
      initTierList(leaders.map((l) => l.id));
    }
  }, [leaders]);

  // Real-time subscription — skip update while user is dragging
  useEffect(() => {
    const unsub = subscribeTierList((data) => {
      if (!draggingRef.current && data) {
        setLocalTiers(data.tiers || {});
        setTierMeta({
          lastUpdatedByName: data.lastUpdatedByName,
          updatedAt: data.updatedAt,
        });
      }
    });
    return unsub;
  }, []);

  const leaderMap = useMemo(() => {
    if (!leaders) return {};
    return leaders.reduce((acc, l) => {
      acc[l.id] = l;
      return acc;
    }, {});
  }, [leaders]);

  // Always sorted alphabetically so newly returned leaders slot in correctly
  const sortedUnranked = useMemo(() => {
    const ids = localTiers?.unranked || [];
    return [...ids].sort((a, b) => {
      const la = leaderMap[a],
        lb = leaderMap[b];
      if (!la || !lb) return 0;
      return la.name.localeCompare(lb.name);
    });
  }, [localTiers?.unranked, leaderMap]);

  const handleDragStart = (e, leaderId, fromTier) => {
    draggingRef.current = { leaderId, fromTier };
    setDragState({ leaderId, fromTier });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", leaderId); // required for Firefox
  };

  const handleDragEnd = () => {
    draggingRef.current = null;
    setDragState(null);
    setDragOverTier(null);
  };

  const handleDragOver = (e, tierId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverTier !== tierId) setDragOverTier(tierId);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverTier(null);
    }
  };

  const handleDrop = async (e, toTier) => {
    e.preventDefault();
    const current = draggingRef.current;
    if (!current) return;

    const { leaderId, fromTier } = current;
    draggingRef.current = null;
    setDragState(null);
    setDragOverTier(null);

    if (fromTier === toTier) return;

    // Optimistic update for immediate feedback
    setLocalTiers((prev) => {
      const next = {};
      ALL_TIER_IDS.forEach((t) => {
        next[t] = [...(prev[t] || [])];
      });
      next[fromTier] = next[fromTier].filter((id) => id !== leaderId);
      next[toTier] = [...next[toTier], leaderId];
      return next;
    });

    await moveTierListLeader(
      leaderId,
      fromTier,
      toTier,
      user.uid,
      user.displayName || "Utente",
    );
  };

  if (leadersLoading || localTiers === null) {
    return (
      <div className="tierlist-loading">
        <div className="spinner"></div>
        <p>Caricamento tier list...</p>
      </div>
    );
  }

  return (
    <div className="tierlist-page" onDragEnd={handleDragEnd}>
      {/* Header */}
      <header className="tierlist-header">
        <button
          className="tierlist-back-btn"
          onClick={() => navigate("/home")}
          aria-label="Torna alla home"
          type="button"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="tierlist-title">Tier List Personaggi</h1>
        {/* spacer to keep title visually centered */}
        <div style={{ width: 44 }} aria-hidden="true" />
      </header>

      {/* Scrollable content */}
      <main className="tierlist-content">
        <div className="tierlist-container">
          {/* Tier rows S–F */}
          <div className="tierlist-grid">
            {TIERS.map((tier) => (
              <div key={tier.id} className="tierlist-row">
                <div className="tier-label" data-tier={tier.id}>
                  <span className="tier-letter">{tier.id}</span>
                </div>
                <div
                  className={`tier-drop-zone${dragOverTier === tier.id ? " drag-over" : ""}`}
                  onDragOver={(e) => handleDragOver(e, tier.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, tier.id)}
                >
                  {(localTiers[tier.id] || []).map((leaderId) => {
                    const leader = leaderMap[leaderId];
                    if (!leader) return null;
                    return (
                      <LeaderCard
                        key={leaderId}
                        leader={leader}
                        tierId={tier.id}
                        isDragging={dragState?.leaderId === leaderId}
                        onDragStart={handleDragStart}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Unranked pool */}
          <div
            className={`tierlist-unranked${dragOverTier === "unranked" ? " drag-over" : ""}`}
            onDragOver={(e) => handleDragOver(e, "unranked")}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, "unranked")}
          >
            <div className="unranked-header">
              Non classificati · {(localTiers.unranked || []).length}
            </div>
            <div className="unranked-cards">
              {sortedUnranked.map((leaderId) => {
                const leader = leaderMap[leaderId];
                if (!leader) return null;
                return (
                  <LeaderCard
                    key={leaderId}
                    leader={leader}
                    tierId="unranked"
                    isDragging={dragState?.leaderId === leaderId}
                    onDragStart={handleDragStart}
                  />
                );
              })}
            </div>
          </div>

          {/* Last edited by */}
          {tierMeta?.lastUpdatedByName && (
            <p className="tierlist-meta">
              Ultima modifica: {tierMeta.lastUpdatedByName}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
