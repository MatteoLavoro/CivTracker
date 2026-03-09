// Leader Tooltip - Show leader/civilization abilities on hover
import { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import "./LeaderTooltip.css";

/**
 * Parse description text and convert [IconName] into img tags
 * Example: "+2 [ScienceIcon] Scienza" -> "+2 <img src="/IconePerTooltip/ScienceIcon.webp" /> Scienza"
 */
function parseDescriptionWithIcons(description) {
  if (!description) return "";

  // Available icons mapping
  const iconMap = {
    ScienceIcon: "ScienceIcon.webp",
    CultureIcon: "CultureIcon.webp",
    FoodIcon: "FoodIcon.webp",
    ProductionIcon: "ProductionIcon.webp",
    GoldIcon: "GoldIcon.webp",
    FaithIcon: "FaithIcon.webp",
    CitizenIcon: "CitizenIcon.webp",
    CapitalIcon: "CapitalIcon.webp",
    IronIcon: "IronIcon.webp",
    DiplomaticFavorIcon: "DiplomaticFavorIcon.webp",
  };

  // Replace [IconName] with img tags
  let processed = description;
  Object.entries(iconMap).forEach(([key, filename]) => {
    const regex = new RegExp(`\\[${key}\\]`, "g");
    processed = processed.replace(
      regex,
      `<img src="/IconePerTooltip/${filename}" class="tooltip-icon" alt="${key}" />`,
    );
  });

  // Convert newlines to <br>
  processed = processed.replace(/\n/g, "<br>");

  return processed;
}

/**
 * LeaderTooltip Component
 * Shows abilities when hovering over leader or civilization icons
 */
export function LeaderTooltip({ children, leader, type = "leader" }) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  // Get abilities based on type
  const abilities =
    type === "civilization"
      ? leader?.civilizationAbilities || []
      : leader?.abilities || [];

  // Update tooltip position based on mouse position
  const updatePosition = (e) => {
    if (!tooltipRef.current) return;

    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    // Default: position tooltip to the right and below cursor
    let x = e.clientX + 15;
    let y = e.clientY + 15;

    // Check if tooltip goes off right edge, position to the left of cursor
    if (x + tooltipRect.width > window.innerWidth - 10) {
      x = e.clientX - tooltipRect.width - 15;
    }

    // Check if tooltip goes off bottom, position above cursor
    if (y + tooltipRect.height > window.innerHeight - 10) {
      y = e.clientY - tooltipRect.height - 15;
    }

    // Check if tooltip goes off left edge
    if (x < 10) {
      x = 10;
    }

    // Check if tooltip goes off top
    if (y < 10) {
      y = 10;
    }

    setPosition({ x, y });
  };

  useLayoutEffect(() => {
    const trigger = triggerRef.current;

    if (isVisible && trigger) {
      const handleMouseMove = (e) => {
        updatePosition(e);
      };

      trigger.addEventListener("mousemove", handleMouseMove);

      return () => {
        trigger.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, [isVisible]);

  const handleMouseEnter = (e) => {
    setIsVisible(true);
    updatePosition(e);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="tooltip-trigger"
      >
        {children}
      </div>

      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            className="leader-tooltip"
            style={{
              position: "fixed",
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
          >
            <div className="leader-tooltip-header">
              <div className="leader-tooltip-title">
                {type === "civilization"
                  ? leader.civilization
                  : `${leader.name}${leader.variant ? ` (${leader.variant})` : ""}`}
              </div>
            </div>

            <div className="leader-tooltip-content">
              {abilities.length > 0 ? (
                abilities.map((ability, index) => (
                  <div key={index} className="leader-tooltip-ability">
                    <div className="leader-tooltip-ability-header">
                      <strong>{ability.name}</strong>
                      <span className="leader-tooltip-ability-separator">
                        {" "}
                        |{" "}
                      </span>
                      <em>{ability.type}</em>
                    </div>
                    <div
                      className="leader-tooltip-ability-description"
                      dangerouslySetInnerHTML={{
                        __html: parseDescriptionWithIcons(ability.description),
                      }}
                    />
                  </div>
                ))
              ) : (
                <div className="leader-tooltip-empty">Da aggiungere...</div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
