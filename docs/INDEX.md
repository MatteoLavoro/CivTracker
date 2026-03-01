# 📖 Documentazione CivTracker - Indice Completo

Indice completo della documentazione di CivTracker con guide rapide per trovare le informazioni necessarie.

## 📋 Indice Generale

### Per Utenti

- **[Guida Utente](USER_GUIDE.md)** - Come usare CivTracker passo-passo

### Per Sviluppatori

- **[README](../README.md)** - Overview progetto e quick start
- **[Guida Sviluppatore](DEVELOPER_GUIDE.md)** - Setup, workflow, best practices
- **[Architettura](ARCHITECTURE.md)** - Design patterns e decisioni tecniche
- **[API Reference](API_REFERENCE.md)** - Riferimento completo tutti i servizi

### Componenti & Codice

- **[Componenti](COMPONENTS.md)** - Tutti i componenti riutilizzabili
- **[Hooks](HOOKS.md)** - Custom React hooks
- **[Contexts](CONTEXTS.md)** - Gestione stato globale

### Sistemi Specifici

- **[Autenticazione](AUTH_DOCUMENTATION.md)** - Sistema auth completo
- **[Campagne](CAMPAIGNS_SYSTEM.md)** - Gestione campagne collaborative
- **[Modali](MODAL_SYSTEM.md)** - Sistema modale centralizzato
- **[PWA](PWA_DOCUMENTATION.md)** - Progressive Web App features

### Deployment

- **[Firebase Deployment](../FIREBASE_DEPLOYMENT.md)** - Deploy rules e indexes
- **[Firebase Services](../src/services/firebase/README.md)** - Firebase integration

---

## 🎯 Guide Rapide

### Sono un nuovo utente

1. Leggi [USER_GUIDE.md](USER_GUIDE.md) → Sezione "Iniziare"
2. Registrati e accedi
3. Crea la tua prima campagna

### Sono uno sviluppatore nuovo al progetto

1. Leggi [README.md](../README.md) → Quick Start
2. Leggi [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) → Setup Ambiente
3. Esplora [ARCHITECTURE.md](ARCHITECTURE.md) per capire la struttura
4. Consulta [API_REFERENCE.md](API_REFERENCE.md) quando serve

### Voglio creare un nuovo componente

1. Leggi [COMPONENTS.md](COMPONENTS.md) → Best Practices
2. Segui [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) → Coding Standards
3. Studia componenti esistenti per pattern

### Voglio capire come funziona l'autenticazione

1. Leggi [AUTH_DOCUMENTATION.md](AUTH_DOCUMENTATION.md)
2. Vedi [CONTEXTS.md](CONTEXTS.md) → AuthContext
3. Vedi [HOOKS.md](HOOKS.md) → useAuth
4. Consulta [API_REFERENCE.md](API_REFERENCE.md) → Authentication

### Voglio implementare una feature con Firestore

1. Leggi [API_REFERENCE.md](API_REFERENCE.md) → Firestore
2. Vedi [HOOKS.md](HOOKS.md) → useCollection/useDocument
3. Controlla [ARCHITECTURE.md](ARCHITECTURE.md) → Data Flow

### Voglio deployare l'app

1. Leggi [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) → Deployment
2. Segui [FIREBASE_DEPLOYMENT.md](../FIREBASE_DEPLOYMENT.md)
3. Verifica build con preview

---

## 📚 Documentazione per Argomento

### Autenticazione & Sicurezza

