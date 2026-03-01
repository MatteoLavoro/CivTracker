# 🌐 Contexts CivTracker

Documentazione completa dei React Contexts per la gestione dello stato globale.

## Indice

- [AuthContext](#authcontext)
- [ModalContext](#modalcontext)

---

## AuthContext

**Path:** `src/contexts/AuthContext.jsx`

Context per gestione stato di autenticazione globale.

### Struttura

```javascript
// Context creation
const AuthContext = createContext(null);

// Provider component
export function AuthProvider({ children }) {
  const auth = useAuth(); // Custom hook
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

// Consumer hook
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
```

### Provider Setup

```jsx
// In main.jsx
import { AuthProvider } from "./contexts";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
```

### Context Value

```javascript
{
  user: {
    uid: "unique-user-id",
    email: "user@example.com",
    displayName: "Nome Utente",
    emailVerified: boolean,
    photoURL: string | null,
    // ...altri campi Firebase User
  } | null,

  loading: boolean,  // true durante inizializzazione
  error: string | null
}
```

### Usage

```jsx
import { useAuthContext } from "./contexts";

function MyComponent() {
  const { user, loading, error } = useAuthContext();

  if (loading) {
    return <div>Caricamento autenticazione...</div>;
  }

  if (error) {
    return <div>Errore: {error}</div>;
  }

  if (!user) {
    return (
      <div>
        Non autenticato - <a href="/">Login</a>
      </div>
    );
  }

  return (
    <div>
      <h1>Benvenuto, {user.displayName || user.email}!</h1>
      <p>UID: {user.uid}</p>
    </div>
  );
}
```

### Esempi Comuni

**Check Authentication Status**

```jsx
function Header() {
  const { user } = useAuthContext();

  return (
    <header>
      {user ? (
        <div>
          <span>Ciao, {user.displayName}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <a href="/">Login</a>
      )}
    </header>
  );
}
```

**Conditional Rendering**

```jsx
function Dashboard() {
  const { user, loading } = useAuthContext();

  if (loading) return <Spinner />;

  return (
    <div>
      <h1>Dashboard di {user.displayName}</h1>
      {/* content */}
    </div>
  );
}
```

**Get User Info**

```jsx
function UserProfile() {
  const { user } = useAuthContext();

  const getUserInitials = () => {
    if (user?.displayName) {
      const names = user.displayName.split(" ");
      return names.length >= 2
        ? (names[0][0] + names[1][0]).toUpperCase()
        : user.displayName.substring(0, 2).toUpperCase();
    }
    return user?.email?.substring(0, 2).toUpperCase() || "U";
  };

  return <div className="avatar">{getUserInitials()}</div>;
}
```

**Protected Component**

```jsx
function ProtectedContent() {
  const { user } = useAuthContext();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <div>Protected content here</div>;
}
```

### Real-time Updates

Il context si aggiorna automaticamente quando:

- Utente fa login
- Utente fa logout
- Token viene refreshato
- Profilo utente viene modificato

```jsx
function RealtimeUserDisplay() {
  const { user } = useAuthContext();

  // Se l'utente aggiorna il displayName in un'altra tab,
  // questo componente si aggiorna automaticamente!

  return <div>{user?.displayName}</div>;
}
```

### Error Handling

```jsx
function AuthStatus() {
  const { user, loading, error } = useAuthContext();

  if (error) {
    return (
      <div className="error">
        <p>Errore autenticazione: {error}</p>
        <button onClick={() => window.location.reload()}>Riprova</button>
      </div>
    );
  }

  // ...resto del componente
}
```

### Best Practices

**✅ DO:**

```jsx
// Usa il context provider hook
import { useAuthContext } from "./contexts";
const { user } = useAuthContext();

// Controlla sempre loading prima di usare user
if (loading) return <Spinner />;
if (!user) return <Login />;
```

**❌ DON'T:**

```jsx
// Non usare direttamente useAuth (crea subscribe multipli)
import { useAuth } from "./hooks";
const { user } = useAuth(); // ❌

// Non assumere che user esista senza check
const name = user.displayName; // ❌ Può essere null!
const name = user?.displayName || "Guest"; // ✅
```

### Integration con Protected Routes

```jsx
// In ProtectedRoute.jsx
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// In App.jsx
<Route
  path="/home"
  element={
    <ProtectedRoute>
      <Home />
    </ProtectedRoute>
  }
/>;
```

---

## ModalContext

**Path:** `src/contexts/ModalContext.jsx`

Context per gestione centralizzata dei modali con supporto nested modals e browser history.

### Features

- **Modal Stack**: Traccia modali aperti
- **Nested Modals**: Supporto modali annidati
- **Browser History**: Integrazione con back button
- **Escape Key**: Chiusura con Escape
- **Body Scroll Lock**: Previene scroll durante modale aperto
- **Z-index Dinamico**: Calcolo automatico per modali sovrapposti

### Struttura

```javascript
const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
  const [modalStack, setModalStack] = useState([]);
  const nestedCloseCallbacksRef = useRef([]);

  // ...logic

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
```

### Provider Setup

```jsx
// In main.jsx
import { AuthProvider, ModalProvider } from "./contexts";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ModalProvider>
        <App />
      </ModalProvider>
    </AuthProvider>
  </StrictMode>,
);
```

### Context Value

```javascript
{
  // State
  modalStack: [],           // Array of open modals
  modalDepth: 0,           // Number of open modals

  // Methods
  openModal: (modalId, props) => void,
  closeModal: () => void,
  closeAllModals: () => void,
  closeTopModal: () => void,
  registerNestedClose: (callback) => unregister,
  hasNestedModals: () => boolean,
  wasPopstateHandled: () => boolean,
  isModalOpen: (modalId) => boolean,
  getModalIndex: (modalId) => number
}
```

### Methods

#### openModal(modalId, props)

Apri un modale gestito dal context.

```jsx
const { openModal } = useModal();

openModal("confirmDelete", {
  itemId: "123",
  itemName: "Campaign XYZ",
});
```

#### closeModal()

Chiudi l'ultimo modale dallo stack.

```jsx
const { closeModal } = useModal();

<button onClick={closeModal}>Chiudi</button>;
```

#### closeAllModals()

Chiudi tutti i modali aperti.

```jsx
const { closeAllModals } = useModal();

const handleLogout = () => {
  closeAllModals();
  logOut();
};
```

#### closeTopModal()

Chiudi il modale più in alto (nested o normale).

```jsx
const { closeTopModal } = useModal();

// Chiude automaticamente il modale corretto
closeTopModal();
```

#### registerNestedClose(callback)

Registra un callback per modale annidato. Usato internamente da `Modal` component.

```jsx
useEffect(() => {
  if (!isOpen) return;

  const unregister = registerNestedClose(() => {
    onClose();
  });

  window.history.pushState({ nestedModal: true }, "");

  return () => unregister();
}, [isOpen, registerNestedClose]);
```

### Usage Examples

**Basic Modal Management**

```jsx
import { useModal } from "./contexts";

function MyComponent() {
  const { modalDepth, hasNestedModals } = useModal();

  return (
    <div>
      <p>Modali aperti: {modalDepth}</p>
      {hasNestedModals() && <p>Ci sono modali annidati</p>}
    </div>
  );
}
```

**Automatic Modal (Common Pattern)**

La maggior parte dei modali usa il pattern automatico con `Modal` component:

```jsx
import { Modal } from "./components/common";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  // Modal component gestisce automaticamente registerNestedClose

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Apri Modale</button>

      <Modal
        isOpen={isOpen}
        onClose={() => window.history.back()}
        title="Il Mio Modale"
      >
        <p>Contenuto</p>
      </Modal>
    </>
  );
}
```

**Nested Modals**

```jsx
function ParentModal() {
  const [childOpen, setChildOpen] = useState(false);

  return (
    <Modal isOpen={parentOpen} onClose={handleClose} title="Parent">
      <p>Parent content</p>
      <button onClick={() => setChildOpen(true)}>Apri Child Modal</button>

      <Modal
        isOpen={childOpen}
        onClose={() => window.history.back()}
        title="Child"
      >
        <p>Child content</p>
      </Modal>
    </Modal>
  );
}
```

**Close All on Logout**

```jsx
function LogoutButton() {
  const { closeAllModals } = useModal();
  const navigate = useNavigate();

  const handleLogout = async () => {
    closeAllModals(); // Chiudi tutti i modali
    await logOut();
    navigate("/");
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

**Check if Modal Open**

```jsx
function MyComponent() {
  const { isModalOpen, modalDepth } = useModal();

  if (modalDepth > 0) {
    console.log("Almeno un modale è aperto");
  }

  // Nota: isModalOpen funziona solo per modali nel modalStack
  // (non per nested modals gestiti localmente)
}
```

### Z-index Management

Il context calcola automaticamente z-index per modali:

```javascript
// Base z-index: 1000
// Ogni livello aggiunge +10
// Modali di conferma aggiungono +10 rispetto al parent

Modal level 0: z-index 1000
Modal level 1: z-index 1010
Confirm modal: z-index parent + 10
```

**Nel Modal component:**

```jsx
function Modal({ isOpen }) {
  const { modalDepth } = useModal();

  const zIndex = 1000 + modalDepth * 10;

  return <div style={{ zIndex }}>{/* modal content */}</div>;
}
```

### Browser History Integration

**Funzionamento:**

1. Modale apre → `window.history.pushState()`
2. User preme back → `popstate` event
3. Context intercetta evento
4. Chiama callback del modale più alto
5. Modale si chiude

**Code Example:**

```jsx
// Automatico nel Modal component
useEffect(() => {
  if (!isOpen) return;

  // Registra con context
  const unregister = registerNestedClose(() => {
    onClose();
  });

  // Aggiungi history entry
  window.history.pushState({ nestedModal: true }, "");

  // Cleanup
  return () => unregister();
}, [isOpen]);
```

### Body Scroll Lock

Il context gestisce automaticamente lo scroll lock:

```javascript
// Modal apre
document.body.classList.add("modal-open");

// Modal chiude
if (modalStack.length === 0) {
  document.body.classList.remove("modal-open");
}
```

**CSS:**

```css
body.modal-open {
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
}
```

### Keyboard Handling

**Escape Key:**

```javascript
useEffect(() => {
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      closeTopModal();
    }
  };

  window.addEventListener("keydown", handleEscape);
  return () => window.removeEventListener("keydown", handleEscape);
}, []);
```

### Best Practices

**✅ DO:**

```jsx
// Usa window.history.back() per chiudere modali
const handleClose = () => {
  window.history.back();
};

