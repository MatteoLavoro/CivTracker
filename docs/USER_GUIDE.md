# 📱 Guida Utente CivTracker

Guida completa per utilizzare CivTracker.

## Indice

- [Cos'è CivTracker](#cosè-civtracker)
- [Iniziare](#iniziare)
- [Autenticazione](#autenticazione)
- [Dashboard Home](#dashboard-home)
- [Gestione Campagne](#gestione-campagne)
- [Profilo Utente](#profilo-utente)
- [PWA - Installazione App](#pwa---installazione-app)
- [FAQ](#faq)
- [Risoluzione Problemi](#risoluzione-problemi)

---

## Cos'è CivTracker

**CivTracker** è un'applicazione web per la gestione collaborativa di campagne. Permette di:

- ✅ Creare gruppi (campagne) con un nome personalizzato
- ✅ Invitare amici tramite codici condivisibili
- ✅ Gestire membri e classifiche
- ✅ Collaborare in tempo reale
- ✅ Installare l'app sul tuo dispositivo (PWA)

---

## Iniziare

### Accesso all'App

**Web:** Visita [https://tuodominio.com](https://tuodominio.com)

**Mobile:**

- Apri dal browser (Chrome/Safari)
- Installa come app (vedi [Installazione PWA](#pwa---installazione-app))

### Requisiti

- **Browser moderni**: Chrome 90+, Firefox 88+, Safari 14+
- **Connessione internet** (per sync dati)
- **Email valida** per registrazione

---

## Autenticazione

### Registrazione

1. **Apri l'app** → Vedi pagina di login
2. **Clicca "Registrati"** (link sotto il form)
3. **Compila il form**:
   - **Email**: La tua email
   - **Nome utente**: Come vuoi essere chiamato (max 30 caratteri)
   - **Password**: Minimo 6 caratteri

4. **Clicca "Registrati"**

✅ **Fatto!** Verrai automaticamente portato alla Dashboard.

#### Errori Comuni Registrazione

| Errore                  | Soluzione                                                  |
| ----------------------- | ---------------------------------------------------------- |
| "Email già in uso"      | Questa email è già registrata. Usa login o un'altra email. |
| "Email non valida"      | Controlla formato email (deve contenere @)                 |
| "Password troppo corta" | Usa almeno 6 caratteri                                     |

### Login

1. **Apri l'app** → Vedi pagina di login
2. **Compila**:
   - Email
   - Password
3. **Clicca "Accedi"**

✅ Verrai portato alla Dashboard.

#### Errori Comuni Login

| Errore                    | Soluzione                                         |
| ------------------------- | ------------------------------------------------- |
| "Email o password errati" | Verifica credenziali o registrati se nuovo utente |
| "Email non verificata"    | Alcune configurazioni richiedono verifica email   |

### Password Dimenticata

⚠️ **Funzione in arrivo**

Per ora contatta l'amministratore per reset password.

---

## Dashboard Home

La **Dashboard** è la tua schermata principale dopo il login.

### Elementi Dashboard

```
┌─────────────────────────────┐
│  CivTracker        👤       │  ← Header (Logo + Avatar)
├─────────────────────────────┤
│                             │
│  📊 Le Tue Campagne         │
│                             │
│  ┌─────────┐ ┌─────────┐  │
│  │Campaign │ │Campaign │  │  ← Card Campagne
│  │  Card   │ │  Card   │  │
│  └─────────┘ └─────────┘  │
│                             │
│  ┌──────────────────────┐  │
│  │ 👥 Unisciti [75%]    │  │  ← Bottone Unisciti
│  │ ➕ Crea [25%]        │  │  ← Bottone Crea
│  └──────────────────────┘  │
│                             │
└─────────────────────────────┘
```

### Header

**Logo "CivTracker"** - Sinistra  
**Avatar Utente** - Destra (clicca per aprire profilo)

### Card Campagne

Ogni campagna è visualizzata come una **card verticale** che mostra:

**Header:**

- Nome campagna (es: "Campagna Italia")
- Button Info (ⓘ) per dettagli

**Centro - Classifica:**

- Lista membri ordinati alfabeticamente
- Primo posto ha icona trofeo 🏆
- Avatar con iniziali nome
- Posizione numerata (2, 3, 4...)

**Footer:**

- Statistiche (placeholder per future features)

**Clicca sulla card** per entrare nella campagna.

---

## Gestione Campagne

### Creare una Campagna

1. **Dashboard** → Clicca sul bottone **"Nuova Campagna"** (icona ➕, area destra gialla)
2. **Si apre modal** "Nuova Campagna"
3. **Inserisci nome**:
   - Es: "Campagna Italia", "Gruppo Nord", etc.
   - Min 3 caratteri, max 50
4. **Clicca "Crea"**

✅ **Campagna creata!** La vedi subito nella dashboard.

⚠️ **Nota:** Riceverai un **codice univoco di 8 caratteri** per invitare altri membri.

### Unirsi a una Campagna

1. **Dashboard** → Clicca sul bottone **"Unisciti ad una Campagna"** (icona 👥, area sinistra blu)
2. **Si apre modal** "Unisciti a Campagna"
3. **Inserisci codice**:
   - Ricevi il codice da un membro esistente
   - Formato: 8 caratteri (es: AB12CD34)
   - Maiuscole/minuscole non importano
4. **Clicca "Unisciti"**

✅ **Entrato nel gruppo!** La campagna appare nella tua dashboard.

#### Errori Unione Campagna

| Errore                 | Soluzione                                    |
| ---------------------- | -------------------------------------------- |
| "Campagna non trovata" | Codice errato, verifica con chi te l'ha dato |
| "Sei già membro"       | Sei già nella campagna                       |
| "Codice non valido"    | Deve essere 8 caratteri alfanumerici         |

### Visualizzare Dettagli Campagna

**Dalla Dashboard:**

1. **Clicca sulla card** della campagna

**Dalla Pagina Campagna:**

1. **Clicca icona Info (ⓘ)** in alto a destra

**Modal Info mostra:**

- **Nome campagna** (modificabile)
- **Codice condivisibile** con pulsante "Copia"
- **Numero membri**
- **Bottone "Esci"** (rosso, in basso)

### Modificare Nome Campagna

⭐ **Tutti i membri** possono modificare il nome (democrazia!)

1. **Apri Info campagna** (icona ⓘ)
2. **Clicca sul nome** della campagna
3. **Modifica nome** nel campo di input
4. **Clicca "Salva"** (o pulsante di conferma)

✅ **Nome aggiornato!** Tutti i membri vedono il cambio in tempo reale.

### Condividere Codice Campagna

Per invitare nuovi membri:

1. **Apri Info campagna** (icona ⓘ)
2. **Vedi codice** (es: AB12CD34)
3. **Clicca icona "Copia"** (📋) accanto al codice
4. **Incolla e invia** il codice all'amico (WhatsApp, email, etc.)

✅ L'amico può ora unirsi inserendo il codice!

### Uscire da una Campagna

⚠️ **Attenzione:** Uscire è un'azione permanente.

1. **Apri Info campagna** (icona ⓘ)
2. **Scorri in basso**
3. **Clicca "Esci dalla Campagna"** (bottone rosso)
4. **Conferma** nel modal di conferma

✅ **Uscito!** La campagna scompare dalla tua dashboard.

⚠️ **Nota:** Se sei l'ultimo membro, la campagna viene **eliminata definitivamente**.

### Pagina Campagna

Cliccando su una card campagna entri nella **pagina dedicata**:

**Header:**

- **← Freccia indietro** (torna alla dashboard)
- **Nome campagna**
- **⋮ Menu kebab** (opzioni avanzate)

**Contenuto:**

- **Lista partite** (cronologica)
- **Bottone "Aggiungi Partita"**
- **Aggiornamenti real-time**

### Segnare Campagne Importanti (Stella)

Puoi marcare le campagne preferite con una ⭐ stella:

1. **Nella card campagna** (dashboard)
2. **Clicca sull'icona stella** (in alto a destra nella card)
3. **La stella diventa dorata** ⭐

✅ **Campagne importanti appaiono sempre per prime** nella griglia!

**Rimuovere stella:** Click nuovamente sull'icona stella.

---

## Stati Campagna e Sistema di Voto

Ogni campagna ha uno **stato** che determina cosa puoi fare:

### Stati Disponibili

**🔵 Not Started** (Non Iniziata)

- Stato iniziale dopo creazione
- I giocatori possono unirsi liberamente
- Non si possono creare partite

**🟢 In Progress** (In Corso)

- Campagna attiva
- Nessuno può più unirsi
- Si possono creare e giocare partite
- Il draft è attivo

**🔴 Completed** (Completata)

- Campagna terminata
- Non si possono creare nuove partite
- Lo stato non può più essere cambiato

### Cambiare Stato (Sistema Voto)

⚠️ **Tutti i membri devono votare** per cambiare stato!

1. **Pagina campagna** → **Menu kebab (⋮)** → **"Stato Campagna"**
2. **Si apre modal** con stato attuale e opzioni
3. **Clicca sul bottone** dello stato desiderato
4. **Il tuo voto è registrato**
5. **Quando TUTTI votano per lo stesso stato** → cambio automatico!

**Revocare voto:**

- Clicca nuovamente sul bottone dello stato per cui hai votato
- Oppure vota per un altro stato (revoca automatica)

**Indicatore voti:**

- Mostra quanti hanno votato (es: "2/4 voti per In Progress")

**Esempio:**

```
Campagna con 4 membri:
- Mario vota "In Progress" → 1/4
- Luigi vota "In Progress" → 2/4
- Peach vota "In Progress" → 3/4
- Bowser vota "In Progress" → 4/4 ✅ CAMBIO STATO!
```

---

## Gestione Partite

### Creare una Partita

⚠️ **Prerequisiti:**

- Campagna deve essere **In Progress**
- Non ci devono essere partite attive

**Steps:**

1. **Pagina campagna**
2. **Scroll in basso** nella lista partite
3. **Clicca "Aggiungi Partita"** (+ button)

✅ **Nuova partita creata!** Appare nella lista come ultima partita.

### Stati Partita

**🟡 In Progress** (In Corso)

- Partita attiva
- Si può avviare il draft
- Non si può creare altra partita

**🟢 Completed** (Completata)

- Partita terminata con risultati salvati
- Punteggi calcolati
- Si può creare nuova partita

### Sistema Draft Leader

Il **draft** assegna leader casuali ai giocatori prima della partita.

#### Fasi Draft

**1. Waiting (Attesa)**

- Ogni giocatore clicca "Pronto" nel modal draft
- Quando **tutti** sono pronti → Countdown

**2. Countdown (5 secondi)**

- Conto alla rovescia prima dell'estrazione
- Puoi annullare cliccando "Annulla"

**3. Active (Banning)**

- Ogni giocatore riceve **5 leader random**
- Esclusi i leader già usati in campagne precedenti
- **Banning Phase:** Vota 1 leader da bannare per ogni avversario
- Il leader più votato viene rimosso dalla pool dell'avversario

**4. Completed (Selezione)**

- Scegli il tuo leader finale tra quelli rimasti
- Click leader → Conferma → Fatto!

#### Avviare Draft

1. **Partita in corso** → Click **"Avvia Draft"** nella card partita
2. **Si apre DraftModal**
3. **Click "Pronto"**
4. **Aspetta altri giocatori**
5. **Countdown automatico**
6. **Vota ban per ogni avversario**
7. **Scegli leader finale**

✅ **Draft completato!** Il tuo leader è assegnato alla partita.

**Note:**

- Solo player: Skip automatico fase banning
- Leader pool personalizzata per evitare ripetizioni

### Completare una Partita

Quando finisci una partita nel gioco:

1. **Card partita** → Click **"Completa Partita"**
2. **Si apre modal complesso** con tutti i campi

**Dati da Inserire:**

**A) Turni Giocati**

- Es: 320 turni

**B) Vincitore**

- Click su giocatore vincitore
- Oppure "Nessuno" se tutti sconfitti/annullata

**C) Tipo Vittoria**

- Scientifica 🔬
- Culturale 🎭
- Diplomatica 🤝
- Dominio ⚔️
- Religiosa ✝️
- Per Punti 📊
- Forfait (resa)
- Sconfitta (tutti vs bot)
- Annullata

**D) Punteggi Grezzi**

- Per ogni giocatore, inserisci punteggio finale del gioco
- Es: Mario 450, Luigi 520

**E) Bonus Tags (Opzionale)**

- **Secondo Posto** (+15%): Assegnato al secondo classificato
- **Sopravvissuto** (+10%): In guerra con giocatore <30 turni
- Click "Assegna Bonus" per ogni giocatore
- Seleziona bonus applicabili

**F) Conferma**

- Click **"Completa Partita"**

✅ **Partita completata!**

- Punteggi calcolati automaticamente
- Tutte le partite precedenti ricalcolate con nuovi victory points
- Classifiche aggiornate

### Sistema Punteggi

Il sistema calcola 3 tipi di punteggi:

**1. Punteggio Grezzo (Raw Score)**

- Il punteggio finale nel gioco (es: 450)

**2. Punteggio Elaborato (Processed Score)**

- Calcolato con pool di punti dinamico:
  - Vittorie normali: 200 pt totali
  - Forfait: 100 pt totali
  - Defeat/Canceled: 100/0 pt totali
- **Victory Points** per il vincitore (50-150 pt dinamici)
  - Vittorie rare → più punti
  - Vittorie comuni → meno punti
- Punti rimanenti distribuiti proporzionalmente ai punteggi grezzi

**3. Punteggio Finale (Final Score)**

- Punteggio elaborato × (1 + bonus)
- Es: 120 × 1.15 (secondo posto) = 138 pt

**Bonus:**

- Secondo Posto: +15%
- Sopravvissuto: +10% (multiplo)
- I bonus si sommano

---

## Menu Kebab e Opzioni Avanzate

Nella **pagina campagna**, click **⋮ menu kebab** in alto a destra:

### Opzioni Disponibili

**📊 Classifica Generale**

- Mostra ranking completo
- Avatar, username, posizione
- Punteggi per ogni partita
- Totale punti accumulati

**👥 Pool Personaggi**

- Visualizza leader disponibili per ogni giocatore
- Tabs per ogni membro
- Indica leader già usati
- Contatore disponibili

**🏆 Punteggi Vittorie**

- Tabella victory points dinamica
- Mostra punti per ogni tipo vittoria
- Formula e spiegazione
- Contatori vittorie

**📜 Regole del Gioco**

- Guida completa passo-passo
- Sistema draft spiegato
- Sistema punteggi spiegato
- Esempi pratici

**📊 Stato Campagna**

- Vota per cambiare stato
- Vedi voti attuali
- Revoca voto

**ℹ️ Info Campagna**

- Dettagli completi
- Modifica nome
- Copia codice
- Esci dal gruppo

---

## Classifiche e Ranking

### Classifica card (Dashboard)

Le card campagne mostrano:

- **Trofeo 🏆** per il primo classificato (se ci sono partite completate)
- **Posizioni numerate** (2, 3, 4...) per gli altri
- **Ordinamento alfabetico** se nessuna partita completata

### Classifica Generale (Modal)

Accesso: **Menu kebab → Classifica Generale**

**Mostra:**

1. **Badge posizione:**
   - 🏆 Primo: Trofeo oro
   - 🥈 Secondo: Badge argento "2°"
   - 🥉 Terzo: Badge bronzo "3°"
   - Numeri per gli altri

2. **Dettaglio giocatore:**
   - Avatar con iniziali
   - Username
   - Punteggi per ogni partita
   - Totale punti

3. **Ordinamento:**
   - Dal più alto al più basso punteggio

---

## Profilo Utente

### Aprire Profilo

**Dashboard** → Clicca sull'**avatar** in alto a destra

### Modal Profilo

**Mostra:**

- Avatar con iniziali
- Email (non modificabile)
- Nome utente (modificabile)

**Azioni:**

- **Modifica nome utente**
- **Logout**

### Modificare Nome Utente

1. **Apri profilo** (clicca avatar)
2. **Clicca sul nome** utente
3. **Modifica** (max 30 caratteri)
4. **Salva**

✅ Il nuovo nome appare in tutte le campagne dove sei membro!

### Logout

1. **Apri profilo**
2. **Clicca "Esci"** in basso

✅ Verrai riportato alla pagina di login.

---

## PWA - Installazione App

CivTracker è una **Progressive Web App** - puoi installarla come un'app nativa!

### Vantaggi Installazione

- ✅ **Icona home screen** come app normale
- ✅ **Apre full-screen** (senza barra browser)
- ✅ **Più veloce** (risorse cachate)
- ✅ **Funziona offline** (per risorse già caricate)
- ✅ **Notifiche** (future)

### Installazione Android (Chrome)

1. **Apri CivTracker** su Chrome mobile
2. **Appare popup** "Installa App" (al primo accesso)
3. **Clicca "Installa App"**

✅ **Installata!** L'icona appare nella home screen.

**Alternativa manuale:**

1. Chrome menu (⋮) → "Installa app" o "Aggiungi a schermata Home"

### Installazione iOS (Safari)

1. **Apri CivTracker** su Safari mobile
2. **Appare popup** con istruzioni (al primo accesso)
3. **Segui le istruzioni**:
   - Tap icona **Condivisione** (quadrato con freccia su)
   - Scroll e tap **"Aggiungi a schermata Home"**
   - Tap **"Aggiungi"**

✅ **Installata!** L'icona appare nella home screen.

### Installazione Desktop

**Chrome/Edge Desktop:**

1. Visita CivTracker
2. **Icona installazione** appare nella barra indirizzi (➕ o installazione)
3. Clicca e conferma

✅ L'app si apre in una finestra separata!

### Disinstallazione

**Mobile:**

- Tieni premuto l'icona → "Disinstalla" o "Rimuovi"

**Desktop:**

- App aperta → Menu (⋮) → "Disinstalla CivTracker"

---

## FAQ

### Domande Generali

**Q: CivTracker è gratis?**  
A: Sì, completamente gratuito.

**Q: Devo scaricare qualcosa?**  
A: No, funziona nel browser. Puoi installarla come PWA (opzionale).

**Q: Funziona offline?**  
A: Parzialmente. Le risorse sono cachate, ma serve internet per sincronizzare dati.

**Q: Quante campagne posso creare?**  
A: Nessun limite!

**Q: Quanti membri per campagna?**  
A: Nessun limite tecnico.

### Campagne

**Q: Posso recuperare una campagna eliminata?**  
A: No, l'eliminazione è definitiva.

**Q: Il codice campagna scade?**  
A: No, è valido finché la campagna esiste.

**Q: Posso cambiare il codice campagna?**  
A: No, il codice è fisso.

**Q: Chi può modificare il nome campagna?**  
A: Tutti i membri hanno diritti uguali.

**Q: Posso vedere chi ha modificato cosa?**  
A: Non al momento (feature futura).

### Privacy & Sicurezza

**Q: I miei dati sono sicuri?**  
A: Sì, usiamo Firebase (Google) con regole di sicurezza server-side.

**Q: Chi può vedere i miei dati?**  
A: Solo tu e i membri delle tue campagne.

**Q: Posso eliminare il mio account?**  
A: Feature in arrivo. Per ora contatta l'admin.

---

## Risoluzione Problemi

### Non riesco a fare login

**Problema:** "Email o password errati"

**Soluzioni:**

1. Verifica email e password
2. Prova password reset (se disponibile)
3. Registrati se sei nuovo

---

**Problema:** "Errore di rete"

**Soluzioni:**

1. Controlla connessione internet
2. Ricarica la pagina (F5)
3. Svuota cache browser

---

### La mia campagna non appare

**Problema:** Campagna creata ma non compare in lista

**Soluzioni:**

1. **Ricarica pagina** (F5)
2. **Logout e re-login**
3. **Controlla di essere nella campagna**: apri modal Info e verifica membri

---

**Problema:** Campagna scomparsa improvvisamente

**Possibili cause:**

- Ultimo membro è uscito → Campagna auto-eliminata
- Errore di sincronizzazione → Ricarica la pagina

---

### Errori di sincronizzazione

**Problema:** Modifiche non si salvano / dati non aggiornano

**Soluzioni:**

1. **Controlla connessione** internet
2. **Ricarica pagina**
3. **Prova da browser diverso**
4. **Svuota cache**:
   - Chrome: Ctrl+Shift+Delete → Cancella dati
   - Safari: Preferenze → Privacy → Gestisci dati siti web

---

### PWA non si installa

**Android:**

- Controlla di usare **Chrome** (non altri browser)
- Aggiorna Chrome all'ultima versione
- Prova manualmente: Menu (⋮) → "Installa app"

**iOS:**

- Usa **Safari** (unico browser supportato per PWA su iOS)
- Segui procedura manuale: Condividi → Aggiungi a Home

---

### Modal non si chiude

**Problema:** Modal bloccato, non risponde

**Soluzioni:**

1. **Premi tasto Escape** sulla tastiera
2. **Premi pulsante Indietro** del browser/telefono
3. **Ricarica pagina** (perdi modifiche non salvate)

---

### Altro

**Problema non risolto?**

1. **Ricarica pagina** (F5 o Cmd+R)
2. **Logout e re-login**
3. **Prova browser diverso**
4. **Controlla che JavaScript sia abilitato**
5. **Contatta supporto** o admin del sito

---

## Contatti & Supporto

**Email:** support@civtracker.com (esempio)  
**GitHub Issues:** [github.com/tuorepo/civtracker/issues](https://github.com)

---

## Tips & Tricks

### Scorciatoie Tastiera

- **Escape**: Chiudi modale
- **Enter**: Conferma (nei form)
- **Tab**: Naviga tra campi

### Best Practices

✅ **Usa nomi descrittivi** per campagne  
✅ **Condividi codice** in modo sicuro (WhatsApp, email)  
✅ **Logout** da dispositivi condivisi  
✅ **Installa PWA** per esperienza migliore  
✅ **Mantieni browser aggiornato**

### Performance

Per migliore esperienza:

- Usa **Chrome** o **Firefox** aggiornati
- **Connessione stabile** (WiFi consigliato)
- **Installa PWA** per performance ottimali

---

**Buon divertimento con CivTracker! 🎮**
