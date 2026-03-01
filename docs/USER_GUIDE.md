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
- **ⓘ Info button**

**Contenuto:**

- 🚧 **In arrivo:** Features specifiche della campagna

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
- Sei stato rimosso (non ancora possibile, bug?)

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
