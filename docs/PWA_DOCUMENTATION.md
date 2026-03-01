# PWA (Progressive Web App) - Documentazione

## Panoramica

CivTracker è ora una Progressive Web App (PWA) completa che può essere installata su dispositivi mobili e desktop.

## Funzionalità PWA Implementate

### 1. Manifest Web App (`public/site.webmanifest`)

Il manifest definisce come l'app appare quando installata:

- **Nome**: CivTracker
- **Icone**: 192x192 e 512x512 pixel
- **Modalità display**: Standalone (sembra un'app nativa)
- **Tema colore**: Nero (#000000)
- **Orientamento**: Portrait-primary
- **Lingue**: Italiano (it-IT)

### 2. Service Worker (`public/sw.js`)

Il service worker gestisce:

- **Cache delle risorse essenziali**: File statici cachati per accesso offline
- **Strategia Network First**: Prova prima la rete, poi fallback alla cache
- **Aggiornamenti automatici**: Gestione delle versioni della cache
- **Supporto offline**: L'app funziona anche senza connessione

### 3. Componente InstallPrompt

Il componente mostra un prompt di installazione personalizzato che:

#### Su Android/Chrome:

- Mostra un popup elegante con il pulsante "Installa App"
- Utilizza l'evento `beforeinstallprompt` nativo
- Installazione con un solo tap

#### Su iOS/Safari:

- Mostra istruzioni passo-passo con icone
- Spiega come aggiungere l'app alla schermata home
- Guida visiva completa per gli utenti iOS

### 4. Logica di Visualizzazione

Il prompt viene mostrato solo:

- ✅ Al primo accesso al sito
- ✅ Su dispositivi mobili (Android/iOS)
- ✅ Se l'app non è già installata

Il prompt NON viene mostrato:

- ❌ Se l'utente ha già visto il prompt (salvato in localStorage)
- ❌ Se l'app è già installata
- ❌ Su desktop

## Meta Tag PWA

I seguenti meta tag sono stati aggiunti all'`index.html`:

```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta
  name="apple-mobile-web-app-status-bar-style"
  content="black-translucent"
/>
<meta name="mobile-web-app-capable" content="yes" />
<meta name="theme-color" content="#000000" />
<meta name="description" content="Track and manage your civilization data" />
```

## Come Testare

### Test su Android:

1. Apri Chrome su Android
2. Visita il sito
3. Vedrai il popup di installazione dopo 1 secondo
4. Clicca "Installa App"
5. L'app verrà aggiunta alla schermata home

### Test su iOS:

1. Apri Safari su iPhone/iPad
2. Visita il sito
3. Vedrai il popup con le istruzioni
4. Segui i passaggi mostrati:
   - Tocca l'icona di condivisione (in basso)
   - Scorri e seleziona "Aggiungi a schermata Home"
   - Conferma con "Aggiungi"

### Test su Desktop (Chrome):

1. Apri Chrome DevTools (F12)
2. Attiva la modalità dispositivo mobile (Ctrl+Shift+M)
3. Seleziona un dispositivo Android
4. Ricarica la pagina
5. Il popup dovrebbe apparire

## Verifiche PWA

Per verificare che la PWA sia configurata correttamente:

1. Apri Chrome DevTools
2. Vai alla tab "Application"
3. Controlla:
   - **Manifest**: Tutte le informazioni sono presenti
   - **Service Workers**: Il service worker è registrato e attivo
   - **Cache Storage**: Le risorse sono cachate
   - **Lighthouse**: Esegui un audit PWA (dovrebbe ottenere un punteggio alto)

## Requisiti per la Produzione

Per il corretto funzionamento in produzione, assicurati che:

1. ✅ Il sito sia servito tramite HTTPS
2. ✅ Il service worker sia accessibile dalla root (`/sw.js`)
3. ✅ Il manifest sia accessibile (`/site.webmanifest`)
4. ✅ Le icone siano presenti e accessibili

## File Modificati/Creati

### Nuovi File:

- `public/sw.js` - Service Worker
- `src/components/common/InstallPrompt.jsx` - Componente del prompt
- `src/components/common/InstallPrompt.css` - Stili del prompt

### File Modificati:

- `public/site.webmanifest` - Configurazione PWA completa
- `index.html` - Meta tag PWA aggiunti
- `src/main.jsx` - Registrazione del service worker
- `src/App.jsx` - Integrazione del componente InstallPrompt
- `src/components/common/index.js` - Export del componente InstallPrompt

## Personalizzazione

### Cambiare il Comportamento del Prompt

Per modificare quando appare il prompt, modifica `InstallPrompt.jsx`:

```javascript
// Cambia il ritardo prima di mostrare il prompt (default: 1000ms)
setTimeout(() => setShowPrompt(true), 1000);
```

### Reset del Prompt

Per far riapparire il prompt (per test), esegui nella console:

```javascript
localStorage.removeItem("pwa-install-prompt-seen");
```

### Personalizzare la Cache

Per modificare quali file vengono cachati, edita `public/sw.js`:

```javascript
const urlsToCache = [
  "/",
  "/index.html",
  // Aggiungi altri file qui
];
```

## Compatibilità Browser

| Browser          | Supporto                             |
| ---------------- | ------------------------------------ |
| Chrome Android   | ✅ Completo                          |
| Safari iOS       | ✅ Completo (con istruzioni manuali) |
| Samsung Internet | ✅ Completo                          |
| Firefox Android  | ⚠️ Parziale (no beforeinstallprompt) |
| Edge Mobile      | ✅ Completo                          |

## Note

- iOS non supporta l'installazione automatica tramite API, quindi mostriamo istruzioni manuali
- Il service worker funziona solo su HTTPS (o localhost per sviluppo)
- La cache viene aggiornata automaticamente quando rilevi una nuova versione del service worker
- Il prompt viene mostrato solo una volta per utente (salvato in localStorage)

## Prossimi Passi (Opzionali)

Per migliorare ulteriormente la PWA:

1. **Push Notifications**: Implementare notifiche push
2. **Background Sync**: Sincronizzare dati in background
3. **Offline Page**: Pagina personalizzata quando offline
4. **Update Notification**: Notificare l'utente quando c'è un aggiornamento disponibile
5. **App Shortcuts**: Aggiungere shortcut al manifest per azioni comuni
