# Sistema di Gestione Campagne - Documentazione

## Panoramica

Il sistema di gestione campagne consente agli utenti di creare gruppi collaborativi con codici univoci di 8 caratteri. Tutti i membri hanno pari diritti e le campagne vengono automaticamente eliminate quando l'ultimo membro esce.

## Funzionalità Implementate

### 1. Creazione Campagne

- **Codice Univoco**: Ogni campagna riceve un codice alfanumerico di 8 caratteri (es: `AB12CD34`)
- **Creatore**: L'utente che crea la campagna diventa automaticamente il primo membro
- **Salvataggio**: Le campagne sono salvate in Firebase Firestore con aggiornamenti real-time

### 2. Unirsi a Campagne

- **Input Codice**: Gli utenti possono unirsi inserendo un codice di 8 caratteri
- **Validazione**: Il sistema verifica che il codice sia valido e che la campagna esista
- **Aggiunta Automatica**: L'utente viene aggiunto alla lista dei membri

### 3. Info Campagna (Modal)

Il modal informazioni mostra:

- **Nome Campagna**: Modificabile da qualsiasi membro
- **Codice Condivisibile**: Con pulsante copia (effetto oro)
- **Conteggio Membri**: Numero totale di membri
- **Pulsante Esci**: Azione pericolosa con conferma doppia

### 4. Gestione Membri

- **Pari Diritti**: Tutti i membri possono modificare il nome della campagna
- **Lista Membri**: Visibile nella card campagna con avatar e username
- **Uscita dal Gruppo**: Ogni membro può uscire volontariamente

### 5. Auto-Eliminazione

- Quando l'ultimo membro esce, la campagna viene **automaticamente eliminata**
- Processo trasparente eseguito in background
- Nessun dato orfano nel database

## Struttura Dati Firebase

```javascript
{
  id: "unique-campaign-id",
  name: "Nome Campagna",
  code: "ABC12345", // 8 caratteri univoci
  createdBy: "user-id",
  createdAt: "2026-03-01T10:00:00.000Z",
  updatedAt: "2026-03-01T10:00:00.000Z",
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
  }
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
