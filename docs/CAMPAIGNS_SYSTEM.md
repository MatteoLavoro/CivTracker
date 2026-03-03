# Sistema di Gestione Campagne - Documentazione

## Panoramica

Il sistema di gestione campagne consente agli utenti di creare gruppi collaborativi con codici univoci di 8 caratteri. Tutti i membri hanno pari diritti e le campagne vengono automaticamente eliminate quando l'ultimo membro esce.

## Funzionalità Implementate

### 1. Creazione Campagne

- **Codice Univoco**: Ogni campagna riceve un codice alfanumerico di 8 caratteri (es: `AB12CD34`)
- **Creatore**: L'utente che crea la campagna diventa automaticamente il primo membro
- **Salvataggio**: Le campagne sono salvate in Firebase Firestore con aggiornamenti real-time
- **Stato Iniziale**: Le nuove campagne iniziano con stato `not-started`

### 2. Unirsi a Campagne

- **Input Codice**: Gli utenti possono unirsi inserendo un codice di 8 caratteri
- **Validazione**: Il sistema verifica che il codice sia valido e che la campagna esista
- **Aggiunta Automatica**: L'utente viene aggiunto alla lista dei membri
- **Restrizioni**: Non è possibile unirsi a campagne già in corso (status `in-progress`)

### 3. Stati Campagna e Sistema di Voto

Ogni campagna ha uno stato che ne determina il comportamento:

- **not-started**: Campagna creata ma non ancora iniziata
  - I giocatori possono unirsi liberamente
  - Non si possono creare partite
- **in-progress**: Campagna in corso
  - Nessuno può unirsi
  - Si possono creare e giocare partite
  - Il draft è attivo
- **completed**: Campagna terminata
  - Non si possono creare nuove partite
  - Lo stato non può più essere cambiato

**Sistema di Voto per Cambio Stato:**

- Ogni membro può votare per cambiare lo stato della campagna
- Quando **tutti** i membri hanno votato per lo stesso stato, il cambio avviene automaticamente
- I voti possono essere revocati prima che il cambio avvenga
- I voti vengono azzerati dopo ogni cambio di stato
- Accesso tramite menu kebab → "Stato Campagna"

### 4. Campagne Importanti (Starred)

- **Icona Stella**: Click sulla stella nella card per segnare/togliere come importante
- **Ordinamento Prioritario**: Le campagne importanti appaiono sempre per prime nella griglia
- **Indicatore Visivo**: La stella diventa dorata quando attiva
- **Persistenza**: Lo stato viene salvato nel database

### 5. Info Campagna (Modal)

Il modal informazioni mostra:

- **Nome Campagna**: Modificabile da qualsiasi membro
- **Codice Condivisibile**: Con pulsante copia (effetto oro)
- **Conteggio Membri**: Numero totale di membri
- **Pulsante Esci**: Azione pericolosa con conferma doppia

### 6. Gestione Membri

- **Pari Diritti**: Tutti i membri possono modificare il nome della campagna
- **Lista Membri**: Visibile nella card campagna con avatar e username
- **Classifiche**: Ordinamento automatico per punteggio totale
- **Uscita dal Gruppo**: Ogni membro può uscire volontariamente

### 7. Auto-Eliminazione

- Quando l'ultimo membro esce, la campagna viene **automaticamente eliminata**
- Processo trasparente eseguito in background
- Nessun dato orfano nel database

### 8. Sistema Gestione Partite

Ogni campagna può contenere multiple partite sequenziali:

**Creazione Partite:**

- Solo quando la campagna è `in-progress`
- Solo se non c'è già una partita attiva
- Click su "Aggiungi Partita" crea una nuova partita
- Ogni partita ha un ID univoco e timestamp

**Stati Partita:**

- `in-progress`: Partita attiva, in corso
- `completed`: Partita terminata con risultati salvati

**Dettagli Partita:**

- Numero turni giocati
- Leader selezionati per ogni giocatore (tramite draft)
- Punteggi grezzi di ogni partecipante
- Bonus tags assegnati
- Vincitore e tipo di vittoria
- Punteggi elaborati e finali

**Completamento Partita:**

- Modal dedicato con interfaccia completa
- Input turni, punteggi, vincitore, tipo vittoria
- Sistema bonus con assegnazione manuale
- Salvataggio in due fasi:
  1. Dati base (immediato)
  2. Calcolo punteggi (background)
- Ricalcolo automatico di tutte le partite precedenti

### 9. Sistema Bonus Tags

I bonus sono moltiplicatori percentuali che si applicano ai punteggi elaborati:

**Bonus Disponibili:**

- **Secondo Posto** (+15%): Assegnato automaticamente/manualmente al secondo classificato
- **Sopravvissuto** (+10%): Assegnato a chi vince mentre in guerra con un giocatore da <30 turni
  - Può essere assegnato multiplo (uno per ogni guerra attiva)

**Calcolo:**

```
Punteggio Finale = Punteggio Elaborato × (1 + Σ bonus)
```

