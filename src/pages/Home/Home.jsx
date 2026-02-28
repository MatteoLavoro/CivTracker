// Home Page - Work in Progress
import { useNavigate } from "react-router-dom";
import { BarChart, Map, TrendingUp, Users, LogOut } from "lucide-react";
import { useAuthContext } from "../../contexts";
import { logOut } from "../../services/firebase";
import { Button } from "../../components/common";
import "./Home.css";

/**
 * Home Page
 * Main dashboard after authentication
 */
export function Home() {
  const navigate = useNavigate();
  const { user, loading } = useAuthContext();

  const handleLogout = async () => {
    await logOut();
    navigate("/");
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
      <div className="home-container">
        <header className="home-header">
          <div className="home-logo">
            <h1>CivTracker</h1>
          </div>
          <div className="home-user">
            <span className="home-username">
              {user?.displayName || user?.email}
            </span>
            <Button onClick={handleLogout} variant="secondary">
              <LogOut size={18} style={{ marginRight: "0.5rem" }} />
              Esci
            </Button>
          </div>
        </header>

        <main className="home-content">
          <div className="home-wip">
            <div className="home-wip-icon">🚧</div>
            <h2 className="home-wip-title">In Sviluppo</h2>
            <p className="home-wip-text">
              Stiamo costruendo qualcosa di fantastico! Questa dashboard sarà
              presto pronta per aiutarti a tracciare il progresso della tua
              civiltà.
            </p>
            <div className="home-wip-features">
              <div className="home-feature">
                <BarChart className="home-feature-icon" size={24} />
                <span className="home-feature-text">Analitiche</span>
              </div>
              <div className="home-feature">
                <Map className="home-feature-icon" size={24} />
                <span className="home-feature-text">Tracciamento Mappa</span>
              </div>
              <div className="home-feature">
                <TrendingUp className="home-feature-icon" size={24} />
                <span className="home-feature-text">Report Progressi</span>
              </div>
              <div className="home-feature">
                <Users className="home-feature-icon" size={24} />
                <span className="home-feature-text">Gestione Team</span>
              </div>
            </div>
          </div>
        </main>

        <footer className="home-footer">
          <p>© 2026 CivTracker. Tutti i diritti riservati.</p>
        </footer>
      </div>
    </div>
  );
}
