# 🎯 CivTracker

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.0-FFCA28?logo=firebase)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)

**CivTracker** è una Progressive Web App moderna per la gestione collaborativa di campagne, con sistema di autenticazione, real-time updates, e interfaccia dark responsive.

## ✨ Caratteristiche Principali

- 🔐 **Autenticazione completa** con Firebase Authentication
- 🎮 **Sistema campagne collaborative** con codici condivisibili e voto democratico
- 🎲 **Sistema draft leader avanzato** con banning phase e pool personalizzate
- 📊 **Sistema punteggi dinamico** con victory points logaritmici e bonus moltiplicativi
- 🏆 **Gestione partite completa** con tracking turni, vincitori e classifiche
- 📱 **PWA installabile** su mobile e desktop
- ⚡ **Real-time updates** con Firestore per sincronizzazione istantanea
- 🎨 **Dark theme** con design moderno e glassmorphism
- 🔄 **Gestione modali centralizzata** con history integration e nested modals
- 📡 **Supporto offline** con Service Worker e caching intelligente
- 🛡️ **Sicurezza avanzata** con Firestore Rules granulari

## 🚀 Tech Stack

- **React 19.2** + **Vite 7.3** - Latest React with ultra-fast build tooling
- **Firebase 12** - Authentication, Firestore Database, Storage
- **Tailwind CSS 4.2** - Utility-first CSS framework
- **React Router DOM 7** - Client-side routing
- **Lucide React** - Modern icon library

## 📖 Documentazione

### Per Utenti

- **[Guida Utente](docs/USER_GUIDE.md)** - Come usare CivTracker

### Per Sviluppatori

- **[Guida Sviluppatore](docs/DEVELOPER_GUIDE.md)** - Setup e best practices
- **[Architettura](docs/ARCHITECTURE.md)** - Design patterns e struttura
- **[API Reference](docs/API_REFERENCE.md)** - Riferimento completo API

### Sistemi Specifici

- **[Autenticazione](docs/AUTH_DOCUMENTATION.md)** - Sistema auth completo
- **[Campagne](docs/CAMPAIGNS_SYSTEM.md)** - Gestione campagne collaborative
- **[Leaders](docs/LEADERS_SYSTEM.md)** - Database profili leader Civilization VI
- **[Modali](docs/MODAL_SYSTEM.md)** - Sistema modale centralizzato
- **[PWA](docs/PWA_DOCUMENTATION.md)** - Progressive Web App features
- **[Componenti](docs/COMPONENTS.md)** - Componenti riutilizzabili
- **[Hooks](docs/HOOKS.md)** - Custom React hooks
- **[Contexts](docs/CONTEXTS.md)** - Gestione stato globale

### Deployment

- **[Firebase Deployment](FIREBASE_DEPLOYMENT.md)** - Deploy Firestore rules/indexes
- **[Firebase Services](src/services/firebase/README.md)** - Firebase integration

## 📱 Quick Reference

**Design:** Dark theme, glassmorphism, responsive mobile-first  
**Colori:** Primary `rgba(15, 50, 82, 1)`, Gold `rgba(212, 175, 55, 1)`  
**Breakpoints:** sm: 640px, md: 768px, lg: 1024px

**Struttura:** React components → Firebase services → Firestore DB  
**Stack:** React 19 + Vite 7 + Firebase 12 + Tailwind 4 + React Router 7

## � Installazione Rapida

```bash
# 1. Clone e installa
git clone https://github.com/tuousername/civtracker.git
cd civtracker
npm install

# 2. Configura Firebase
# Crea .env con le tue credenziali Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... altre variabili

# 3. Deploy rules e avvia
firebase deploy --only firestore:rules,firestore:indexes
npm run dev
```

Apri `http://localhost:5173`

### Scripts Disponibili

```bash
npm run dev      # Dev server
npm run build    # Build produzione
npm run preview  # Preview build
firebase deploy  # Deploy completo
```

## �� Funzionalità Principali

### 🔐 Autenticazione

- Registrazione/login con email e password
- Profilo utente modificabile
- Protected routes con loading states
- Sessioni persistenti

### 🎮 Gestione Campagne

- **Codici univoci** di 8 caratteri per condivisione
- **Sistema voto democratico** per cambio stato (not-started → in-progress → completed)
- **Campagne importanti** con stella e ordinamento prioritario
- **Real-time sync** tra tutti i membri
- **Auto-eliminazione** quando ultimo membro esce

### 🏆 Sistema Partite

- **9 tipi di vittoria** (science, culture, diplomatic, domination, religious, score, forfait, defeat, canceled)
- **Sistema punteggi avanzato** con victory points logaritmici (50-150)
- **Bonus moltiplicativi** stackabili (+15% secondo posto, +10% sopravvissuto)
- **Ricalcolo automatico** di tutte le partite dopo ogni completamento
- **Classifiche** con badge oro/argento/bronzo

### 🎲 Draft Leader (77 Leader Civ VI)

- **5 fasi**: Waiting → Countdown → Active → Banning → Completed
- **Pool personalizzate** escludono leader già usati
- **Banning phase** democratico per bannare 1 leader per avversario
- **Minimizzazione duplicati** tra giocatori
- **Draft history** salvata per ogni partita

### 📱 Progressive Web App

- Installabile su mobile e desktop
- Supporto offline con Service Worker
- Prompt installazione custom
- Standalone app experience

## 📊 Versione Attuale: 2.0.0

✅ **Completato:** Sistema completo di campagne, partite, draft, punteggi e classifiche  
🚧 **In Sviluppo:** Notifiche push, statistiche avanzate, esportazione dati  
🔮 **Roadmap:** Chat gruppi, achievements, temi custom, modalità torneo

---

💡 **Per iniziare rapidamente**, consulta la [Guida Sviluppatore](docs/DEVELOPER_GUIDE.md).

📱 **Per usare l'app**, consulta la [Guida Utente](docs/USER_GUIDE.md).