Esempio: Con 1× Secondo Posto e 2× Sopravvissuto:

```
Multiplicatore = 1.0 + 0.15 + 0.10 + 0.10 = 1.35 (+35%)
```

**Assegnazione:**

- Manuale tramite modal completamento partita
- Click su "Assegna Bonus" per ogni giocatore
- Rimozione individuale dei bonus assegnati
- Visualizzazione nel modale "Altri bonus" se superano 2 tag

### 10. Sistema Punteggi Avanzato

**Pool di Punti Dinamico:**

- Vittorie normali: 200 punti totali
- Forfait: 100 punti totali
- Defeat (tutti vs bot): 100 punti totali
- Canceled: 0 punti

**Calcolo Victory Points (50-150):**

Formula logaritmica basata su frequenza tipo vittoria:

```
Points = MAX(50, MIN(150, 100 - 50 × SIGN(d) × LN(1 + ABS(d)) / LN(6)))
```

Dove `d` = conteggio vittoria - media

- Vittorie rare → più punti (fino a 150)
- Vittorie comuni → meno punti (fino a 50)
- Vittorie bilanciate → 100 punti

**Distribuzione Punti Rimanenti:**

```
processedScore = (rawScore / totalRawScore) × remainingPoints
winnerProcessedScore = victoryPoints + processedScore
```

**Ricalcolo Automatico:**

Dopo ogni partita completata, tutte le partite precedenti vengono ricalcolate con i nuovi victory counts, garantendo equità dinamica.

### 11. Visualizzazioni e Statistiche

**Card Campagna (Home):**

- Nome campagna
- Icone stella (importante) e info
- Classifica giocatori con trofeo per il primo
- Contatore partite completate

**Pagina Campaign:**

- Header con titolo, back button, menu kebab
- Lista partite (cronologica, più vecchia prima)
- Bottone aggiungi partita
- Real-time updates

**Menu Kebab (6 voci):**

1. **Classifica Generale**: Modale con ranking completo e dettaglio punteggi per partita
2. **Pool Personaggi**: Modale con leader disponibili per ogni giocatore
3. **Punteggi Vittorie**: Modale con tabella victory points dinamica
4. **Regole del Gioco**: Modale informativo con regole complete
5. **Stato Campagna**: Modale voto per cambiare stato
6. **Info Campagna**: Modale dettagli campagna

## Struttura Dati Firebase

```javascript
{
  id: "unique-campaign-id",
  name: "Nome Campagna",
  code: "ABC12345", // 8 caratteri univoci
  createdBy: "user-id",
  createdAt: "2026-03-01T10:00:00.000Z",
  updatedAt: "2026-03-01T10:00:00.000Z",

  // Stato e voti
  status: "in-progress", // "not-started" | "in-progress" | "completed"
  statusVotes: {
    "in-progress": {
      voters: ["user-id-1", "user-id-2"]
    }
  },

  // Preferenze
  isImportant: true, // Stella dorata per campagne preferite

  // Membri
  members: ["user-id-1", "user-id-2"], // Array di user IDs
  memberDetails: {
    "user-id-1": {
      username: "Mario",
      joinedAt: "2026-03-01T10:00:00.000Z"
    },
    "user-id-2": {
      username: "Luigi",
      joinedAt: "2026-03-01T10:15:00.000Z"
    }
  },

  // Sistema Draft
  draft: {
    phase: "completed", // "waiting" | "countdown" | "active" | "completed"
    readyPlayers: ["user-id-1"],
    countdownStartAt: "2026-03-01T10:30:00.000Z",
    playerDrafts: {
      "user-id-1": ["leader-id-1", "leader-id-2", "leader-id-3", "leader-id-4", "leader-id-5"]
    },
    playerStates: {
      "user-id-1": {
        hasCompletedBans: true
      }
    },
    banVotes: {
      "user-id-1": {
        "user-id-2": "leader-id-to-ban"
      }
    },
    bannedLeaders: {
      "user-id-1": "leader-id-banned",
      "user-id-2": "leader-id-banned"
    },
    selectedLeaders: {
      "user-id-1": "final-leader-id",
      "user-id-2": "final-leader-id"
    }
  },

  // Partite
  matches: [
    {
      id: "match-1234567890",
      status: "completed", // "in-progress" | "completed"
      startDate: "2026-03-01T11:00:00.000Z",
      endDate: "2026-03-01T15:30:00.000Z",
      turns: 300,
      createdAt: "2026-03-01T10:45:00.000Z",

      // Draft history per questa partita
      draftCompleted: true,
      draftHistory: {
        "user-id-1": {
          draftedLeaders: ["leader-1", "leader-2", "leader-3", "leader-4", "leader-5"],
          bannedLeader: "leader-6",
          selectedLeader: "leader-1"
        }
      },

      // Partecipanti con punteggi
      participants: {
        "user-id-1": {
          username: "Mario",
          leaderId: "abraham-lincoln",
          score: 450, // Punteggio grezzo
          processedScore: 120, // Punteggio elaborato (con victory points)
          finalScore: 138, // Punteggio finale (con bonus)
          bonusTags: ["second-place"] // Bonus applicati
        },
        "user-id-2": {
          username: "Luigi",
          leaderId: "cleopatra",
          score: 520,
          processedScore: 80,
          finalScore: 96,
          bonusTags: ["survivor", "survivor"] // Multipli consentiti
        }
      },

      // Risultato partita
      winnerId: "user-id-2",
      victoryType: "science" // "science" | "culture" | "diplomatic" | "domination" | "religious" | "score" | "forfait" | "defeat" | "canceled"
    }
  ]
}
```

