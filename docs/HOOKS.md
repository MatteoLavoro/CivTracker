# 🎣 Custom Hooks CivTracker

Documentazione completa dei custom React hooks utilizzati in CivTracker.

## Indice

- [useAuth](#useauth)
- [useCollection](#usecollection)
- [useDocument](#usedocument)
- [useFileUpload](#usefileupload)
- [useLeaders](#useleaders)
- [useLeader](#useleader)
- [useModal](#usemodal)

---

## useAuth

**Path:** `src/hooks/useAuth.js`

Hook per tracciare lo stato di autenticazione dell'utente.

### Signature

```javascript
const { user, loading, error } = useAuth();
```

### Returns

| Property  | Type           | Descrizione                                       |
| --------- | -------------- | ------------------------------------------------- |
| `user`    | object \| null | Oggetto utente Firebase o null se non autenticato |
| `loading` | boolean        | `true` durante inizializzazione auth              |
| `error`   | string \| null | Messaggio errore se presente                      |

### User Object

```javascript
{
  uid: "unique-user-id",
  email: "user@example.com",
  displayName: "Nome Utente",
  emailVerified: false,
  photoURL: null,
  // ...altri campi Firebase
}
```

### Funzionamento

1. Monta il componente
2. Subscribe a `onAuthStateChanged` di Firebase
3. Aggiorna `user` quando stato auth cambia
4. Cleanup subscription on unmount

### Esempio

```jsx
import { useAuth } from "./hooks";

function MyComponent() {
  const { user, loading, error } = useAuth();

  if (loading) return <div>Caricamento...</div>;
  if (error) return <div>Errore: {error}</div>;
  if (!user) return <div>Non autenticato</div>;

  return <div>Ciao, {user.displayName || user.email}!</div>;
}
```

### Best Practice

⚠️ **Preferire `useAuthContext`** per evitare subscribe multipli:

```jsx
// ✅ Consigliato
import { useAuthContext } from "./contexts";
const { user } = useAuthContext();

// ❌ Da evitare
import { useAuth } from "./hooks";
const { user } = useAuth(); // Crea subscribe addizionale
```

---

## useCollection

**Path:** `src/hooks/useCollection.js`

Hook per recuperare una collezione Firestore con aggiornamenti real-time.

### Signature

```javascript
const { documents, loading, error } = useCollection(collectionName, conditions);
```

### Parameters

| Parameter        | Type   | Required | Descrizione                             |
| ---------------- | ------ | -------- | --------------------------------------- |
| `collectionName` | string | ✅       | Nome collezione Firestore               |
| `conditions`     | array  | ❌       | Array di condizioni query (default: []) |

### Conditions Format

```javascript
[
  {
    type: "where",
    field: "status",
    operator: "==",
    value: "active",
  },
  {
    type: "orderBy",
    field: "createdAt",
    direction: "desc", // "asc" or "desc"
  },
  {
    type: "limit",
    value: 10,
  },
];
```

### Operatori Where

- `==` - Uguale
- `!=` - Diverso
- `<` - Minore
- `<=` - Minore o uguale
- `>` - Maggiore
- `>=` - Maggiore o uguale
- `array-contains` - Array contiene valore
- `array-contains-any` - Array contiene uno dei valori
- `in` - Valore in array
- `not-in` - Valore non in array

### Returns

| Property    | Type           | Descrizione                         |
| ----------- | -------------- | ----------------------------------- |
| `documents` | array          | Array di documenti con campo `id`   |
| `loading`   | boolean        | `true` durante caricamento iniziale |
| `error`     | string \| null | Messaggio errore se presente        |

### Esempi

**Tutti i documenti**

```jsx
import { useCollection } from "./hooks";

function UsersList() {
  const { documents: users, loading } = useCollection("users");

  if (loading) return <div>Caricamento...</div>;

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

**Con filtro WHERE**

```jsx
const { documents: activeCampaigns } = useCollection("campaigns", [
  { type: "where", field: "status", operator: "==", value: "active" },
]);
```

**Campagne dell'utente (array-contains)**

```jsx
const { documents: myCampaigns } = useCollection("campaigns", [
  {
    type: "where",
    field: "members",
    operator: "array-contains",
    value: userId,
  },
]);
```

**Ordinamento e limite**

```jsx
const { documents: recentPosts } = useCollection("posts", [
  { type: "orderBy", field: "createdAt", direction: "desc" },
  { type: "limit", value: 10 },
]);
```

**Query Complessa**

```jsx
const { documents: filteredData } = useCollection("items", [
  { type: "where", field: "category", operator: "==", value: "books" },
  { type: "where", field: "price", operator: "<", value: 50 },
  { type: "orderBy", field: "price", direction: "asc" },
  { type: "limit", value: 20 },
]);
```

### Real-time Updates

```jsx
function CampaignsList() {
  // Aggiornamento automatico quando dati cambiano in Firestore
  const { documents: campaigns } = useCollection("campaigns");

  // Se un altro utente crea/modifica/elimina una campagna,
  // questo componente si aggiorna automaticamente!

  return <div>{campaigns.length} campagne</div>;
}
```

### Note

- **Real-time**: Subscribe a `onSnapshot` di Firestore
- **Cleanup automatico**: Unsubscribe on unmount
- **Dependency**: Ri-subscribe se `collectionName` o `conditions` cambiano
- **Performance**: Usa `JSON.stringify(conditions)` per dependency check

### Firestore Indexes

Query complesse richiedono indici:

```javascript
// Questa query richiede un index
useCollection("campaigns", [
  { type: "where", field: "members", operator: "array-contains", value: uid },
  { type: "orderBy", field: "updatedAt", direction: "desc" },
]);
```

Firestore mostrerà un link per creare l'indice nella console quando necessario.

---

## useDocument

**Path:** `src/hooks/useDocument.js`

Hook per recuperare un singolo documento Firestore con aggiornamenti real-time.

### Signature

```javascript
const { document, loading, error } = useDocument(collectionName, documentId);
```

### Parameters

| Parameter        | Type   | Required | Descrizione               |
| ---------------- | ------ | -------- | ------------------------- |
| `collectionName` | string | ✅       | Nome collezione Firestore |
| `documentId`     | string | ✅       | ID documento              |

### Returns

| Property   | Type           | Descrizione                                    |
| ---------- | -------------- | ---------------------------------------------- |
| `document` | object \| null | Documento con campo `id`, o null se non esiste |
| `loading`  | boolean        | `true` durante caricamento                     |
| `error`    | string \| null | Messaggio errore                               |

### Esempi

```jsx
import { useDocument } from "./hooks";
import { useParams } from "react-router-dom";

function CampaignPage() {
  const { campaignId } = useParams();
  const {
    document: campaign,
    loading,
    error,
  } = useDocument("campaigns", campaignId);

  if (loading) return <div>Caricamento...</div>;
  if (error) return <div>Errore: {error}</div>;
  if (!campaign) return <div>Campagna non trovata</div>;

  return (
    <div>
      <h1>{campaign.name}</h1>
      <p>Codice: {campaign.code}</p>
      <p>Membri: {campaign.members.length}</p>
    </div>
  );
}
```

### Note

- ⚡ **Real-time**: Si aggiorna automaticamente quando il documento cambia
- 💭 **Null handling**: Ritorna `null` se documento non esiste
- 🧹 **Cleanup**: Unsubscribe automatico on unmount

---

## useFileUpload

**Path:** `src/hooks/useFileUpload.js`

Hook per upload file su Firebase Storage con progress tracking.

### Signature

```javascript
const { uploadFile, progress, uploading, error } = useFileUpload();
```

### Returns

| Property     | Type           | Descrizione                |
| ------------ | -------------- | -------------------------- |
| `uploadFile` | function       | Funzione per upload file   |
| `progress`   | number         | Percentuale upload (0-100) |
| `uploading`  | boolean        | `true` durante upload      |
| `error`      | string \| null | Messaggio errore           |

### uploadFile Function

```javascript
const url = await uploadFile(file, path);
```

**Parameters:**

- `file`: File object da `<input type="file">`
- `path`: Percorso storage (es: `"avatars/user123.jpg"`)

**Returns:**

- `url`: URL pubblico del file uploadato

### Esempio

```jsx
import { useFileUpload } from "./hooks";

function AvatarUploader({ userId, onUploadComplete }) {
  const { uploadFile, progress, uploading, error } = useFileUpload();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const url = await uploadFile(file, `avatars/${userId}.jpg`);
      await updateUserProfile({ photoURL: url });
      onUploadComplete(url);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        disabled={uploading}
        accept="image/*"
      />
      {uploading && (
        <div>
          <progress value={progress} max="100" />
          <span>{progress}%</span>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

### Note

- Progress tracking automatico da 0 a 100%
- Supporta tutti i tipi di file
- Security gestita da Firebase Storage Rules

---

## useLeaders

**Path:** `src/hooks/useLeaders.js`

Hook per recuperare tutti i leader di Civilization VI con aggiornamenti real-time.

### Signature

```javascript
const { leaders, loading, error } = useLeaders();
```

### Returns

| Property  | Type           | Descrizione                            |
| --------- | -------------- | -------------------------------------- |
| `leaders` | array          | Array di 77 leader ordinati per numero |
| `loading` | boolean        | `true` durante caricamento             |
| `error`   | string \| null | Messaggio errore                       |

### Leader Object Structure

```javascript
{
  id: "leader-id",
  number: 1,
  name: "Abraham Lincoln",
  civilization: "America",
  icon: "/IconePersonaggi/Abraham_Lincoln.webp",
  // ...altri campi
}
```

### Esempi

**Lista tutti i leader**

```jsx
import { useLeaders } from "./hooks";

function LeadersList() {
  const { leaders, loading, error } = useLeaders();

  if (loading) return <div>Caricamento leader...</div>;
  if (error) return <div>Errore: {error}</div>;

  return (
    <div>
      <h2>Leader disponibili ({leaders.length})</h2>
      {leaders.map((leader) => (
        <div key={leader.id}>
          <img src={leader.icon} alt={leader.name} />
          <span>
            {leader.name} - {leader.civilization}
          </span>
        </div>
      ))}
    </div>
  );
}
```

**Select leader per draft**

```jsx
function LeaderPicker() {
  const { leaders } = useLeaders();
  const [selectedLeader, setSelectedLeader] = useState(null);

  return (
    <select onChange={(e) => setSelectedLeader(e.target.value)}>
      <option value="">Seleziona un leader</option>
      {leaders.map((leader) => (
        <option key={leader.id} value={leader.id}>
          {leader.name} ({leader.civilization})
        </option>
      ))}
    </select>
  );
}
```

**Filtra leader per civiltà**

```jsx
function LeadersByCivilization({ civilization }) {
  const { leaders } = useLeaders();

  const filtered = leaders.filter((l) => l.civilization === civilization);

  return (
    <div>
      <h3>Leader di {civilization}</h3>
      {filtered.map((leader) => (
        <div key={leader.id}>{leader.name}</div>
      ))}
    </div>
  );
}
```

### Note

- **Real-time**: Aggiornamenti automatici se i leader cambiano in Firestore
- **Ordinamento**: Leader già ordinati per numero (campo `number`)
- **Performance**: Tutti i 77 leader sono caricati, usa memoization se necessario
- **Internamente usa**: `useCollection("leaders", [orderBy number asc])`

### Database Structure

I leader sono memorizzati nella collection `leaders` in Firestore:

```
leaders/
  ├─ abraham-lincoln/
  │   ├─ number: 1
  │   ├─ name: "Abraham Lincoln"
  │   ├─ civilization: "America"
  │   └─ icon: "/IconePersonaggi/Abraham_Lincoln.webp"
  ├─ amanitore/
  └─ ...77 leader totali
```

---

## useLeader

**Path:** `src/hooks/useLeader.js`

Hook per recuperare un singolo leader con aggiornamenti real-time.

### Signature

```javascript
const { leader, loading, error } = useLeader(leaderId);
```

### Parameters

| Parameter  | Type   | Required | Descrizione          |
| ---------- | ------ | -------- | -------------------- |
| `leaderId` | string | ✅       | ID del leader (slug) |

### Returns

| Property  | Type           | Descrizione                          |
| --------- | -------------- | ------------------------------------ |
| `leader`  | object \| null | Oggetto leader o null se non trovato |
| `loading` | boolean        | `true` durante caricamento           |
| `error`   | string \| null | Messaggio errore                     |

### Esempi

**Visualizza singolo leader**

```jsx
import { useLeader } from "./hooks";
import { useParams } from "react-router-dom";

function LeaderDetailsPage() {
  const { leaderId } = useParams();
  const { leader, loading, error } = useLeader(leaderId);

  if (loading) return <div>Caricamento...</div>;
  if (error) return <div>Errore: {error}</div>;
  if (!leader) return <div>Leader non trovato</div>;

  return (
    <div>
      <img src={leader.icon} alt={leader.name} />
      <h1>{leader.name}</h1>
      <p>Civiltà: {leader.civilization}</p>
      <p>Numero: {leader.number}</p>
    </div>
  );
}
```

**Mostra leader selezionato nel draft**

```jsx
function SelectedLeaderCard({ leaderId }) {
  const { leader, loading } = useLeader(leaderId);

  if (loading) return <div className="skeleton-card" />;
  if (!leader) return null;

  return (
    <div className="leader-card">
      <img src={leader.icon} alt={leader.name} />
      <h3>{leader.name}</h3>
      <span>{leader.civilization}</span>
    </div>
  );
}
```

**Confronto tra leader**

```jsx
function LeaderComparison({ leader1Id, leader2Id }) {
  const { leader: leader1 } = useLeader(leader1Id);
  const { leader: leader2 } = useLeader(leader2Id);

  if (!leader1 || !leader2) return <div>Caricamento...</div>;

  return (
    <div className="comparison">
      <div>
        <h3>{leader1.name}</h3>
        <p>{leader1.civilization}</p>
      </div>
      <div className="vs">VS</div>
      <div>
        <h3>{leader2.name}</h3>
        <p>{leader2.civilization}</p>
      </div>
    </div>
  );
}
```

### Note

- **Real-time**: Aggiornamenti automatici se il leader cambia
- **Null handling**: Ritorna `null` se leader non esiste
- **Internamente usa**: `useDocument("leaders", leaderId)`
- **Leader ID format**: Slug lowercase (es: `"abraham-lincoln"`)

### Common Leader IDs

Esempi di ID leader validi:

```javascript
"abraham-lincoln";
"amanitore";
"catherine-de-medici-black-queen";
"catherine-de-medici-magnificence";
"cleopatra";
"gandhi";
// ... 77 leader totali
```

---

## useModal

**Path:** `src/contexts/ModalContext.jsx` (exported hook)

Hook per interagire con il sistema di gestione modali centralizzato.

### Signature

```javascript
const modalContext = useModal();
```

### Returns

| Property              | Type     | Descrizione                        |
| --------------------- | -------- | ---------------------------------- |
| `modalStack`          | array    | Stack di modali aperti             |
| `modalDepth`          | number   | Numero di modali aperti            |
| `openModal`           | function | Apri un modale                     |
| `closeModal`          | function | Chiudi ultimo modale               |
| `closeAllModals`      | function | Chiudi tutti i modali              |
| `closeTopModal`       | function | Chiudi il modale più in alto       |
| `registerNestedClose` | function | Registra callback per nested modal |
| `hasNestedModals`     | function | Check se ci sono nested modals     |
| `isModalOpen`         | function | Check se un modale è aperto        |

### Metodi

#### openModal(modalId, props)

Apri un modale gestito dal context.

```javascript
const { openModal } = useModal();

openModal("confirmDelete", {
  itemId: "123",
  itemName: "Campaign XYZ",
});
```

#### closeModal()

Chiudi l'ultimo modale dallo stack.

```javascript
const { closeModal } = useModal();

closeModal();
```

#### closeAllModals()

Chiudi tutti i modali.

```javascript
const { closeAllModals } = useModal();

closeAllModals(); // Svuota lo stack
```

#### registerNestedClose(callback)

Registra un callback per nested modal (usato internamente da `Modal` component).

```javascript
useEffect(() => {
  if (!isOpen) return;

  const unregister = registerNestedClose(() => {
    onClose();
  });

  return () => unregister();
}, [isOpen]);
```

### Esempi

**Check se modali aperti**

```jsx
function MyComponent() {
  const { modalDepth, hasNestedModals } = useModal();

  if (modalDepth > 0) {
    console.log(`${modalDepth} modali aperti`);
  }

  if (hasNestedModals()) {
    console.log("Ci sono nested modals");
  }
}
```

**Chiudi tutti al logout**

```jsx
function LogoutButton() {
  const { closeAllModals } = useModal();

  const handleLogout = async () => {
    closeAllModals(); // Chiudi eventuali modali aperti
    await logOut();
    navigate("/");
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

### Note

- **Usato internamente**: `Modal` component lo usa automaticamente
- **History integration**: Modali sincronizzati con browser history
- **Escape key**: Gestito centralmente dal context
- **Nested support**: Supporto completo per modali annidati

---

## 💡 Best Practices & Performance

### Hooks Rules

```jsx
// ✅ Sempre top-level, mai condizionali
const { user } = useAuth();

// ❌ Mai hooks condizionali
if (needsData) const { documents } = useCollection("items");
```

### Error Handling

```jsx
const { documents, error, loading } = useCollection("items");

if (loading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
return <DataView data={documents} />;
```

### Performance

- **Limita liste lunghe**: Usa `{ type: "limit", value: 20 }`
- **Evita query nested**: Carica dati in un'unica query quando possibile
- **Cleanup automatico**: Hooks gestiscono unsubscribe on unmount

---

Per maggiori dettagli, consulta:

- [Contexts Documentation](CONTEXTS.md)
- [Components Documentation](COMPONENTS.md)
- [API Reference](API_REFERENCE.md)
