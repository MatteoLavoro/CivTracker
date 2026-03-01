# 🧩 Componenti CivTracker

Documentazione completa dei componenti riutilizzabili di CivTracker.

## Indice

- [Common Components](#common-components)
  - [Button](#button)
  - [Input](#input)
  - [Modal](#modal)
  - [TextInputModal](#textinputmodal)
  - [ConfirmModal](#confirmmodal)
  - [ProfileModal](#profilemodal)
  - [CampaignInfoModal](#campaigninfomodal)
  - [InstallPrompt](#installprompt)
- [Layout Components](#layout-components)
  - [AuthLayout](#authlayout)
- [Routing Components](#routing-components)
  - [ProtectedRoute](#protectedroute)

---

## Common Components

### Button

**Path:** `src/components/common/Button.jsx`

Componente bottone riutilizzabile con varianti e stati.

#### Props

| Prop        | Type      | Default     | Descrizione                                 |
| ----------- | --------- | ----------- | ------------------------------------------- |
| `children`  | ReactNode | -           | Contenuto del bottone                       |
| `onClick`   | function  | -           | Handler click                               |
| `type`      | string    | `'button'`  | Type HTML: 'button', 'submit', 'reset'      |
| `variant`   | string    | `'primary'` | Variante: 'primary', 'secondary', 'outline' |
| `disabled`  | boolean   | `false`     | Stato disabilitato                          |
| `fullWidth` | boolean   | `false`     | Bottone a larghezza piena                   |
| `loading`   | boolean   | `false`     | Mostra spinner di loading                   |
| `className` | string    | `''`        | Classi CSS aggiuntive                       |

#### Varianti

**Primary** - Azioni principali

```jsx
<Button variant="primary" onClick={handleSave}>
  Salva
</Button>
```

- Background: `rgba(15, 50, 82, 1)`
- Hover: Più chiaro
- Uso: Azioni principali, conferme

**Secondary** - Azioni alternative

```jsx
<Button variant="secondary" onClick={handleCancel}>
  Annulla
</Button>
```

- Background: Grigio scuro
- Uso: Azioni secondarie, annullamenti

**Outline** - Azioni terziarie

```jsx
<Button variant="outline" onClick={handleEdit}>
  Modifica
</Button>
```

- Background: Trasparente con bordo
- Uso: Azioni meno importanti

#### Stati

**Loading**

```jsx
<Button loading={isSubmitting}>{isSubmitting ? "Salvando..." : "Salva"}</Button>
```

**Disabled**

```jsx
<Button disabled={!isValid}>Continua</Button>
```

#### Esempio Completo

```jsx
import { Button } from "./components/common";

function MyForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await saveData();
    setLoading(false);
  };

  return (
    <Button
      type="submit"
      variant="primary"
      fullWidth
      loading={loading}
      onClick={handleSubmit}
    >
      Salva Modifiche
    </Button>
  );
}
```

---

### Input

**Path:** `src/components/common/Input.jsx`

Componente input con validazione integrata, icone, e gestione errori.

#### Props

| Prop          | Type      | Default  | Descrizione           |
| ------------- | --------- | -------- | --------------------- |
| `label`       | string    | -        | Label del campo       |
| `type`        | string    | `'text'` | Type HTML input       |
| `value`       | string    | -        | Valore controllato    |
| `onChange`    | function  | -        | Handler cambio valore |
| `placeholder` | string    | `''`     | Placeholder text      |
| `error`       | string    | `null`   | Messaggio errore      |
| `required`    | boolean   | `false`  | Campo obbligatorio    |
| `disabled`    | boolean   | `false`  | Campo disabilitato    |
| `icon`        | ReactNode | `null`   | Icona da mostrare     |
| `maxLength`   | number    | -        | Lunghezza massima     |
| `className`   | string    | `''`     | Classi CSS aggiuntive |

#### Features

**Validazione con Errori**

```jsx
<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
/>
```

**Password con Toggle Visibilità**

```jsx
<Input
  label="Password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>
```

- Mostra automaticamente icona occhio
- Click per toggle visibilità

**Con Icona**

```jsx
<Input
  label="Username"
  icon={<User size={20} />}
  value={username}
  onChange={handleChange}
/>
```

#### Styling

- **Focus**: Bordo blu animato
- **Error**: Bordo rosso + messaggio sotto
- **Disabled**: Opacità 50%
- **Mobile**: Font-size 16px (previene zoom iOS)

#### Esempio Form Completo

```jsx
import { Input } from "./components/common";
import { Mail, User, Lock } from "lucide-react";

function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    setErrors({ ...errors, [field]: "" }); // Clear error
  };

  return (
    <form>
      <Input
        label="Email"
        type="email"
        icon={<Mail size={20} />}
        value={formData.email}
        onChange={handleChange("email")}
        error={errors.email}
        placeholder="your@email.com"
        required
      />

      <Input
        label="Username"
        icon={<User size={20} />}
        value={formData.username}
        onChange={handleChange("username")}
        error={errors.username}
        maxLength={30}
        required
      />

      <Input
        label="Password"
        type="password"
        icon={<Lock size={20} />}
        value={formData.password}
        onChange={handleChange("password")}
        error={errors.password}
        required
      />
    </form>
  );
}
```

---

### Modal

**Path:** `src/components/common/Modal.jsx`

Componente modale generico con gestione history browser e supporto nested modals.

#### Props

| Prop        | Type      | Default | Descrizione                        |
| ----------- | --------- | ------- | ---------------------------------- |
| `isOpen`    | boolean   | -       | Stato aperto/chiuso                |
| `onClose`   | function  | -       | Handler chiusura                   |
| `title`     | string    | -       | Titolo modale                      |
| `children`  | ReactNode | -       | Contenuto body                     |
| `footer`    | object    | `null`  | Configurazione footer (vedi sotto) |
| `className` | string    | `''`    | Classi CSS aggiuntive              |

#### Footer Configuration

```javascript
footer={{
  onConfirm: handleSave,        // Handler conferma
  disabled: !isValid,           // Disabilita bottone
  dangerous: true,              // Mostra confirm nested
  label: "Salva",              // Label desktop
  icon: <Save size={20} />,    // Icon mobile FAB
  dangerousMessage: "Sicuro?"  // Messaggio confirm
}}
```

#### Features

**Gestione History**

- Registra con `ModalContext`
- Browser back button chiude modale
- Support per nested modals

**Responsive**

- **Desktop**: Centered dialog con backdrop
- **Mobile**: Full-screen con header sticky

**Keyboard**

- **Escape**: Chiude modale (gestito da Context)

**Body Scroll Lock**

- Previene scroll when open
- Ripristina position on close

#### Esempi

**Modal Semplice**

```jsx
import { Modal } from "./components/common";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    window.history.back(); // Usa history per chiudere
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Apri</button>

      <Modal isOpen={isOpen} onClose={handleClose} title="Informazioni">
        <p>Contenuto del modale</p>
      </Modal>
    </>
  );
}
```

**Modal con Footer**

```jsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Modifica Profilo"
  footer={{
    onConfirm: handleSave,
    disabled: !isValid,
    label: "Salva Modifiche",
  }}
>
  <ProfileForm data={profile} onChange={setProfile} />
</Modal>
```

**Azione Pericolosa con Conferma**

```jsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Elimina Account"
  footer={{
    onConfirm: handleDelete,
    dangerous: true,
    dangerousMessage: "Eliminare definitivamente l'account?",
    label: "Elimina",
  }}
>
  <p>Questa azione non può essere annullata.</p>
</Modal>
```

---

### TextInputModal

**Path:** `src/components/common/TextInputModal.jsx`

Modal specializzato per input di testo con validazione.

#### Props

| Prop               | Type     | Default      | Descrizione                     |
| ------------------ | -------- | ------------ | ------------------------------- |
| `isOpen`           | boolean  | -            | Stato aperto/chiuso             |
| `onClose`          | function | -            | Handler chiusura                |
| `onConfirm`        | function | -            | Handler conferma (riceve value) |
| `title`            | string   | -            | Titolo modale                   |
| `label`            | string   | -            | Label input                     |
| `placeholder`      | string   | `''`         | Placeholder                     |
| `maxLength`        | number   | `100`        | Lunghezza massima               |
| `minLength`        | number   | `1`          | Lunghezza minima                |
| `confirmLabel`     | string   | `'Conferma'` | Label bottone conferma          |
| `customValidation` | function | `null`       | Funzione validazione custom     |

#### Validazione

**Built-in:**

- Min/max length
- Required (sempre attivo)

**Custom:**

```jsx
<TextInputModal
  customValidation={(value) => {
    if (value.includes("@")) return false; // Invalid
    return true; // Valid
  }}
/>
```

#### Esempio Uso

**Crea Campagna**

```jsx
<TextInputModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleCreate}
  title="Nuova Campagna"
  label="Nome Campagna"
  placeholder="Es: Campagna Italia"
  maxLength={50}
  minLength={3}
  confirmLabel="Crea"
/>
```

**Join Campagna con Codice**

```jsx
<TextInputModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleJoin}
  title="Unisciti a Campagna"
  label="Codice Campagna"
  placeholder="ABC12345"
  maxLength={8}
  minLength={8}
  confirmLabel="Unisciti"
  customValidation={(code) => /^[A-Z0-9]{8}$/.test(code)}
/>
```

---

### ProfileModal

**Path:** `src/components/common/ProfileModal.jsx`

Modal per gestione profilo utente.

#### Props

| Prop               | Type     | Default | Descrizione                    |
| ------------------ | -------- | ------- | ------------------------------ |
| `isOpen`           | boolean  | -       | Stato aperto/chiuso            |
| `onClose`          | function | -       | Handler chiusura               |
| `user`             | object   | -       | Oggetto utente Firebase        |
| `onUpdateUsername` | function | -       | Handler aggiornamento username |
| `onLogout`         | function | -       | Handler logout                 |

#### Features

- Mostra email utente
- Edit username (max 30 caratteri)
- Avatar con iniziali
- Bottone logout

#### Esempio

```jsx
import { ProfileModal } from "./components/common";

function Header() {
  const { user } = useAuthContext();
  const [modalOpen, setModalOpen] = useState(false);

  const handleUpdateUsername = async (newUsername) => {
    const { error } = await updateUserProfile(newUsername);
    if (error) alert("Errore");
  };

  const handleLogout = async () => {
    await logOut();
    navigate("/");
  };

  return (
    <>
      <button onClick={() => setModalOpen(true)}>Profilo</button>

      <ProfileModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        user={user}
        onUpdateUsername={handleUpdateUsername}
        onLogout={handleLogout}
      />
    </>
  );
}
```

---

### CampaignInfoModal

**Path:** `src/components/common/CampaignInfoModal.jsx`

Modal per informazioni e gestione campagna.

#### Props

| Prop              | Type     | Default | Descrizione                |
| ----------------- | -------- | ------- | -------------------------- |
| `isOpen`          | boolean  | -       | Stato aperto/chiuso        |
| `onClose`         | function | -       | Handler chiusura           |
| `campaign`        | object   | -       | Oggetto campagna           |
| `onUpdateName`    | function | -       | Handler aggiornamento nome |
| `onLeaveCampaign` | function | -       | Handler uscita             |

#### Features

- Mostra nome campagna (editabile)
- Codice condivisibile con bottone copia
- Conteggio membri
- Bottone "Esci" (dangerous action)

#### Esempio

```jsx
<CampaignInfoModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  campaign={selectedCampaign}
  onUpdateName={async (newName) => {
    await updateCampaignName(campaign.id, newName);
  }}
  onLeaveCampaign={async () => {
    await leaveCampaign(campaign.id, user.uid);
    navigate("/home");
  }}
/>
```

---

### InstallPrompt

**Path:** `src/components/common/InstallPrompt.jsx`

Componente per prompt installazione PWA.

#### Props

Nessuna prop - auto-gestito internamente.

#### Features

**Android/Chrome:**

- Cattura evento `beforeinstallprompt`
- Mostra popup con bottone "Installa App"
- Installazione one-click

**iOS/Safari:**

- Mostra istruzioni step-by-step
- Icone visive per guidare utente
- Spiega share button e "Add to Home"

**Logica Visualizzazione:**

- Solo primo accesso (localStorage)
- Solo mobile (< 768px)
- Solo se non già installato

#### Uso

```jsx
// In App.jsx
import { InstallPrompt } from "./components/common";

function App() {
  return (
    <>
      <InstallPrompt />
      <BrowserRouter>{/* routes */}</BrowserRouter>
    </>
  );
}
```

---

## Layout Components

### AuthLayout

**Path:** `src/components/layout/AuthLayout.jsx`

Layout wrapper per pagine di autenticazione.

#### Props

| Prop       | Type      | Default | Descrizione             |
| ---------- | --------- | ------- | ----------------------- |
| `children` | ReactNode | -       | Contenuto pagina        |
| `title`    | string    | -       | Titolo principale       |
| `subtitle` | string    | -       | Sottotitolo descrittivo |

#### Features

- Centered container
- Glassmorphism card
- Logo e branding
- Responsive

#### Esempio

```jsx
import { AuthLayout } from "./components/layout";

function LoginPage() {
  return (
    <AuthLayout title="Bentornato" subtitle="Accedi per continuare">
      <LoginForm />
    </AuthLayout>
  );
}
```

---

## Routing Components

### ProtectedRoute

**Path:** `src/components/ProtectedRoute.jsx`

Wrapper per route che richiedono autenticazione.

#### Props

| Prop       | Type      | Default | Descrizione              |
| ---------- | --------- | ------- | ------------------------ |
| `children` | ReactNode | -       | Componente da proteggere |

#### Behavior

1. Controlla `user` da `AuthContext`
2. Se non autenticato → Redirect `/`
3. Durante loading → Mostra spinner
4. Se autenticato → Render children

#### Esempio

```jsx
import { ProtectedRoute } from './components/ProtectedRoute';

// In App.jsx routes
<Route
  path="/home"
  element={
    <ProtectedRoute>
      <Home />
    </ProtectedRoute>
  }
/>

<Route
  path="/campaign/:id"
  element={
    <ProtectedRoute>
      <Campaign />
    </ProtectedRoute>
  }
/>
```

---

## Best Practices

### 1. Import da Index

```jsx
// ✅ Corretto
import { Button, Input, Modal } from "./components/common";

// ❌ Evitare
import Button from "./components/common/Button";
import Input from "./components/common/Input";
```

### 2. Controlled Components

```jsx
// ✅ Sempre controlled
const [value, setValue] = useState('');
<Input value={value} onChange={(e) => setValue(e.target.value)} />

// ❌ Evitare uncontrolled
<Input defaultValue="test" />
```

### 3. Error Handling

```jsx
// ✅ Gestisci errori
const [error, setError] = useState("");
<Input error={error} />;

// ✅ Clear errors on change
const handleChange = (e) => {
  setValue(e.target.value);
  setError(""); // Clear error
};
```

### 4. Loading States

```jsx
// ✅ Mostra loading durante async
const [loading, setLoading] = useState(false);
<Button loading={loading}>Save</Button>;
```

### 5. Modal History

```jsx
// ✅ Usa history.back() per chiudere
const handleClose = () => {
  window.history.back();
};

// ❌ Non impostare direttamente isOpen
const handleClose = () => {
  setIsOpen(false); // Bypassa history!
};
```

---

## Styling Guidelines

### CSS Modules

Ogni componente ha il proprio file `.css`:

```jsx
import "./Button.css";

export function Button({ variant }) {
  return <button className={`btn btn-${variant}`}>Click</button>;
}
```

### Tailwind Classes

Usa Tailwind per utility rapide:

```jsx
<div className="flex items-center gap-4 p-4">
  <Button />
</div>
```

### Responsive

Mobile-first approach:

```css
/* Mobile */
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
    width: 33%;
  }
}
```

---

## Accessibilità

### ARIA Labels

```jsx
<button aria-label="Chiudi modale" onClick={onClose}>
  <X size={20} />
</button>
```

### Keyboard Navigation

- `Tab`: Navigazione focus
- `Enter`/`Space`: Attivazione buttons
- `Escape`: Chiusura modali (gestita da Context)

### Semantic HTML

```jsx
// ✅ Semantic
<header>, <main>, <footer>
<button type="button">

// ❌ Non-semantic
<div onClick={handleClick}>Click</div>
```

---

## Testing (Future)

### Unit Tests

```jsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

test("renders button with text", () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText("Click me")).toBeInTheDocument();
});

test("calls onClick when clicked", () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click</Button>);
  fireEvent.click(screen.getByText("Click"));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

---

Per maggiori dettagli su hooks e contexts, consulta:

- [Hooks Documentation](HOOKS.md)
- [Contexts Documentation](CONTEXTS.md)
- [API Reference](API_REFERENCE.md)
