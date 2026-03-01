# 🏗️ Architettura CivTracker

Questo documento descrive l'architettura, i design patterns e le decisioni tecniche di CivTracker.

## Panoramica

CivTracker segue un'architettura **component-based** con **state management centralizzato** tramite React Context API, servizi modulari Firebase, e custom hooks per la gestione della logica.

## Stack Tecnologico

### Frontend Core

- **React 19.2.0**: Latest React con Concurrent Features
- **Vite 7.3.1**: Build tool ultra-veloce con HMR
- **React Router DOM 7.13.1**: Client-side routing con lazy loading

### Styling

- **Tailwind CSS 4.2.1**: Utility-first CSS
- **CSS Modules personalizzati**: Per componenti specifici
- **Lucide React 0.575.0**: Icon library moderna

### Backend & Database

- **Firebase 12.10.0**: Backend-as-a-Service
  - **Authentication**: Email/password auth
  - **Firestore**: NoSQL real-time database
  - **Storage**: File storage
- **Security Rules**: Validazione server-side

### PWA

- **Service Worker**: Caching e offline support
- **Web App Manifest**: Installabilità

---

## Struttura del Progetto

```
civtracker/
├── public/                    # Static assets
│   ├── sw.js                 # Service Worker
│   └── site.webmanifest      # PWA manifest
│
├── src/
│   ├── components/           # React components
│   │   ├── common/          # Reusable components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── *Modal.jsx   # Specific modals
│   │   │   └── index.js
│   │   ├── layout/          # Layout components
│   │   │   ├── AuthLayout.jsx
│   │   │   └── index.js
│   │   └── ProtectedRoute.jsx
│   │
│   ├── contexts/            # Global state management
│   │   ├── AuthContext.jsx  # User authentication state
│   │   ├── ModalContext.jsx # Modal management
│   │   └── index.js
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js       # Auth state hook
│   │   ├── useCollection.js # Firestore collection hook
│   │   ├── useDocument.js   # Firestore document hook
│   │   ├── useFileUpload.js # File upload hook
│   │   └── index.js
│   │
│   ├── pages/               # Page components
│   │   ├── Auth/           # Login/Register page
│   │   ├── Home/           # Dashboard page
│   │   ├── Campaign/       # Campaign detail page
│   │   └── index.js
│   │
│   ├── services/            # External services
│   │   └── firebase/       # Firebase integration
│   │       ├── config.js   # Firebase config
│   │       ├── auth.js     # Auth service
│   │       ├── firestore.js # Database service
│   │       ├── storage.js  # Storage service
│   │       ├── campaigns.js # Campaign-specific logic
│   │       └── index.js
│   │
│   ├── utils/               # Utility functions
│   │   └── campaignUtils.js # Campaign helpers
│   │
│   ├── App.jsx              # Root component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
│
├── docs/                     # Documentation
├── firebase.json            # Firebase config
├── firestore.rules          # Firestore security rules
└── firestore.indexes.json   # Firestore indexes
```

---

## Design Patterns

### 1. **Component Composition**

I componenti sono costruiti seguendo il principio di composizione:

```jsx
// Layout component che wrappa children
<AuthLayout title="Welcome" subtitle="Login to continue">
  <LoginForm />
</AuthLayout>

// Modal component riutilizzabile
<Modal isOpen={open} onClose={handleClose} title="Profile">
  <ProfileContent />
</Modal>
```

**Vantaggi:**

- Riutilizzabilità
- Separazione delle responsabilità
- Testabilità

### 2. **Container/Presentational Pattern**

Separazione tra logica e presentazione:

```jsx
// Container (pages/Home/Home.jsx)
export function Home() {
  const { documents: campaigns } = useCollection("campaigns");
  const handleCreate = async (name) => {
    await createCampaign(name, user.uid, username);
  };
  return <HomeView campaigns={campaigns} onCreate={handleCreate} />;
}

// Presentational (components)
export function CampaignCard({ campaign, onClick }) {
  return <div onClick={onClick}>{campaign.name}</div>;
}
```

