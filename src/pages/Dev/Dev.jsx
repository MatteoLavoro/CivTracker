// Dev Page - Development Tools
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/common";
import {
  seedLeadersDescriptions,
  seedCivilizationsDescriptions,
} from "../../services/firebase";
import "./Dev.css";

/**
 * Dev Page
 * Development tools for database seeding and maintenance
 */
export function Dev() {
  const navigate = useNavigate();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedingStatus, setSeedingStatus] = useState(null);
  const [seedingError, setSeedingError] = useState(null);

  const handleSeedLeadersDescriptions = async () => {
    if (isSeeding) return;

    setIsSeeding(true);
    setSeedingStatus("Caricamento descrizioni personaggi...");
    setSeedingError(null);

    try {
      const result = await seedLeadersDescriptions();

      if (result.success) {
        setSeedingStatus(
          `✅ Successo! Aggiornati ${result.updated} personaggi su ${result.total} (${result.notFound} non trovati)`,
        );
      } else {
        setSeedingError(`❌ Errore: ${result.error}`);
        setSeedingStatus(null);
      }
    } catch (error) {
      setSeedingError(`❌ Errore: ${error.message}`);
      setSeedingStatus(null);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSeedCivilizationsDescriptions = async () => {
    if (isSeeding) return;

    setIsSeeding(true);
    setSeedingStatus("Caricamento descrizioni civiltà...");
    setSeedingError(null);

    try {
      const result = await seedCivilizationsDescriptions();

      if (result.success) {
        setSeedingStatus(
          `✅ Successo! Aggiornate ${result.updated} civiltà su ${result.total}`,
        );
      } else {
        setSeedingError(`❌ Errore: ${result.error}`);
        setSeedingStatus(null);
      }
    } catch (error) {
      setSeedingError(`❌ Errore: ${error.message}`);
      setSeedingStatus(null);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSeedAll = async () => {
    if (isSeeding) return;

    setIsSeeding(true);
    setSeedingStatus("Caricamento tutte le descrizioni...");
    setSeedingError(null);

    try {
      // Seed leaders first
      setSeedingStatus("Caricamento descrizioni personaggi...");
      const leadersResult = await seedLeadersDescriptions();

      if (!leadersResult.success) {
        throw new Error(leadersResult.error);
      }

      // Seed civilizations
      setSeedingStatus("Caricamento descrizioni civiltà...");
      const civsResult = await seedCivilizationsDescriptions();

      if (!civsResult.success) {
        throw new Error(civsResult.error);
      }

      setSeedingStatus(
        `✅ Successo completo!\n` +
          `Personaggi: ${leadersResult.updated}/${leadersResult.total}\n` +
          `Civiltà: ${civsResult.updated}/${civsResult.total}`,
      );
    } catch (error) {
      setSeedingError(`❌ Errore: ${error.message}`);
      setSeedingStatus(null);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="dev-page">
      <div className="dev-container">
        {/* Header */}
        <div className="dev-header">
          <button className="dev-back-btn" onClick={() => navigate("/home")}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="dev-title">Development Tools</h1>
          <div className="dev-spacer"></div>
        </div>

        {/* Content */}
        <div className="dev-content">
          <div className="dev-section">
            <h2 className="dev-section-title">Database Seeding</h2>
            <p className="dev-section-description">
              Popola il database con le descrizioni dei personaggi e delle
              civiltà dalla cartella <code>public/CivDescrizioni</code>.
            </p>

            <div className="dev-buttons">
              <Button
                variant="primary"
                onClick={handleSeedLeadersDescriptions}
                disabled={isSeeding}
                fullWidth
              >
                {isSeeding && seedingStatus?.includes("personaggi")
                  ? "Caricamento..."
                  : "Carica Descrizioni Personaggi"}
              </Button>

              <Button
                variant="primary"
                onClick={handleSeedCivilizationsDescriptions}
                disabled={isSeeding}
                fullWidth
              >
                {isSeeding && seedingStatus?.includes("civiltà")
                  ? "Caricamento..."
                  : "Carica Descrizioni Civiltà"}
              </Button>

              <Button
                variant="primary"
                onClick={handleSeedAll}
                disabled={isSeeding}
                fullWidth
              >
                {isSeeding && seedingStatus?.includes("tutte")
                  ? "Caricamento..."
                  : "⚡ Carica Tutto"}
              </Button>
            </div>

            {/* Status Messages */}
            {seedingStatus && (
              <div className="dev-status-success">
                <pre>{seedingStatus}</pre>
              </div>
            )}

            {seedingError && (
              <div className="dev-status-error">
                <pre>{seedingError}</pre>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="dev-section">
            <h2 className="dev-section-title">ℹ️ Formato Descrizioni</h2>
            <p className="dev-section-description">
              Le descrizioni seguono questo formato:
            </p>
            <div className="dev-code-block">
              <code>
                [Nome Abilità] &#123;Tipo Abilità&#125;
                <br />
                <br />
                Descrizione dell'abilità...
              </code>
            </div>
            <p className="dev-section-description">
              <strong>Tipi supportati:</strong> Abilità esclusiva, Unità
              speciale, Infrastruttura speciale, Distretto speciale, ecc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
