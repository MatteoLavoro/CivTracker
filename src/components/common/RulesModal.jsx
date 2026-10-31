// Rules Modal - Game rules and scoring reference
import {
  Trophy,
  Shuffle,
  Swords,
  ClipboardList,
  Coins,
  Ban,
  Clock,
  ArrowRight,
  Medal,
  ShieldAlert,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Modal } from "./Modal";
import { BONUS_INFO, PENALTY_INFO } from "../../utils/scoreUtils";
import "./RulesModal.css";

const FLOW_STEPS = [
  {
    icon: ClipboardList,
    title: "Si crea la partita",
    text: "Dalla campagna in corso si aggiunge una nuova partita: partecipanti e punteggi iniziali vengono preparati automaticamente.",
  },
  {
    icon: Shuffle,
    title: "Draft dei leader",
    text: "Ogni giocatore riceve 5 leader e gli avversari ne bannano uno. Poi si sceglie tra i rimanenti. In alternativa si può usare la Scelta Diretta, in ordine di arrivo.",
  },
  {
    icon: Swords,
    title: "Si gioca",
    text: "Al termine si registrano turni, punteggi grezzi, esito, bonus e malus direttamente dal modale di modifica partita.",
  },
  {
    icon: Trophy,
    title: "Punteggi e classifica",
    text: "Il sistema calcola i punti elaborati e finali. La classifica somma i punti finali di tutte le partite completate.",
  },
];

export function RulesModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Regole del Gioco" wide>
      <div className="rules-content">
        {/* Hero */}
        <div className="rules-hero">
          <div className="rules-hero-icon">
            <Trophy size={30} />
          </div>
          <div className="rules-hero-text">
            <h3>Una lega, non solo partite</h3>
            <p>
              CivTracker tiene insieme draft, risultati e punteggi della
              campagna. Le regole qui sotto sono quelle applicate
              dall&apos;app.
            </p>
          </div>
        </div>

        {/* Flow */}
        <section className="rules-section">
          <h4 className="rules-section-title">
            <ArrowRight size={16} />
            Come funziona una partita
          </h4>
          <div className="rules-flow">
            {FLOW_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div className="rules-step" key={step.title}>
                  <div className="rules-step-top">
                    <span className="rules-step-number">{index + 1}</span>
                    <div className="rules-step-icon">
                      <Icon size={18} />
                    </div>
                  </div>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Scoring */}
        <section className="rules-section">
          <h4 className="rules-section-title">
            <Coins size={16} />
            Punteggi
          </h4>
          <div className="rules-score-card">
            <div className="rules-score-stats">
              <div className="rules-stat">
                <span className="rules-stat-value">200</span>
                <span className="rules-stat-label">
                  punti in palio per una vittoria normale
                </span>
              </div>
              <div className="rules-stat">
                <span className="rules-stat-value">50–150</span>
                <span className="rules-stat-label">
                  punti vittoria, in base alla rarità dell&apos;esito
                </span>
              </div>
              <div className="rules-stat">
                <span className="rules-stat-value">100</span>
                <span className="rules-stat-label">
                  punti in palio per forfait o sconfitta
                </span>
              </div>
            </div>
            <div className="rules-score-formula">
              <span>Punteggio finale</span>
              <code>elaborato × (1 + bonus − malus)</code>
            </div>
            <p className="rules-score-note">
              Il vincitore riceve i punti vittoria (50–150 in base a quanto è
              raro quell&apos;esito); i punti rimanenti vengono distribuiti in
              proporzione ai punteggi grezzi. I punti vittoria si aggiornano con
              lo storico, quindi una nuova partita può ricalcolare le
              precedenti.
            </p>
          </div>
        </section>

        {/* Bonuses and maluses */}
        <section className="rules-section">
          <div className="rules-modifiers">
            <div className="rules-modifier-panel rules-modifier-bonus">
              <div className="rules-modifier-header">
                <Medal size={18} />
                <h4>Bonus</h4>
                <span className="rules-modifier-badge">cumulabili</span>
              </div>
              <div className="rules-modifier-list">
                {BONUS_INFO.map((bonus) => (
                  <div className="rules-modifier-row" key={bonus.id}>
                    <span className="rules-modifier-value is-bonus">
                      +{bonus.percent}%
                    </span>
                    <div>
                      <strong>{bonus.name}</strong>
                      <p>{bonus.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rules-modifier-panel rules-modifier-malus">
              <div className="rules-modifier-header">
                <ShieldAlert size={18} />
                <h4>Malus</h4>
                <span className="rules-modifier-badge">cumulabili</span>
              </div>
              <div className="rules-modifier-list">
                {PENALTY_INFO.map((penalty) => (
                  <div className="rules-modifier-row" key={penalty.id}>
                    <span className="rules-modifier-value is-malus">
                      −{penalty.percent}%
                    </span>
                    <div>
                      <strong>{penalty.name}</strong>
                      <p>{penalty.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Rules */}
        <section className="rules-section">
          <h4 className="rules-section-title">
            <Ban size={16} />
            Regole della campagna
          </h4>
          <ul className="rules-list">
            <li>
              <CheckCircle2 size={15} className="rules-list-icon ok" />
              <span>
                <strong>Forfait:</strong> dichiarabile entro il limite
                concordato. Assegna al vincitore una vittoria ridotta a 50
                punti.
              </span>
            </li>
            <li>
              <CheckCircle2 size={15} className="rules-list-icon ok" />
              <span>
                <strong>Reroll mappa:</strong> concesso solo per spawn o eventi
                critici, si rigioca con gli stessi personaggi e comporta un
                malus del 10%.
              </span>
            </li>
            <li>
              <XCircle size={15} className="rules-list-icon no" />
              <span>
                <strong>Divieto:</strong> è vietato lo scambio di città tra
                giocatori.
              </span>
            </li>
            <li>
              <Clock size={15} className="rules-list-icon info" />
              <span>
                <strong>Studio:</strong> dopo il draft sono consigliati 15
                minuti per definire la strategia prima di iniziare.
              </span>
            </li>
          </ul>
        </section>

        <div className="rules-outro">
          <Trophy size={16} />
          <span>Buona partita e che vinca il migliore.</span>
        </div>
      </div>
    </Modal>
  );
}
