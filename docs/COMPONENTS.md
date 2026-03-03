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
  - [CampaignStatusModal](#campaignstatusmodal)
  - [ResultsModal](#resultsmodal)
  - [LeaderPoolModal](#leaderpoolmodal)
  - [VictoryInfoModal](#victoryinfomodal)
  - [RulesModal](#rulesmodal)
  - [CompleteMatchModal](#completematchmodal)
  - [BonusInfoModal](#bonusinfomodal)
  - [DraftModal](#draftmodal)
  - [LeaderConfirmModal](#leaderconfirmmodal)
  - [MatchRow](#matchrow)
  - [AddMatchButton](#addmatchbutton)
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

#### Varianti

| Variant     | Uso                    | Stile                           |
| ----------- | ---------------------- | ------------------------------- |
| `primary`   | Azioni principali      | Blu scuro `rgba(15, 50, 82, 1)` |
| `secondary` | Azioni secondarie      | Grigio scuro                    |
| `outline`   | Azioni meno importanti | Trasparente con bordo           |

#### Esempio

```jsx
<Button variant="primary" loading={isSaving} onClick={handleSave}>
  {isSaving ? "Salvando..." : "Salva"}
</Button>
```

````

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

#### Features

- **Validazione**: Mostra errore con bordo rosso e messaggio
- **Password Toggle**: Icona occhio per visibilità automatica
- **Icons**: Supporto icone left-aligned
- **Mobile-friendly**: Font-size 16px previene zoom iOS

#### Esempio

```jsx
import { Input } from "./components/common";
import { Mail, Lock } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  return (
    <form>
      <Input
        label="Email"
        type="email"
        icon={<Mail size={20} />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
      />
      <Input
        label="Password"
        type="password"
        icon={<Lock size={20} />}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        required
      />
    </form>
  );
}
````

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
  **Keyboard & Browser**

- **Escape**: Chiude modale (gestito da Context)
- **History**: Browser back button chiude modale

**Body Scroll Lock**: Previene scroll della pagina quando modale è aperto

#### Esempio

```jsx
import { Modal } from "./components/common";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Apri</button>

      <Modal
        isOpen={isOpen}
        onClose={() => window.history.back()}
        title="Modifica Profilo"
        footer={{
          onConfirm: handleSave,
          disabled: !isValid,
          label: "Salva",
          dangerous: true, // Mostra conferma nested
          dangerousMessage: "Salvare le modifiche?",
        }}
      >
        <ProfileForm data={profile} onChange={setProfile} />
      </Modal>
    </>
  );
}
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

Modal per visualizzare e gestire informazioni campagna.

#### Props

| Prop              | Type     | Default | Descrizione                |
| ----------------- | -------- | ------- | -------------------------- |
| `isOpen`          | boolean  | -       | Stato aperto/chiuso        |
| `onClose`         | function | -       | Handler chiusura           |
| `campaign`        | object   | -       | Oggetto campagna           |
| `onUpdateName`    | function | -       | Handler aggiornamento nome |
| `onLeaveCampaign` | function | -       | Handler uscita da campagna |

#### Features

- Visualizza nome campagna (modificabile)
- Codice condivisibile con pulsante copia
- Conteggio membri
- Lista membri con avatar
- Pulsante esci dal gruppo (pericoloso)

---

### CampaignStatusModal

**Path:** `src/components/common/CampaignStatusModal.jsx`

Modal per votare e cambiare lo stato della campagna.

#### Props

| Prop           | Type     | Default | Descrizione                  |
| -------------- | -------- | ------- | ---------------------------- |
| `isOpen`       | boolean  | -       | Stato aperto/chiuso          |
| `onClose`      | function | -       | Handler chiusura             |
| `campaign`     | object   | -       | Oggetto campagna             |
| `userId`       | string   | -       | User ID corrente             |
| `onVote`       | function | -       | Handler voto (status)        |
| `onRevokeVote` | function | -       | Handler revoca voto (status) |

#### Stati Campagna

- **not-started**: Campagna non iniziata
- **in-progress**: Campagna in corso
- **completed**: Campagna terminata

#### Features

- Visualizza stato attuale
- Mostra descrizione per ogni stato
- Visualizza voti correnti
- Pulsanti per votare ogni stato
- Revoca voto automatica quando si vota altro stato
- Indicatore votanti (es: "2/4 voti")

---

### ResultsModal

**Path:** `src/components/common/ResultsModal.jsx`

Modal per visualizzare classifica generale della campagna.

#### Props

| Prop            | Type     | Default | Descrizione               |
| --------------- | -------- | ------- | ------------------------- |
| `isOpen`        | boolean  | -       | Stato aperto/chiuso       |
| `onClose`       | function | -       | Handler chiusura          |
| `matches`       | Array    | -       | Array di tutte le partite |
| `memberDetails` | object   | -       | Dettagli membri           |

#### Features

- Classifica ordinata per punteggio totale
- Visualizza avatar e username
- Badge trofeo per il primo classificato
- Badge 2°/3° per argento/bronzo
- Dettaglio punteggi per ogni partita
- Totale punti con indicatore PT

---

### LeaderPoolModal

**Path:** `src/components/common/LeaderPoolModal.jsx`

Modal per visualizzare i leader disponibili per ogni giocatore.

#### Props

| Prop       | Type     | Default | Descrizione             |
| ---------- | -------- | ------- | ----------------------- |
| `isOpen`   | boolean  | -       | Stato aperto/chiuso     |
| `onClose`  | function | -       | Handler chiusura        |
| `campaign` | object   | -       | Oggetto campagna        |
| `leaders`  | Array    | -       | Array di tutti i leader |

#### Features

- Tabs per ogni giocatore
- Lista leader disponibili con icone
- Indicatore leader già usati
- Contatore leader disponibili
- Scroll verticale per liste lunghe

---

### VictoryInfoModal

**Path:** `src/components/common/VictoryInfoModal.jsx`

Modal informativo sui punteggi vittorie dinamici.

#### Props

| Prop            | Type     | Default | Descrizione         |
| --------------- | -------- | ------- | ------------------- |
| `isOpen`        | boolean  | -       | Stato aperto/chiuso |
| `onClose`       | function | -       | Handler chiusura    |
| `victoryCounts` | object   | -       | Conteggi vittorie   |

#### Features

- Tabella tipi vittoria con icone
- Calcolo dinamico punti vittoria (50-150)
- Formula logaritmica visualizzata
- Spiegazione sistema punti
- Contatori per ogni tipo di vittoria

---

### RulesModal

**Path:** `src/components/common/RulesModal.jsx`

Modal informativo con le regole complete del gioco.

#### Props

| Prop      | Type     | Default | Descrizione         |
| --------- | -------- | ------- | ------------------- |
| `isOpen`  | boolean  | -       | Stato aperto/chiuso |
| `onClose` | function | -       | Handler chiusura    |

#### Features

- Regole del gioco step-by-step
- Sistema draft spiegato
- Sistema punteggi spiegato
- Sistema bonus spiegato
- Esempi pratici

---

### CompleteMatchModal

**Path:** `src/components/common/CompleteMatchModal.jsx`

Modal complesso per completare una partita con tutti i dettagli.

#### Props

| Prop            | Type     | Default | Descrizione                  |
| --------------- | -------- | ------- | ---------------------------- |
| `isOpen`        | boolean  | -       | Stato aperto/chiuso          |
| `onClose`       | function | -       | Handler chiusura             |
| `match`         | object   | -       | Oggetto partita              |
| `onConfirm`     | function | -       | Handler conferma (matchData) |
| `leaders`       | Array    | -       | Array di tutti i leader      |
| `victoryCounts` | object   | -       | Conteggi vittorie            |

#### Features

- Input turni giocati
- Selezione vincitore (o nessuno per defeat/canceled)
- Selezione tipo vittoria con icone
- Input punteggi grezzi per ogni giocatore
- Assegnazione bonus tags
- Preview punteggi elaborati e finali
- Validazione completa

**Match Data Object:**

```javascript
{
  turns: number,
  winnerId: string,
  victoryType: string,
  scores: { userId: rawScore },
  bonusTags: { userId: [tagId, ...] }
}
```

---

### BonusInfoModal

**Path:** `src/components/common/BonusInfoModal.jsx`

Modal multi-purpose per bonus tags (info/assign/overflow).

#### Props

| Prop               | Type     | Default  | Descrizione                      |
| ------------------ | -------- | -------- | -------------------------------- |
| `isOpen`           | boolean  | -        | Stato aperto/chiuso              |
| `onClose`          | function | -        | Handler chiusura                 |
| `mode`             | string   | `'info'` | 'info' / 'assign' / 'overflow'   |
| `currentBonusTags` | Array    | `[]`     | Bonus attuali (per assign mode)  |
| `onAssign`         | function | `null`   | Handler assegnazione (array ids) |
| `onRemove`         | function | `null`   | Handler rimozione (index)        |

#### Modes

- **info**: Visualizza tutti i bonus disponibili con descrizioni
- **assign**: Permette selezione multipla di bonus
- **overflow**: Mostra lista bonus assegnati (compatta)

#### Bonus Tags

- **second-place** (+15%): Secondo posto
- **survivor** (+10%): In guerra con giocatore <30 turni (multiplo)

---

### DraftModal

**Path:** `src/components/common/DraftModal.jsx`

Modal per sistema draft multi-fase.

#### Props

| Prop             | Type     | Default | Descrizione                     |
| ---------------- | -------- | ------- | ------------------------------- |
| `isOpen`         | boolean  | -       | Stato aperto/chiuso             |
| `onClose`        | function | -       | Handler chiusura                |
| `campaign`       | object   | -       | Oggetto campagna                |
| `draft`          | object   | -       | Oggetto draft                   |
| `leaders`        | Array    | -       | Array di tutti i leader         |
| `user`           | object   | -       | User corrente                   |
| `onToggleReady`  | function | -       | Handler toggle ready            |
| `onSubmitBan`    | function | -       | Handler submit ban vote         |
| `onSelectLeader` | function | -       | Handler selezione finale leader |

#### Fasi Draft

1. **Waiting**: Giocatori si dichiarano pronti
2. **Countdown**: 5 secondi quando tutti pronti
3. **Active**: Fase banning (vota leader da bannare per ogni avversario)
4. **Completed**: Selezione leader finale dalla pool

---

### LeaderConfirmModal

**Path:** `src/components/common/LeaderConfirmModal.jsx`

Modal di conferma per selezione leader finale.

#### Props

| Prop        | Type     | Default | Descrizione         |
| ----------- | -------- | ------- | ------------------- |
| `isOpen`    | boolean  | -       | Stato aperto/chiuso |
| `onClose`   | function | -       | Handler chiusura    |
| `onConfirm` | function | -       | Handler conferma    |
| `leader`    | object   | -       | Oggetto leader      |

#### Features

- Visualizza icona e nome leader
- Visualizza civiltà
- Pulsanti Annulla/Conferma

---

### MatchRow

**Path:** `src/components/common/MatchRow.jsx`

Componente per visualizzare una singola partita nella lista.

#### Props

| Prop                    | Type     | Default | Descrizione                   |
| ----------------------- | -------- | ------- | ----------------------------- |
| `match`                 | object   | -       | Oggetto partita               |
| `matchNumber`           | number   | -       | Numero partita (ordinale)     |
| `leaders`               | Array    | -       | Array di tutti i leader       |
| `draft`                 | object   | -       | Oggetto draft                 |
| `onStartDraft`          | function | -       | Handler avvio draft           |
| `onCompleteMatch`       | function | -       | Handler completamento partita |
| `isCurrentMatch`        | boolean  | -       | Se è la partita corrente      |
| `isDraftInProgress`     | boolean  | -       | Se draft è in corso           |
| `hasUserCompletedDraft` | boolean  | -       | Se user ha completato draft   |
| `readyPlayersCount`     | number   | -       | Numero giocatori pronti       |
| `totalPlayersCount`     | number   | -       | Totale giocatori              |

#### Features

- Stati visivi (in-progress/completed)
- Pulsante draft (dinamico in base a fase)
- Lista partecipanti con leader e punteggi
- Indicatore vincitore con tipo vittoria
- Pulsante completa (solo se in-progress)

---

### AddMatchButton

**Path:** `src/components/common/AddMatchButton.jsx`

Pulsante specializzato per aggiungere nuova partita.

#### Props

| Prop       | Type     | Default | Descrizione        |
| ---------- | -------- | ------- | ------------------ |
| `onClick`  | function | -       | Handler click      |
| `disabled` | boolean  | `false` | Stato disabilitato |

#### Features

- Design dotted border
- Icona Plus
- Tooltip quando disabled
- Animazione hover

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

## 📋 Guidelines

### Best Practices

```jsx
// ✅ Import da index
import { Button, Input, Modal } from "./components/common";

// ✅ Controlled components sempre
const [value, setValue] = useState("");
<Input value={value} onChange={(e) => setValue(e.target.value)} />;

// ✅ Modal chiusura con history
const handleClose = () => window.history.back();

// ✅ Loading states per async operations
<Button loading={isSaving}>Save</Button>;
```

### Styling

- **CSS Modules**: Ogni componente ha il proprio `.css`
- **Tailwind**: Usa utilities per layout (`flex`, `gap-4`, `p-4`)
- **Responsive**: Mobile-first con breakpoints `md:` e `lg:`

### Accessibilità

- **ARIA labels**: Per icone senza testo
- **Semantic HTML**: `<button>`, `<header>`, `<main>`
- **Keyboard**: Tab, Enter, Escape supportati

---

Per maggiori dettagli, consulta:

- [Hooks Documentation](HOOKS.md) - Custom hooks
- [Contexts Documentation](CONTEXTS.md) - Global state
- [API Reference](API_REFERENCE.md) - Firebase services
