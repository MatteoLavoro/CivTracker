# 👨‍💻 Guida Sviluppatore CivTracker

Guida completa per sviluppatori che lavorano su CivTracker.

## Indice

- [Setup Ambiente](#setup-ambiente)
- [Struttura Progetto](#struttura-progetto)
- [Workflow Sviluppo](#workflow-sviluppo)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Debugging](#debugging)
- [Deployment](#deployment)
- [Git Workflow](#git-workflow)
- [Troubleshooting](#troubleshooting)

---

## Setup Ambiente

### Prerequisites

```bash
Node.js >= 18.0.0
npm >= 9.0.0
Git
Firebase Account
```

Verifica versioni:

```bash
node --version   # v18.0.0 o superiore
npm --version    # v9.0.0 o superiore
git --version
```

### Installazione

**1. Clone Repository**

```bash
git clone https://github.com/tuousername/civtracker.git
cd civtracker
```

**2. Installa Dipendenze**

```bash
npm install
```

**3. Configura Firebase**

Crea `src/services/firebase/config.js`:

```javascript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

**Oppure** usa `.env` (consigliato per sviluppo):

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**4. Setup Firebase CLI**

```bash
npm install -g firebase-tools
firebase login
firebase use --add  # Seleziona progetto
```

**5. Deploy Firestore Rules & Indexes**

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

**6. Avvia Dev Server**

```bash
npm run dev
```

Apri `http://localhost:5173`

### Firebase Project Setup

**Enable Authentication:**

1. Firebase Console → Authentication
2. Get Started → Email/Password → Enable

**Create Firestore Database:**

1. Firebase Console → Firestore Database
2. Create Database → Start in **test mode** (poi deploy rules)
3. Location: scegli più vicina

**Setup Storage (opzionale):**

1. Firebase Console → Storage
2. Get Started

---

## Struttura Progetto

```
civtracker/
├── public/                    # Static assets
│   ├── sw.js                 # Service Worker
│   ├── site.webmanifest      # PWA manifest
│   └── icons/                # PWA icons
│
├── src/
│   ├── components/           # React components
│   │   ├── common/          # Reusable (Button, Input, Modal)
│   │   ├── layout/          # Layout wrappers
│   │   └── ProtectedRoute.jsx
│   │
│   ├── contexts/            # Global state
│   │   ├── AuthContext.jsx
│   │   ├── ModalContext.jsx
│   │   └── index.js
│   │
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useCollection.js
│   │   ├── useDocument.js
│   │   ├── useFileUpload.js
│   │   └── index.js
│   │
│   ├── pages/               # Page components
│   │   ├── Auth/           # Login/Register
│   │   ├── Home/           # Dashboard
│   │   ├── Campaign/       # Campaign detail
│   │   └── index.js
│   │
│   ├── services/            # External services
│   │   └── firebase/
│   │       ├── config.js   # Firebase config
│   │       ├── auth.js     # Auth service
│   │       ├── firestore.js # Database
│   │       ├── storage.js  # File storage
│   │       ├── campaigns.js # Campaign logic
│   │       └── index.js
│   │
│   ├── utils/               # Utility functions
│   │   └── campaignUtils.js
│   │
│   ├── App.jsx              # Root component
│   ├── main.jsx             # Entry point
│   ├── App.css              # App styles
│   └── index.css            # Global styles
│
├── docs/                     # Documentation
├── firebase.json            # Firebase config
├── firestore.rules          # Security rules
├── firestore.indexes.json   # Firestore indexes
├── package.json
├── vite.config.js           # Vite config
└── eslint.config.js         # ESLint config
```

### File Naming Conventions

- **Components**: PascalCase (`Button.jsx`, `CampaignCard.jsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.js`, `useCollection.js`)
- **Utils**: camelCase (`campaignUtils.js`)
- **Styles**: Match component name (`Button.css`)
- **Constants**: UPPER_SNAKE_CASE (`API_KEYS.js`)

---

## Workflow Sviluppo

### 1. Crea Feature Branch

```bash
git checkout -b feature/add-chat-system
```

### 2. Sviluppa Localmente

```bash
npm run dev
```

**Hot Module Replacement (HMR):** Le modifiche si riflettono istantaneamente.

### 3. Lint Code

```bash
npm run lint          # Check errors
npm run lint -- --fix # Auto-fix
```

### 4. Test Manualmente

- Test su Chrome Desktop
- Test su mobile (DevTools device mode)
- Test funzionalità specifiche
- Test edge cases

### 5. Commit Changes

```bash
git add .
git commit -m "feat: add chat system to campaigns"
```

**Commit Message Format:**

- `feat:` Nuova feature
- `fix:` Bug fix
- `docs:` Documentazione
- `style:` Formatting
- `refactor:` Code refactoring
- `test:` Test
- `chore:` Manutenzione

### 6. Push & Pull Request

```bash
git push origin feature/add-chat-system
```

Crea Pull Request su GitHub.

---

## Coding Standards

### React Components

**Functional Components con Hooks:**

```jsx
// ✅ Corretto
import { useState, useEffect } from "react";
import { useAuthContext } from "../../contexts";
import "./MyComponent.css";

export function MyComponent({ propA, propB }) {
  const [state, setState] = useState(initialValue);
  const { user } = useAuthContext();

  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  const handleAction = () => {
    // Handler logic
  };

  return <div className="my-component">{/* JSX */}</div>;
}
```

**Props Destructuring:**

```jsx
// ✅ Destructure props
export function Button({ onClick, children, variant = "primary" }) {
  // ...
}

// ❌ Evita
export function Button(props) {
  const onClick = props.onClick;
  // ...
}
```

**Conditional Rendering:**

```jsx
// ✅ Early returns
if (loading) return <Spinner />;
if (error) return <ErrorMessage />;
if (!data) return <NotFound />;

return <Content data={data} />;

// ✅ Ternary per semplici condizioni
{
  isOpen ? <Modal /> : null;
}

// ✅ && per render condizionale
{
  showWarning && <Warning />;
}
```

### State Management

**Local State:**

```jsx
// Per state specifico del componente
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({ name: "", email: "" });
```

**Global State (Context):**

```jsx
// Per state condiviso tra molti componenti
const { user } = useAuthContext();
const { modalDepth } = useModal();
```

**Server State (Firestore):**

```jsx
// Per dati dal backend
const { documents: campaigns } = useCollection("campaigns");
const { document: campaign } = useDocument("campaigns", id);
```

### Async/Await

```jsx
// ✅ Gestisci errori
const handleSubmit = async () => {
  try {
    setLoading(true);
    const { error } = await someAsyncFunction();
    if (error) {
      console.error(error);
      alert("Error: " + error);
      return;
    }
    // Success
  } catch (err) {
    console.error("Unexpected error:", err);
  } finally {
    setLoading(false);
  }
};
```

### Imports Order

```jsx
// 1. React / external libraries
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail } from "lucide-react";

// 2. Contexts
import { useAuthContext, useModal } from "../../contexts";

// 3. Hooks
import { useCollection, useDocument } from "../../hooks";

// 4. Components
import { Button, Input, Modal } from "../../components/common";

// 5. Services
import { logOut, updateUserProfile } from "../../services/firebase";

// 6. Utils
import { formatDate, validateEmail } from "../../utils";

// 7. Styles
import "./MyComponent.css";
```

### Comments

```jsx
/**
 * Component description
 *
 * @param {Object} props
 * @param {string} props.title - Title text
 * @param {Function} props.onClose - Close handler
 */
export function MyComponent({ title, onClose }) {
  // Brevi commenti inline per logica complessa
  const processedData = data.filter((item) => {
    // Filtra solo item attivi degli ultimi 30 giorni
    return item.active && isRecent(item.date, 30);
  });

  return <div>{/* JSX */}</div>;
}
```

### CSS Conventions

**BEM-like Naming:**

```css
/* Component */
.campaign-card {
  /* Base styles */
}

/* Element */
.campaign-card-header {
  /* Header styles */
}

/* Modifier */
.campaign-card--featured {
  /* Featured variant */
}
```

**Responsive:**

```css
/* Mobile first */
.component {
  width: 100%;
}

/* Tablet */
@media (min-width: 768px) {
  .component {
    width: 50%;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .component {
    width: 33.33%;
  }
}
```

---

## Testing

### Manual Testing Checklist

**Authentication Flow:**

- [ ] Registrazione nuovo utente
- [ ] Login utente esistente
- [ ] Logout
- [ ] Validazione email/password
- [ ] Error messages corretti

**Campaigns:**

- [ ] Creazione campagna
- [ ] Join campagna con codice
- [ ] Visualizzazione campagne
- [ ] Modifica nome campagna
- [ ] Uscita da campagna
- [ ] Auto-eliminazione campagna vuota

**UI/UX:**

- [ ] Modali aprono/chiudono correttamente
- [ ] Browser back button funziona
- [ ] Escape key chiude modali
- [ ] Loading states mostrati
- [ ] Error handling corretto
- [ ] Responsive su mobile/tablet/desktop

**PWA:**

- [ ] Service Worker registrato
- [ ] Prompt installazione appare
- [ ] App installabile
- [ ] Funziona offline (risorse cachate)

### Browser Testing

Testa su:

- Chrome Desktop
- Firefox Desktop
- Safari Desktop (macOS)
- Chrome Mobile (Android)
- Safari Mobile (iOS)

### Device Testing

- Desktop (1920x1080, 1366x768)
- Tablet (768x1024)
- Mobile (375x667, 414x896)

### Firebase Emulator (Optional)

```bash
# Installa emulators
firebase init emulators

# Avvia emulators
firebase emulators:start

# Configura app per usare emulators
// In config.js
if (window.location.hostname === 'localhost') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

---

## Debugging

### React DevTools

Installa estensione React DevTools per Chrome/Firefox.

**Features:**

- Inspect component tree
- View props/state
- Track re-renders
- Profiler per performance

### Console Logging

```jsx
// Durante sviluppo
console.log("Campaign data:", campaign);
console.error("Error creating campaign:", error);

// Rimuovi prima di commit, o usa:
if (import.meta.env.DEV) {
  console.log("Debug info:", data);
}
```

### Firebase Debugging

**Firestore:**

```javascript
// Check query results
const { documents } = useCollection("campaigns");
console.log("Campaigns:", documents);

// Check rules
// Firebase Console → Firestore → Rules → Test Rules
```

**Auth:**

```javascript
// Check auth state
const { user } = useAuthContext();
console.log("Current user:", user);
console.log("UID:", user?.uid);
```

### Network Tab

Usa Chrome DevTools Network tab per:

- Firestore requests
- Firebase Auth requests
- Storage uploads
- API calls

### Breakpoints

```jsx
function myFunction() {
  debugger; // Pausa esecuzione qui
  const result = complexCalculation();
  return result;
}
```

---

## Deployment

### Production Build

```bash
# Build ottimizzata per produzione
npm run build

# Output in dist/
ls dist/
```

### Preview Build

```bash
# Test production build localmente
npm run preview

# Apri http://localhost:4173
```

### Deploy su Firebase Hosting

```bash
# Deploy completo
firebase deploy

# Deploy solo hosting
firebase deploy --only hosting

# Deploy solo Firestore rules
firebase deploy --only firestore:rules

# Deploy solo indexes
firebase deploy --only firestore:indexes
```

### Verifica Deploy

```bash
firebase hosting:channel:deploy preview
# Ottieni preview URL per testing
```

### Environment Variables

**Development (`.env`):**

```env
VITE_FIREBASE_API_KEY=dev_key
VITE_FIREBASE_PROJECT_ID=dev_project
```

**Production:**

- Configura nelle impostazioni hosting provider
- O Firebase Functions config

---

## Git Workflow

### Branch Strategy

```
main            # Production
  └── develop   # Development
       └── feature/xxx  # Feature branches
       └── fix/xxx      # Bug fixes
```

### Branch Commands

```bash
# Crea feature branch da develop
git checkout develop
git checkout -b feature/add-notifications

# Lavora sulla feature
git add .
git commit -m "feat: add notification system"

# Push branch
git push origin feature/add-notifications

# Crea Pull Request su GitHub

# Dopo merge, aggiorna local
git checkout develop
git pull origin develop

# Elimina branch locale
git branch -d feature/add-notifications
```

### Commit Best Practices

**Format:**

```
type(scope): subject

body (optional)

footer (optional)
```

**Esempi:**

```bash
feat(campaigns): add member invitation system
fix(auth): resolve logout redirect issue
docs(readme): update installation instructions
style(components): format button component
refactor(hooks): simplify useCollection implementation
test(campaigns): add campaign creation tests
chore(deps): update firebase to v12.10.0
```

### Git Hooks (Future)

```bash
# Pre-commit: run linter
npm run lint

# Pre-push: run tests
npm test
```

---

## Troubleshooting

### Port Already in Use

```bash
# Error: Port 5173 già in uso

# Trova processo
lsof -i :5173  # macOS/Linux
netstat -ano | findstr :5173  # Windows

# Kill processo
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# O usa porta diversa
npm run dev -- --port 3000
```

### Firebase Configuration Error

```
Error: Firebase configuration not found
```

**Soluzione:**

1. Verifica `src/services/firebase/config.js` esista
2. O `.env` con variabili `VITE_FIREBASE_*`
3. Restart dev server dopo modifiche `.env`

### Firestore Permission Denied

```
Error: Missing or insufficient permissions
```

**Soluzione:**

1. Deploy Firestore rules: `firebase deploy --only firestore:rules`
2. Verifica utente autenticato: `user != null`
3. Check regole in Firebase Console → Firestore → Rules

### Build Error

```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

### ESLint Errors

```bash
# Auto-fix linting errors
npm run lint -- --fix

# Ignore specific rules (solo temporaneo)
/* eslint-disable-next-line rule-name */
```

---

## Performance Tips

### Code Splitting

```jsx
// Lazy load routes
const Campaign = lazy(() => import("./pages/Campaign"));

<Route
  path="/campaign/:id"
  element={
    <Suspense fallback={<Spinner />}>
      <Campaign />
    </Suspense>
  }
/>;
```

### Memoization

```jsx
// Memo expensive calculations
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.name.localeCompare(b.name));
}, [data]);

// Memo callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

### Firestore Optimization

```jsx
// ✅ Use single query with filters
useCollection("campaigns", [
  {
    type: "where",
    field: "members",
    operator: "array-contains",
    value: userId,
  },
]);

// ❌ Evita fetch di tutti e filter client-side
const { documents: all } = useCollection("campaigns");
const mine = all.filter((c) => c.members.includes(userId));
```

---

## Resources

### Documentation

- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### CivTracker Docs

- [Architecture](ARCHITECTURE.md)
- [Components](COMPONENTS.md)
- [Hooks](HOOKS.md)
- [Contexts](CONTEXTS.md)
- [API Reference](API_REFERENCE.md)

### Tools

- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Firebase Console](https://console.firebase.google.com/)
- [ESLint](https://eslint.org/)

---

## Getting Help

1. **Check Documenti**: Leggi docs/ per info dettagliate
2. **Search Issues**: Cerca su GitHub Issues
3. **Ask Team**: Contatta il team su Slack/Discord
4. **Firebase Support**: Per problemi Firebase-specific

---

**Happy Coding! 🚀**