// Lascia che Modal component gestisca registerNestedClose
<Modal isOpen={open} onClose={handleClose}>
  {/* content */}
</Modal>;
```

**❌ DON'T:**

```jsx
// Non impostare isOpen direttamente (bypassa history)
const handleClose = () => {
  setIsOpen(false); // ❌ Bypassa history management
};

// Non chiamare registerNestedClose manualmente
// (a meno che non stai creando un custom modal component)
```

### Error Prevention

Il context include error checking:

```javascript
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
```

Questo previene uso accidentale fuori dal ModalProvider.

### Debugging

**Check Modal State:**

```jsx
function DebugModalState() {
  const { modalStack, modalDepth, hasNestedModals } = useModal();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        right: 0,
        background: "black",
        color: "white",
        padding: "10px",
      }}
    >
      <p>Modal Depth: {modalDepth}</p>
      <p>Stack: {JSON.stringify(modalStack.map((m) => m.id))}</p>
      <p>Has Nested: {hasNestedModals() ? "Yes" : "No"}</p>
    </div>
  );
}
```

---

## Context Composition

I contexts sono composti in ordine di dipendenza:

```jsx
<AuthProvider>
  {" "}
  {/* Primo - Auth base */}
  <ModalProvider>
    {" "}
    {/* Secondo - Può usare auth */}
    <App /> {/* Può usare entrambi */}
  </ModalProvider>
