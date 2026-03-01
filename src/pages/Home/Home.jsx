// Home Page - Work in Progress
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Map,
  TrendingUp,
  Users,
  LogOut,
  Trash2,
  Type,
} from "lucide-react";
import { useAuthContext } from "../../contexts";
import { logOut } from "../../services/firebase";
import { Button, Modal, TextInputModal } from "../../components/common";
import "./Home.css";

/**
 * Home Page
 * Main dashboard after authentication
 */
export function Home() {
  const navigate = useNavigate();
  const { user, loading } = useAuthContext();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [textInputModalOpen, setTextInputModalOpen] = useState(false);
  const [textAreaModalOpen, setTextAreaModalOpen] = useState(false);
  const [submittedText, setSubmittedText] = useState("");
  const [submittedNote, setSubmittedNote] = useState("");

  const handleLogout = async () => {
    await logOut();
    navigate("/");
  };

  const handleDelete = () => {
    console.log("Elemento eliminato!");
    setDeleteModalOpen(false);
    // Qui andrà la logica di eliminazione vera
  };

  const handleTextSubmit = (text) => {
    console.log("Testo inserito:", text);
    setSubmittedText(text);
    // Qui andrà la logica di salvataggio del testo
  };

  const handleNoteSubmit = (note) => {
    console.log("Nota inserita:", note);
    setSubmittedNote(note);
    // Qui andrà la logica di salvataggio della nota
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

            {/* Test Modals */}
            <div
              style={{
                marginTop: "2rem",
                maxWidth: "300px",
                margin: "2rem auto 0",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <Button
                onClick={() => setTextInputModalOpen(true)}
                variant="primary"
                fullWidth
              >
                <Type size={18} style={{ marginRight: "0.5rem" }} />
                Modale Input Testo
              </Button>
              <Button
                onClick={() => setTextAreaModalOpen(true)}
                variant="primary"
                fullWidth
              >
                <Type size={18} style={{ marginRight: "0.5rem" }} />
                Modale Textarea
              </Button>
              <Button
                onClick={() => setDeleteModalOpen(true)}
                variant="secondary"
                fullWidth
              >
                <Trash2 size={18} style={{ marginRight: "0.5rem" }} />
                Azione Pericolosa
              </Button>
              {(submittedText || submittedNote) && (
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "rgba(255, 255, 255, 0.7)",
                    textAlign: "center",
                    marginTop: "0.5rem",
                    lineHeight: "1.6",
                  }}
                >
                  {submittedText && (
                    <p style={{ margin: "0.25rem 0" }}>
                      Nome: <strong>"{submittedText}"</strong>
                    </p>
                  )}
                  {submittedNote && (
                    <p style={{ margin: "0.25rem 0" }}>
                      Nota: <strong>"{submittedNote}"</strong>
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="home-wip-features" style={{ marginTop: "2rem" }}>
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

      {/* Delete Modal - Dangerous Action */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Elimina Elemento"
        footer={{
          onConfirm: handleDelete,
          dangerous: true,
          dangerousMessage:
            "Sei sicuro di voler eliminare questo elemento? I dati saranno persi per sempre.",
          label: "Elimina",
          icon: <Trash2 size={24} />,
        }}
      >
        <div>
          <p style={{ marginBottom: "1rem" }}>
            Stai per eliminare un elemento importante dal sistema.
          </p>
          <p style={{ marginBottom: "1rem", color: "rgba(255, 215, 0, 0.8)" }}>
            ⚠️ Questa azione è <strong>irreversibile</strong>.
          </p>
          <p
            style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)" }}
          >
            Poiché questa è un'azione pericolosa, ti verrà chiesta una conferma
            aggiuntiva.
          </p>
        </div>
      </Modal>

      {/* Text Input Modal */}
      <TextInputModal
        isOpen={textInputModalOpen}
        onClose={() => setTextInputModalOpen(false)}
        onConfirm={handleTextSubmit}
        title="Inserisci Nome"
        label="Nome Elemento"
        placeholder="Es: Nuovo progetto, Task importante..."
        maxLength={50}
        minLength={3}
      />

      {/* Text Area Modal */}
      <TextInputModal
        isOpen={textAreaModalOpen}
        onClose={() => setTextAreaModalOpen(false)}
        onConfirm={handleNoteSubmit}
        title="Aggiungi Nota"
        label="Descrizione Dettagliata"
        placeholder="Scrivi qui la tua nota o descrizione..."
        maxLength={200}
        multiline
      />
    </div>
  );
}
