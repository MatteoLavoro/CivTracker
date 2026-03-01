# 🎣 Custom Hooks CivTracker

Documentazione completa dei custom React hooks utilizzati in CivTracker.

## Indice

- [useAuth](#useauth)
- [useCollection](#usecollection)
- [useDocument](#usedocument)
- [useFileUpload](#usefileupload)
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

### Esempio Uso

```jsx
import { useAuth } from "./hooks";

function MyComponent() {
  const { user, loading, error } = useAuth();

  if (loading) {
    return <div>Caricamento...</div>;
  }

  if (error) {
    return <div>Errore: {error}</div>;
  }

  if (!user) {
    return <div>Non autenticato</div>;
  }

  return <div>Ciao, {user.displayName || user.email}!</div>;
}
```

### Note

- **Preferire `useAuthContext`** da `contexts/AuthContext` per evitare subscribe multipli
- Hook usato internamente da `AuthProvider`
- Real-time: aggiornamento automatico al cambio stato

### Best Practice

```jsx
// ✅ Usa Context (consigliato)
import { useAuthContext } from "./contexts";
const { user, loading } = useAuthContext();

// ❌ Evita uso diretto del hook (crea subscribe addizionali)
import { useAuth } from "./hooks";
const { user } = useAuth();
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

**Carica singolo documento**

```jsx
import { useDocument } from "./hooks";
import { useParams } from "react-router-dom";

function CampaignPage() {
  const { campaignId } = useParams();
  const { document: campaign, loading } = useDocument("campaigns", campaignId);

  if (loading) return <div>Caricamento campagna...</div>;
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

**Real-time updates**

```jsx
function CampaignDetails({ campaignId }) {
  const { document: campaign } = useDocument("campaigns", campaignId);

  // Se un altro utente modifica il nome della campagna,
  // questo componente si aggiorna automaticamente!

  return <h1>{campaign?.name}</h1>;
}
```

**Condizionale su ID**

```jsx
function UserProfile({ userId }) {
  const { document: user, loading } = useDocument(
    "users",
    userId || "placeholder", // Evita errore se userId è null
  );

  if (!userId) return <div>Nessun utente selezionato</div>;
  if (loading) return <div>Caricamento...</div>;

  return <div>{user?.name}</div>;
}
```

### Note

- **Real-time**: Subscribe a `onSnapshot`
- **Null handling**: Document null se non esiste
- **Cleanup**: Unsubscribe on unmount
- **Re-fetch**: Cambia subscription se `documentId` cambia

### Error Handling

```jsx
function SafeDocumentView({ docId }) {
  const { document, loading, error } = useDocument("items", docId);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!document) return <NotFound />;

  return <DocumentView data={document} />;
}
```

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

### Esempi

**Upload Avatar**

```jsx
import { useFileUpload } from "./hooks";

function AvatarUploader() {
  const { uploadFile, progress, uploading } = useFileUpload();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const url = await uploadFile(file, `avatars/${userId}.jpg`);
      console.log("File uploaded:", url);
      // Salva URL nel profilo utente
      await updateUserProfile({ photoURL: url });
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
          Upload in corso: {progress}%
          <progress value={progress} max="100" />
        </div>
      )}
    </div>
  );
}
```

**Upload con Preview**

```jsx
function ImageUploader() {
  const { uploadFile, progress, uploading, error } = useFileUpload();
  const [preview, setPreview] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Preview locale
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (file) => {
    try {
      const url = await uploadFile(file, `images/${Date.now()}.jpg`);
      setUploadedUrl(url);
      alert("Upload completato!");
    } catch (err) {
      alert("Errore upload");
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileSelect} />

      {preview && <img src={preview} alt="Preview" />}

      {uploading && (
        <div>
          <progress value={progress} max="100" />
          <span>{progress}%</span>
        </div>
      )}

      {error && <div style={{ color: "red" }}>{error}</div>}

      {uploadedUrl && (
        <div>
          Upload completato!
          <img src={uploadedUrl} alt="Uploaded" />
        </div>
      )}
    </div>
  );
}
```

**Multiple Files**

```jsx
function MultipleFilesUploader() {
  const { uploadFile, progress, uploading } = useFileUpload();
  const [urls, setUrls] = useState([]);

  const handleMultipleUpload = async (files) => {
    const uploadPromises = Array.from(files).map((file, index) =>
      uploadFile(
        file,
        `documents/${Date.now()}-${index}.${file.name.split(".").pop()}`,
      ),
    );

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      setUrls(uploadedUrls);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => handleMultipleUpload(e.target.files)}
      />
    </div>
  );
}
```

### Note

- **Progress tracking**: Aggiorna `progress` durante upload
- **File types**: Supporta tutti i tipi di file
- **Path**: Organizza file con path strutturati
- **Security**: Firestore Storage Rules controllano accesso

### Storage Rules

Esempio regole per avatars:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId} {
      allow read: if true; // Pubblicamente leggibili
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
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

## Best Practices

### 1. Cleanup Subscriptions

```jsx
// ✅ Hooks gestiscono cleanup automaticamente
const { documents } = useCollection("items");

// ❌ Non servono cleanup manuali
```

### 2. Conditional Hooks

```jsx
// ❌ Non usare hooks condizionalmente
if (userId) {
  const { document } = useDocument("users", userId);
}

// ✅ Passa sempre, gestisci condizione dentro
const { document } = useDocument("users", userId || "placeholder");
if (!userId) return null;
```

### 3. Dependency Arrays

```jsx
// ✅ Dependencies gestite automaticamente
useCollection("items", conditions); // Re-subscribe se conditions cambia

// ❌ Non wrappare in useMemo/useCallback senza motivo
const memoConditions = useMemo(() => conditions, []); // Inutile
```

### 4. Error Handling

```jsx
// ✅ Gestisci sempre errori
const { documents, error } = useCollection("items");
if (error) return <ErrorMessage error={error} />;

// ✅ Loading states
if (loading) return <Spinner />;
```

### 5. Real-time Awareness

```jsx
// ✅ Ricorda che i dati sono real-time
const { documents: campaigns } = useCollection("campaigns");

// I dati si aggiornano automaticamente!
// Non serve refresh manuale o polling
```

---

## Performance Tips

### 1. Evita Query Nested

```jsx
// ❌ Query nested causano molte subscribe
{
  campaigns.map((campaign) => (
    <div key={campaign.id}>
      <CampaignMembers campaignId={campaign.id} />
    </div>
  ));
}

// ✅ Carica dati necessari in un'unica query
const { documents: campaigns } = useCollection("campaigns");
// campaign.memberDetails già contiene i dati
```

### 2. Usa Limit per Liste Lunghe

```jsx
// ✅ Limita risultati per performance
const { documents } = useCollection("posts", [
  { type: "orderBy", field: "createdAt", direction: "desc" },
  { type: "limit", value: 20 },
]);
```

### 3. Unsubscribe su Unmount

```jsx
// ✅ Hooks gestiscono automaticamente
// Return cleanup function
useEffect(() => {
  const unsubscribe = subscribe();
  return () => unsubscribe();
}, []);
```

---

## Testing Hooks (Future)

```jsx
import { renderHook, waitFor } from "@testing-library/react";
import { useCollection } from "./useCollection";

test("loads collection data", async () => {
  const { result } = renderHook(() => useCollection("test"));

  expect(result.current.loading).toBe(true);

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.documents).toHaveLength(3);
});
```

---

Per maggiori dettagli, consulta:

- [Contexts Documentation](CONTEXTS.md)
- [Components Documentation](COMPONENTS.md)
- [API Reference](API_REFERENCE.md)