### 3. **Custom Hooks Pattern**

La logica riutilizzabile è estratta in custom hooks:

```jsx
// Hook per real-time data
function useCollection(collectionName, conditions) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      collectionName,
      setDocuments,
      conditions,
    );
    setLoading(false);
    return unsubscribe;
  }, [collectionName]);

  return { documents, loading };
}
```

**Vantaggi:**

- Logica riutilizzabile
- Facile testing
- Separazione concerns

### 4. **Context + Provider Pattern**

State globale gestito con Context API:

```jsx
// Context definition
const AuthContext = createContext(null);

// Provider component
export function AuthProvider({ children }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

// Consumer hook
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuthContext must be used within AuthProvider");
  return context;
}
```

**Vantaggi:**

- State condiviso senza prop drilling
- Facile accesso da qualsiasi component
- Type-safe con error checking

### 5. **Service Layer Pattern**

Logica backend separata in servizi modulari:

```javascript
// services/firebase/auth.js
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};
```

**Vantaggi:**

- Separazione frontend/backend logic
- Facile sostituzione servizi (mock per testing)
- Consistent error handling

### 6. **Render Props / Function as Child**

Pattern usato per componenti configurabili:

```jsx
<Modal
  footer={{
    onConfirm: handleSave,
    label: "Salva",
  }}
>
  <ModalContent />
</Modal>
```

---

## Data Flow

### 1. **Autenticazione Flow**

```
User Action → Auth Service → Firebase Auth → onAuthStateChanged
                                                      ↓
                                              AuthContext update
                                                      ↓
                                           All components re-render
                                                      ↓
                                            ProtectedRoute checks
                                                      ↓
                                        Redirect or render component
```

### 2. **Firestore Real-time Flow**

```
Component mount → useCollection/useDocument → subscribeToCollection
                                                        ↓
                                                  onSnapshot listener
                                                        ↓
                                              Firestore updates (any client)
                                                        ↓
                                              Callback with new data
                                                        ↓
                                              setState → re-render
```

### 3. **Modal Management Flow**

```
User opens modal → registerNestedClose → ModalContext adds to stack
                                                    ↓
                                        window.history.pushState
                                                    ↓
User presses back → popstate event → ModalContext intercepts
                                                    ↓
                                        Call close callback
                                                    ↓
                                        Modal closes
```

---

## State Management

### Global State (Context API)

**AuthContext:**

- `user`: Current user object
- `loading`: Auth initialization
- `error`: Auth errors

**ModalContext:**

- `modalStack`: Array di modali aperti
- `modalDepth`: Numero di modali aperti
- `registerNestedClose()`: Registra callback
- `closeTopModal()`: Chiude modal più alto

### Local State (useState)

Component-specific state:

- Form inputs
- UI states (open/closed)
- Loading states
- Validation errors

### Server State (Firestore)

Data sincronizzato con backend:

- Campaigns collection
- User profiles
- Real-time updates

---

## Security Architecture

### 1. **Client-side Validation**

```jsx
const validateForm = () => {
  const errors = {};
  if (!email.includes("@")) errors.email = "Email non valida";
  if (password.length < 6) errors.password = "Minimo 6 caratteri";
  return errors;
};
```

### 2. **Server-side Rules (Firestore)**

```javascript
match /campaigns/{campaignId} {
  allow read: if request.auth != null &&
              request.auth.uid in resource.data.members;

  allow update: if request.auth != null &&
                request.auth.uid in resource.data.members;
}
```

### 3. **Protected Routing**

```jsx
<Route
  path="/home"
  element={
    <ProtectedRoute>
      <Home />
    </ProtectedRoute>
  }
/>
```

**Security Layers:**

1. Client validation (UX)
2. Firebase Auth (identity)
3. Firestore Rules (authorization)
4. Protected Routes (navigation)