## Regole di Sicurezza Firebase

Le regole garantiscono:

- ✅ Solo i membri possono leggere una campagna
- ✅ Solo utenti autenticati possono creare campagne
- ✅ Solo i membri possono aggiornare nome o aggiungere membri
- ✅ I membri possono rimuovere solo se stessi
- ✅ Solo l'ultimo membro può eliminare la campagna

## UI/UX Design

### Tasto Aggiungi Campagna (Diviso)

- **Unisciti (75%)**: Blu, icona UserPlus, bordi tratteggiati
- **Crea (25%)**: Oro, icona Plus, accento dorato

### Card Campagna (Verticale 2:1)

1. **Header**: Titolo + Info button (cerchietto)
2. **Centro**: Lista membri scrollabile con avatar
3. **Footer**: Sezione statistiche (vuota per future implementazioni)

### Colori

- **Blu Primario**: `rgba(15, 50, 82, 1)` - Azioni principali
- **Oro**: `rgba(212, 175, 55, 1)` - Accenti e codici
- **Gradients**: Sfumature per profondità visiva

## File Modificati/Creati

### Nuovi File

- `src/utils/campaignUtils.js` - Utility per codici
- `src/components/common/CampaignInfoModal.jsx` - Modal info
- `src/components/common/CampaignInfoModal.css` - Stili modal
- `src/services/firebase/campaigns.js` - Servizi campagne
- `firestore.rules` - Regole sicurezza
- `firestore.indexes.json` - Indici database
- `FIREBASE_DEPLOYMENT.md` - Guida deployment

### File Modificati

- `src/pages/Home/Home.jsx` - Integrazione sistema campagne
- `src/pages/Home/Home.css` - Stili card e layout
- `src/components/common/index.js` - Export CampaignInfoModal
- `src/services/firebase/config.js` - Inizializzazione Firestore
- `src/services/firebase/index.js` - Export funzioni campagne
- `firebase.json` - Configurazione Firestore

## Funzioni Chiave

### campaignUtils.js

```javascript
generateCampaignCode(); // Genera codice univoco 8 caratteri
isValidCampaignCode(code); // Valida formato codice
formatCampaignCode(code); // Formatta per display (XX XX XX XX)
```

### campaigns.js (Firebase)

```javascript
createCampaign(name, userId, username);
getCampaignByCode(code);
joinCampaign(code, userId, username);
leaveCampaign(campaignId, userId);
updateCampaignName(campaignId, newName);
getUserCampaigns(userId);
```

## Real-Time Updates

Il sistema utilizza `useCollection` hook per:

- Aggiornamenti automatici quando una campagna cambia
- Sincronizzazione tra tutti i dispositivi dei membri
- Notifica immediata di nuovi membri o modifiche

## Workflow Utente

### Creare una Campagna

1. Click su bottone "Crea" (sezione oro)
2. Inserire nome campagna (3-50 caratteri)
3. Campagna creata con codice univoco
4. Apparizione immediata nella griglia

### Unirsi a una Campagna

1. Click su "Unisciti a Campagna" (sezione blu)
2. Inserire codice 8 caratteri
3. Validazione e unione automatica
4. Apparizione campagna nella griglia

### Gestire una Campagna

1. Click su icona Info nella card
2. Modal con tutte le informazioni
3. Possibilità di:
   - Modificare il nome
   - Copiare il codice
   - Uscire dal gruppo

### Uscire da una Campagna

1. Click su "Esci dal Gruppo" nel modal info
2. Conferma azione pericolosa
3. Rimozione automatica dalla campagna
4. Se ultimo membro: eliminazione automatica

## Prossimi Sviluppi

La struttura è pronta per:

- 📊 Statistiche nel footer della card
- 🎯 Click su card per dettagli completi
- 👥 Gestione ruoli membri (admin, moderator)
- 📝 Note e descrizioni campagne
- 🔔 Notifiche in-app per eventi campagna
- 📈 Analytics e progressi di gruppo

## Note Tecniche

- **Performance**: Uso di indici Firestore per query veloci
- **Sicurezza**: Regole granulari per protezione dati
- **Scalabilità**: Struttura ready per migliaia di campagne
- **Manutenibilità**: Codice modulare e ben documentato
- **Accessibilità**: ARIA labels e focus management