</AuthProvider>
```

### Multiple Contexts in Component

```jsx
function MyComponent() {
  const { user } = useAuthContext();
  const { modalDepth } = useModal();

  return (
    <div>
      <p>User: {user?.email}</p>
      <p>Modals: {modalDepth}</p>
    </div>
  );
}
```

---

## Performance Considerations

### Context Re-renders

**Context Provider re-renders tutti i consumers quando value cambia.**

**AuthContext** - Ottimizzato:

```jsx
// Value è stabile (object from useAuth)
const auth = useAuth();
return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
```

**ModalContext** - Ottimizzato:

```jsx
// useMemo per value stabile
const contextValue = useMemo(
  () => ({
    modalStack,
    modalDepth,
    openModal,
    closeModal,
    // ...
  }),
  [modalStack, modalDepth /* dependencies */],
);

return (
  <ModalContext.Provider value={contextValue}>{children}</ModalContext.Provider>
);
```

### Selective Subscription

```jsx
// ❌ Re-render su ogni cambio context
function MyComponent() {
  const { user, loading, error } = useAuthContext();
  return <div>{user?.email}</div>;
}

// ✅ Stessa cosa, ma più chiaro
function MyComponent() {
  const { user } = useAuthContext(); // Usa solo user
  return <div>{user?.email}</div>;
}
```

---

## Testing Contexts (Future)

```jsx
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "./contexts";

function TestComponent() {
  const { user } = useAuthContext();
  return <div>{user ? "Logged in" : "Not logged in"}</div>;
}

test("provides auth context", () => {
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>,
  );

  expect(screen.getByText("Not logged in")).toBeInTheDocument();
});
```

---

## Troubleshooting

### "useAuthContext must be used within an AuthProvider"

**Causa:** Component usa `useAuthContext` fuori da `<AuthProvider>`

**Soluzione:**

```jsx
// In main.jsx, assicurati che AuthProvider wrappi App
<AuthProvider>
  <App />
</AuthProvider>
```

### "useModal must be used within a ModalProvider"

**Causa:** Component usa `useModal` fuori da `<ModalProvider>`

**Soluzione:**

```jsx
<ModalProvider>
  <App />
</ModalProvider>
```

### Modals non si chiudono con back button

**Causa:** Modal non registra correttamente con context

**Soluzione:** Usa `Modal` component che gestisce automaticamente:

```jsx
<Modal isOpen={open} onClose={() => window.history.back()}>
  {/* content */}
</Modal>
```

---

Per maggiori dettagli, consulta:

- [Hooks Documentation](HOOKS.md)
- [Components Documentation](COMPONENTS.md)
- [Architecture Documentation](ARCHITECTURE.md)