---

## Performance Optimizations

### 1. **Code Splitting**

React Router loader per lazy loading:

```jsx
const Campaign = lazy(() => import("./pages/Campaign"));
```

### 2. **Memoization**

```jsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => handleClick(), [deps]);
```

### 3. **Firestore Query Optimization**

```javascript
// Query solo campagne dell'utente (server-side filter)
useCollection("campaigns", [
  {
    type: "where",
    field: "members",
    operator: "array-contains",
    value: userId,
  },
]);
```

### 4. **Service Worker Caching**

```javascript
// Cache-first strategy per asset statici
const CACHE_NAME = "civtracker-v1";
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request)),
  );
});
```

### 5. **Real-time Listener Cleanup**

```jsx
useEffect(() => {
  const unsubscribe = subscribeToCollection("campaigns", callback);
  return () => unsubscribe(); // Cleanup on unmount
}, []);
```

---

## Error Handling

### Consistent Error Pattern

Tutti i servizi ritornano oggetti con struttura:

```javascript
{ data/user/campaign: result | null, error: string | null }
```

### Error Boundaries (Future)

```jsx
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

### User-Friendly Messages

```javascript
// Error mapping
const errorMessages = {
  "auth/user-not-found": "Utente non trovato",
  "auth/wrong-password": "Password errata",
  default: "Si è verificato un errore",
};
```

---

## Testing Strategy (Future Implementation)

### Unit Tests

- Utility functions
- Custom hooks
- Services

### Integration Tests

- Component interactions
- Form submissions
- Navigation flows

### E2E Tests

- Complete user flows
- Critical paths (auth, create campaign)

---

## Scalability Considerations

### Current Architecture Supports:

✅ **Horizontal Scaling**: Firebase auto-scales  
✅ **Real-time Updates**: Firestore subscriptions  
✅ **Offline Support**: Service Worker + Firestore cache  
✅ **Modular Code**: Easy to add new features

### Future Enhancements:

🔮 **State Management**: Consider Zustand/Redux for complex state  
🔮 **Code Organization**: Feature-based folders  
🔮 **Micro-frontends**: Split large features  
🔮 **GraphQL**: For complex queries (Firebase Extensions)

---

## Browser Compatibility

**Target Browsers:**

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari iOS 14+
- Chrome Android 90+

**Polyfills:** Vite include automatic polyfills per target

---

## Dependencies Rationale

| Dependency       | Perché Scelto                                    |
| ---------------- | ------------------------------------------------ |
| **React 19**     | Latest features, performance, Concurrent mode    |
| **Vite**         | Build veloce, HMR istantaneo, ottimo DX          |
| **Firebase**     | Backend-as-a-Service completo, real-time, scales |
| **Tailwind CSS** | Rapid development, consistency, responsive       |
| **Lucide React** | Icons moderne, tree-shakeable, React-first       |
| **React Router** | Standard de facto, type-safe, nested routes      |

---

## Maintenance

### Code Quality Tools

- **ESLint**: Linting con regole React
- **Prettier** (opzionale): Code formatting
- **Git hooks** (future): Pre-commit checks

### Documentation

- **Code comments**: Per logica complessa
- **JSDoc**: Per funzioni pubbliche
- **README**: Overview e quick start
- **Docs folder**: Documentazione dettagliata

---

## Conclusioni

L'architettura di CivTracker è progettata per:

✅ **Mantenibilità**: Codice modulare e separato  
✅ **Scalabilità**: Supporto crescita utenti e features  
✅ **Performance**: Ottimizzazioni multiple livelli  
✅ **Developer Experience**: Setup veloce, hot reload  
✅ **User Experience**: Real-time, offline, responsive

Per domande specifiche sull'implementazione, consulta:

- [API Reference](API_REFERENCE.md)
- [Developer Guide](DEVELOPER_GUIDE.md)
- [Components](COMPONENTS.md)
