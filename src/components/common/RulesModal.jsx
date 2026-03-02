// Rules Modal Component - Game Rules
import { Shuffle, Trophy, Flag, Ban, Shield, Medal } from "lucide-react";
import { Modal } from "./Modal";
import "./RulesModal.css";

/**
 * RulesModal component
 * Displays comprehensive game rules with organized sections
 * @param {boolean} isOpen - Modal open state
 * @param {Function} onClose - Close handler
 */
export function RulesModal({ isOpen, onClose }) {
  const rules = [
    {
      id: "assignment",
      title: "Assegnazione Personaggi",
      icon: Shuffle,
      iconColor: "gold",
      sections: [
        {
          text: "Si estraggono cinque personaggi casuali e gli avversari ne scartano uno, lasciando al giocatore la scelta finale tra i due rimanenti.",
        },
        {
          text: "Segue una fase di studio di 15 minuti per definire una strategia mirata e approfondita.",
          highlight: true,
        },
      ],
    },
    {
      id: "scoring",
      title: "Punteggi",
      icon: Trophy,
      iconColor: "gold",
      sections: [
        {
          text: "Il sistema privilegia la vittoria sul punteggio, premiando maggiormente i trionfi più rari in base allo storico delle partite.",
          highlight: true,
        },
      ],
    },
    {
      id: "special-cases",
      title: "Casi Speciali",
      icon: Flag,
      iconColor: "orange",
      sections: [
        {
          text: "Forfait: Dichiarabile entro un limite prestabilito, assegna al vincitore un quarto dei punti standard.",
        },
        {
          text: "Eliminazione: In caso di eliminazione il punteggio assegnato è pari a 0.",
        },
        {
          text: "Reroll: Concesso solo per spawn o eventi critici, con penalità pari al forfait. Si rigioca con gli stessi personaggi.",
        },
      ],
    },
    {
      id: "prohibitions",
      title: "Divieti",
      icon: Ban,
      iconColor: "red",
      sections: [
        {
          text: "È vietato lo scambio di città tra giocatori.",
          highlight: true,
        },
      ],
    },
    {
      id: "survivor-bonus",
      title: "Bonus 'Sopravvissuto'",
      icon: Shield,
      iconColor: "gold",
      badge: "Anti-Teaming",
      sections: [
        {
          text: "Il vincitore ottiene +10% per ogni avversario che lo ha aggredito, se la guerra è rimasta attiva per massimo 30 turni.",
          highlight: true,
        },
      ],
    },
    {
      id: "second-place-bonus",
      title: "Bonus 'Secondo Posto'",
      icon: Medal,
      iconColor: "silver",
      badge: "Incentivo al 2° Posto",
      sections: [
        {
          text: "Il secondo classificato riceve un bonus del 15% sul punteggio finale.",
          highlight: true,
        },
      ],
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Regole del Gioco">
      <div className="rules-content">
        <div className="rules-intro">
          <p>
            Sistema di regole bilanciato per garantire un'esperienza di gioco
            equa, competitiva e strategica.
          </p>
        </div>

        <div className="rules-list">
          {rules.map((rule) => {
            const IconComponent = rule.icon;
            return (
              <div key={rule.id} className="rule-card">
                <div className="rule-header">
                  <div
                    className={`rule-icon-wrapper rule-icon-${rule.iconColor}`}
                  >
                    <IconComponent size={24} />
                  </div>
                  <div className="rule-title-wrapper">
                    <h3 className="rule-title">{rule.title}</h3>
                    {rule.badge && (
                      <span className="rule-badge">{rule.badge}</span>
                    )}
                  </div>
                </div>

                <div className="rule-body">
                  {rule.sections.map((section, idx) => (
                    <p
                      key={idx}
                      className={`rule-text ${section.highlight ? "rule-text-highlight" : ""}`}
                    >
                      {section.text}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="rules-outro">
          <p>
            Regole progettate per prevenire il teaming e favorire una
            competizione equilibrata. Buona partita!
          </p>
        </div>
      </div>
    </Modal>
  );
}
