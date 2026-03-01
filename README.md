# 🎯 CivTracker

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.0-FFCA28?logo=firebase)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)

**CivTracker** è una Progressive Web App moderna per la gestione collaborativa di campagne, con sistema di autenticazione, real-time updates, e interfaccia dark responsive.

## ✨ Caratteristiche Principali

- 🔐 **Autenticazione completa** con Firebase Authentication
- 🎮 **Sistema campagne collaborative** con codici condivisibili
- 📱 **PWA installabile** su mobile e desktop
- ⚡ **Real-time updates** con Firestore
- 🎨 **Dark theme** con design moderno
- 🔄 **Gestione modali centralizzata** con history integration
- 📡 **Supporto offline** con Service Worker
- 🛡️ **Sicurezza avanzata** con Firestore Rules

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

## 📱 Design System

### Colori

- **Primary**: `rgba(15, 50, 82, 1)` - Azioni principali
- **Gold**: `rgba(212, 175, 55, 1)` - Accenti e highlight
- **Background**: Gradient `#0a1929` → `#1a2332`
- **Surface**: `rgba(20, 30, 40, 0.95)` + backdrop blur

### Breakpoints

- **sm**: 640px (Mobile landscape)
- **md**: 768px (Tablet)
- **lg**: 1024px (Desktop)

## Project Structure

```
src/
├── components/
│   ├── common/           # Button, Input with variants and validation
│   ├── layout/           # AuthLayout wrapper
│   └── ProtectedRoute.jsx
├── contexts/             # AuthContext for global auth state
├── hooks/                # useAuth, useCollection, useDocument, useFileUpload
├── pages/
│   ├── Auth/             # Login/Register page (landing page)
│   └── Home/             # Protected dashboard (WIP)
├── services/
│   └── firebase/         # Firebase config and modular services
├── utils/                # Helper functions
└── assets/               # Static assets
```

## 📦 Installazione

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Firebase Account** con progetto configurato

### Setup

1. **Clone il repository**

   ```bash
   git clone https://github.com/tuousername/civtracker.git
   cd civtracker
   ```

2. **Installa dipendenze**

   ```bash
   npm install
   ```

3. **Configura Firebase**

   Crea `src/services/firebase/config.js` con la tua configurazione:

   ```javascript
   export const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
   };
   ```

   Oppure usa variabili d'ambiente in `.env`:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Deploya Firestore Rules**

   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```

5. **Avvia dev server**

   ```bash
   npm run dev
   ```

6. **Apri browser**

   Naviga su `http://localhost:5173`

## 🛠️ Scripts

```bash
# Sviluppo
npm run dev          # Avvia dev server (http://localhost:5173)
npm run build        # Build per produzione
npm run preview      # Preview della build di produzione
npm run lint         # Linting con ESLint

# Firebase
firebase deploy --only hosting              # Deploy hosting
firebase deploy --only firestore:rules      # Deploy regole Firestore
firebase deploy --only firestore:indexes    # Deploy indici Firestore
firebase deploy                             # Deploy completo
```

## 🤝 Contribuire

1. Fork il progetto
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

Leggi [DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) per le best practices.

## 📝 License

Questo progetto è distribuito sotto la licenza MIT. Vedi `LICENSE` per maggiori informazioni.

## 👨‍💻 Autore

**Matteo** - CivTracker Development Team

## 🙏 Ringraziamenti

- React Team per React 19
- Firebase Team per gli strumenti eccezionali
- Lucide per le icone moderne
- Tailwind CSS per il framework CSS

## 🎮 Funzionalità

### Sistema Autenticazione

- ✅ Registrazione con email, username e password
- ✅ Login con email/password
- ✅ Validazione form completa
- ✅ Sessioni persistenti
- ✅ Protected routes con loading states
- ✅ Password visibility toggle

### Gestione Campagne

- ✅ Creazione campagne con nome personalizzato
- ✅ Codici univoci di 8 caratteri (ABC12345)
- ✅ Join campagna tramite codice
- ✅ Lista membri con classifica
- ✅ Modifica nome (da tutti i membri)
- ✅ Condivisione codice con pulsante copia
- ✅ Uscita volontaria dal gruppo
- ✅ Auto-eliminazione campagna vuota
- ✅ Real-time synchronization

### Progressive Web App

- ✅ Installabile su mobile e desktop
- ✅ Supporto offline con Service Worker
- ✅ Prompt installazione custom (Android/iOS)
- ✅ Cache intelligente delle risorse
- ✅ Standalone app experience
- ✅ Icone home screen ottimizzate

### UI/UX

- ✅ Dark theme con gradienti
- ✅ Responsive design (mobile-first)
- ✅ Modali con history integration
- ✅ Animazioni fluide
- ✅ Loading states e error handling
- ✅ Glassmorphism effects
- ✅ Toast notifications

## 📊 Stato Progetto

**Versione Attuale**: 1.0.0 (MVP)

### ✅ Completato

- Sistema autenticazione completo
- CRUD campagne con codici univoci
- Sistema modale centralizzato
- PWA installabile
- Real-time updates Firestore
- Auto-eliminazione campagne
- Responsive design
- Documentazione completa

### 🚧 In Sviluppo

- Contenuto pagina Campaign (features specifiche)
- Sistema statistiche nelle card
- Notifiche push
- Temi personalizzabili

### 🔮 Roadmap Futura

- Chat di gruppo nelle campagne
- Sistema achievements/trofei
- Esportazione dati
- Grafici e analytics
- Integrazione mappe
- Modalità torneo

---

💡 **Per iniziare rapidamente**, consulta la [Guida Sviluppatore](docs/DEVELOPER_GUIDE.md).

📱 **Per usare l'app**, consulta la [Guida Utente](docs/USER_GUIDE.md).