- Registrazione/Login: [AUTH_DOCUMENTATION.md](AUTH_DOCUMENTATION.md)
- AuthContext: [CONTEXTS.md](CONTEXTS.md#authcontext)
- Protected Routes: [COMPONENTS.md](COMPONENTS.md#protectedroute)
- Firestore Security Rules: [FIREBASE_DEPLOYMENT.md](../FIREBASE_DEPLOYMENT.md)

### Campagne

- Sistema Completo: [CAMPAIGNS_SYSTEM.md](CAMPAIGNS_SYSTEM.md)
- API Campagne: [API_REFERENCE.md](API_REFERENCE.md#campaigns)
- Campaign Page: [User Guide - Gestione Campagne](USER_GUIDE.md#gestione-campagne)
- Struttura Dati: [CAMPAIGNS_SYSTEM.md](CAMPAIGNS_SYSTEM.md#struttura-dati-firebase)

### UI Components

- Tutti i componenti: [COMPONENTS.md](COMPONENTS.md)
- Button, Input, Modal: [COMPONENTS.md](COMPONENTS.md#common-components)
- Layout: [COMPONENTS.md](COMPONENTS.md#layout-components)
- Best Practices: [COMPONENTS.md](COMPONENTS.md#best-practices)

### Modali

- Sistema Completo: [MODAL_SYSTEM.md](MODAL_SYSTEM.md)
- ModalContext: [CONTEXTS.md](CONTEXTS.md#modalcontext)
- Modal Component: [COMPONENTS.md](COMPONENTS.md#modal)
- History Integration: [MODAL_SYSTEM.md](MODAL_SYSTEM.md#gestione-back-button)

### Real-time Data

- useCollection Hook: [HOOKS.md](HOOKS.md#usecollection)
- useDocument Hook: [HOOKS.md](HOOKS.md#usedocument)
- Firestore Listeners: [API_REFERENCE.md](API_REFERENCE.md#subscribetocollection)
- Data Flow: [ARCHITECTURE.md](ARCHITECTURE.md#data-flow)

### Progressive Web App

- Panoramica: [PWA_DOCUMENTATION.md](PWA_DOCUMENTATION.md)
- InstallPrompt: [COMPONENTS.md](COMPONENTS.md#installprompt)
- Service Worker: [PWA_DOCUMENTATION.md](PWA_DOCUMENTATION.md#service-worker)
- Installazione: [USER_GUIDE.md](USER_GUIDE.md#pwa---installazione-app)

### State Management

- Contexts: [CONTEXTS.md](CONTEXTS.md)
- Custom Hooks: [HOOKS.md](HOOKS.md)
- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md#state-management)
- Patterns: [ARCHITECTURE.md](ARCHITECTURE.md#design-patterns)

### Firebase

- Setup: [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md#setup-ambiente)
- Services API: [API_REFERENCE.md](API_REFERENCE.md#firebase-services)
- Deployment: [FIREBASE_DEPLOYMENT.md](../FIREBASE_DEPLOYMENT.md)
- Firestore Rules: File `firestore.rules` nella root

### Testing & Debug

- Testing: [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md#testing)
- Debugging: [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md#debugging)
- Troubleshooting Dev: [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md#troubleshooting)
- Troubleshooting User: [USER_GUIDE.md](USER_GUIDE.md#risoluzione-problemi)

### Performance

- Optimization: [ARCHITECTURE.md](ARCHITECTURE.md#performance-optimizations)
- Best Practices: [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md#best-practices)
- Firestore Queries: [API_REFERENCE.md](API_REFERENCE.md#best-practices)

---

## 🔍 Trova Informazioni su Specifiche Features

### Button Component

- Documentazione: [COMPONENTS.md](COMPONENTS.md#button)
- Props: [COMPONENTS.md](COMPONENTS.md#button) → Props section
- Esempi: [COMPONENTS.md](COMPONENTS.md#button) → Examples

### Input Component

- Documentazione: [COMPONENTS.md](COMPONENTS.md#input)
- Validazione: [COMPONENTS.md](COMPONENTS.md#input) → Features
- Password Toggle: [COMPONENTS.md](COMPONENTS.md#input)

### Modal System

- Overview: [MODAL_SYSTEM.md](MODAL_SYSTEM.md)
- Component: [COMPONENTS.md](COMPONENTS.md#modal)
- Context: [CONTEXTS.md](CONTEXTS.md#modalcontext)
- Nested Modals: [MODAL_SYSTEM.md](MODAL_SYSTEM.md#modali-nested)

### useCollection Hook

- Documentazione: [HOOKS.md](HOOKS.md#usecollection)
- Query Conditions: [HOOKS.md](HOOKS.md#usecollection) → Conditions Format
- Esempi: [HOOKS.md](HOOKS.md#usecollection) → Esempi section
- API Service: [API_REFERENCE.md](API_REFERENCE.md#subscribetocollection)

### Campaign Creation

- User Flow: [USER_GUIDE.md](USER_GUIDE.md#creare-una-campagna)
- API: [API_REFERENCE.md](API_REFERENCE.md#createcampaign)
- Codice: `src/services/firebase/campaigns.js`
- Sistema: [CAMPAIGNS_SYSTEM.md](CAMPAIGNS_SYSTEM.md#creazione-campagne)

### Authentication Flow

- User Guide: [USER_GUIDE.md](USER_GUIDE.md#autenticazione)
- Auth System: [AUTH_DOCUMENTATION.md](AUTH_DOCUMENTATION.md)
- Context: [CONTEXTS.md](CONTEXTS.md#authcontext)
- API: [API_REFERENCE.md](API_REFERENCE.md#authentication)

---

## 📊 Diagrammi & Visualizzazioni

### Data Flow

Vedi [ARCHITECTURE.md](ARCHITECTURE.md#data-flow):

- Authentication Flow
- Firestore Real-time Flow
- Modal Management Flow

### Struttura Progetto

Vedi [ARCHITECTURE.md](ARCHITECTURE.md#struttura-del-progetto):

- Directory tree completo
- File organization

### Component Tree

Vedi [ARCHITECTURE.md](ARCHITECTURE.md#design-patterns):

- Component Composition
- Context Provider hierarchy

---

## 🛠️ Tools & Utilities

### Development

- Vite Config: `vite.config.js`
- ESLint Config: `eslint.config.js`
- Firebase Config: `firebase.json`
- Package.json: `package.json`

### Firebase

- Rules: `firestore.rules`
- Indexes: `firestore.indexes.json`
- Config: `src/services/firebase/config.js`

### Documentation

- Markdown files in `docs/`
- Code comments (JSDoc style)
- README files in subfolders

---

## 📖 Come Leggere la Documentazione

### Per Apprendimento Lineare

1. **README.md** - Overview generale
2. **USER_GUIDE.md** - Capire cosa fa l'app
3. **ARCHITECTURE.md** - Struttura e design
4. **DEVELOPER_GUIDE.md** - Setup e workflow
5. **COMPONENTS.md** + **HOOKS.md** + **CONTEXTS.md** - Dettagli implementazione
6. **API_REFERENCE.md** - Reference completo

### Per Reference Rapido

Vai direttamente al documento specifico usando questo indice o la ricerca.

### Per Feature Specifica

1. Cerca nel indice generale sopra
2. O usa la ricerca (Ctrl+F) in questo file
3. Segui i link al documento approp riato

---

## 🔄 Aggiornamenti Documentazione

**Ultima revisione:** 1 Marzo 2026

### Quando Aggiornare

- Nuove feature implementate
- Modifiche breaking changes
- Best practices scoperte
- Bug fix documentati

### Come Contribuire

1. Identifica sezione da aggiornare
2. Modifica file Markdown
3. Commit con messaggio descrittivo (`docs: update...`)
4. Pull Request se collaborativo

---

## ❓ Supporto

### Non trovi quello che cerchi?

1. Usa ricerca in questo file (Ctrl/Cmd+F)
2. Controlla README files in subfolders
3. Consulta code comments nei file sorgente
4. Chiedi al team

### Segnala Documentazione Mancante

- Apri Issue su GitHub
- Tag: `documentation`
- Descrivi cosa manca

---

## 📝 Convenzioni Documentazione

### File Names

- UPPER_CASE.md per documenti principali
- lowercase.md per documenti specifici
- README.md per overview cartelle

### Struttura Documento

1. Titolo con emoji
2. Indice (per documenti lunghi)
3. Sezioni con heading gerarchici
4. Esempi di codice con syntax highlighting
5. Note e avvisi (✅ ❌ ⚠️)
6. Link a documentazione correlata

### Code Examples

```javascript
// ✅ Good example
const result = await service();

// ❌ Bad example
service(); // No await
```

---

**Buona lettura! 📚**

[← Torna al README](../README.md)
