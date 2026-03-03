# 📚 API Reference CivTracker

Riferimento completo per tutti i servizi, hooks e utility di CivTracker.

## Indice

- [Firebase Services](#firebase-services)
  - [Authentication](#authentication)
  - [Firestore](#firestore)
  - [Campaigns](#campaigns)
  - [Storage](#storage)
- [Custom Hooks](#custom-hooks)
- [Contexts](#contexts)
- [Utils](#utils)

---

## Firebase Services

Path: `src/services/firebase/`

### Authentication

**Path:** `src/services/firebase/auth.js`

Servizi per autenticazione utenti con Firebase Authentication.

#### signUp

Registra nuovo utente con email, password e nome.

```javascript
const { user, error } = await signUp(email, password, displayName);
```

**Parameters:**

- `email` (string, required): Email utente
- `password` (string, required): Password (min 6 caratteri)
- `displayName` (string, optional): Nome visualizzato (max 30 caratteri)

**Returns:**

```javascript
{
  user: FirebaseUser | null,  // User object se successo
  error: string | null         // Messaggio errore se fallito
}
```

**Example:**

```javascript
const { user, error } = await signUp(
  "user@example.com",
  "password123",
  "Mario",
);
if (!error) console.log("Registered:", user.uid);
```

**Errors:** `auth/email-already-in-use`, `auth/invalid-email`, `auth/weak-password`

---

#### signIn

Login utente esistente.

```javascript
const { user, error } = await signIn(email, password);
```

**Parameters:**

- `email` (string, required): Email utente
- `password` (string, required): Password

**Returns:**

```javascript
{
  user: FirebaseUser | null,
  error: string | null
}
```

**Example:**

```javascript
const { user, error } = await signIn("user@example.com", "password123");
if (!error) console.log("Logged in:", user.email);
```

**Errors:** `auth/user-not-found`, `auth/wrong-password`, `auth/invalid-email`

---

#### signInWithGoogle

Login con account Google.

```javascript
const { user, error } = await signInWithGoogle();
```

**Parameters:** None

**Returns:**

```javascript
{
  user: FirebaseUser | null,
  error: string | null
}
```

**Example:**

```javascript
const { user, error } = await signInWithGoogle();
if (!error) console.log("Logged in:", user.email);
```

---

#### logOut

Logout utente corrente.

```javascript
const { error } = await logOut();
```

**Parameters:** None

**Returns:**

```javascript
{
  error: string | null;
}
```

**Example:**

```javascript
const { error } = await logOut();
if (!error) navigate("/");
```

---

#### resetPassword

Invia email per reset password.

```javascript
const { error } = await resetPassword(email);
```

**Parameters:**

- `email` (string, required): Email dell'account

**Returns:**

```javascript
{
  error: string | null;
}
```

**Example:**

```javascript
const { error } = await resetPassword("user@example.com");
if (!error) alert("Email di reset inviata");
```

---

#### onAuthChange

Listener per cambiamenti stato autenticazione.

```javascript
const unsubscribe = onAuthChange(callback);
```

**Parameters:**

- `callback` (function): Chiamata con user object o null

**Returns:**

- `unsubscribe` (function): Funzione per stop listener

**Example:**

```javascript
useEffect(() => {
  const unsubscribe = onAuthChange((user) => {
    console.log(user ? `Logged in: ${user.email}` : "Logged out");
  });
  return unsubscribe;
}, []);
```

---

#### getCurrentUser

Ottieni utente corrente sincronamente.

```javascript
const user = getCurrentUser();
```

**Parameters:** None

**Returns:**

- `FirebaseUser | null`

**Example:**

```javascript
const user = getCurrentUser();
console.log(user ? `Current: ${user.uid}` : "No user");
```

---

#### updateUserProfile

Aggiorna profilo utente (displayName).

```javascript
const { error } = await updateUserProfile(displayName);
```

**Parameters:**

- `displayName` (string, required): Nuovo nome (max 30 caratteri)

**Returns:**

```javascript
{
  error: string | null;
}
```

**Example:**

```javascript
const { error } = await updateUserProfile("Nuovo Nome");
if (!error) console.log("Profile updated");
```

---

### Firestore

**Path:** `src/services/firebase/firestore.js`

Servizi per operazioni database Firestore.

#### createDocument

Crea nuovo documento con ID auto-generato.

```javascript
const { id, error } = await createDocument(collectionName, data);
```

**Parameters:**

- `collectionName` (string): Nome collezione
- `data` (object): Dati documento

**Returns:**

```javascript
{
  id: string | null,      // ID documento creato
  error: string | null
}
```

**Example:**

```javascript
const { id, error } = await createDocument("users", { name: "Mario", age: 30 });
if (!error) console.log("Created:", id);
```

---

#### setDocument

Crea o aggiorna documento con ID specifico.

```javascript
const { error } = await setDocument(collectionName, documentId, data, merge);
```

**Parameters:**

- `collectionName` (string): Nome collezione
- `documentId` (string): ID documento
- `data` (object): Dati
- `merge` (boolean, default: true): Se true, merge con esistente

**Returns:**

```javascript
{
  error: string | null;
}
```

**Example:**

```javascript
await setDocument("users", "user123", { name: "Mario" });
await setDocument("users", "user123", { name: "Luigi" }, false);
```

---

#### getDocument

Recupera singolo documento.

```javascript
const { data, error } = await getDocument(collectionName, documentId);
```

**Parameters:**

- `collectionName` (string): Nome collezione
- `documentId` (string): ID documento

**Returns:**

```javascript
{
  data: { id: string, ...fields } | null,  // Documento con id
  error: string | null
}
```

**Example:**

```javascript
const { data: user, error } = await getDocument("users", "user123");
if (user) console.log("User:", user.name);
```

---

#### getCollection

Recupera tutti i documenti di una collezione.

```javascript
const { data, error } = await getCollection(collectionName);
```

**Parameters:**

- `collectionName` (string): Nome collezione

**Returns:**

```javascript
{
  data: Array<{ id: string, ...fields }> | null,
  error: string | null
}
```

**Example:**

```javascript
const { data: users, error } = await getCollection("users");
if (users) users.forEach((u) => console.log(u.name));
```

---

#### updateDocument

Aggiorna campi specifici di un documento.

```javascript
const { error } = await updateDocument(collectionName, documentId, data);
```

**Parameters:**

- `collectionName` (string): Nome collezione
- `documentId` (string): ID documento
- `data` (object): Campi da aggiornare

**Returns:**

```javascript
{
  error: string | null;
}
```

**Example:**

```javascript
const { error } = await updateDocument("users", "user123", {
  age: 31,
  city: "Rome",
});
if (!error) console.log("Updated");
```

---

#### deleteDocument

Elimina un documento.

```javascript
const { error } = await deleteDocument(collectionName, documentId);
```

**Parameters:**

- `collectionName` (string): Nome collezione
- `documentId` (string): ID documento

**Returns:**

```javascript
{
  error: string | null;
}
```

**Example:**

```javascript
const { error } = await deleteDocument("users", "user123");
if (!error) console.log("Deleted");
```

---

#### queryDocuments

Query con filtri, ordinamento e limiti.

```javascript
const { data, error } = await queryDocuments(collectionName, conditions);
```

**Parameters:**

- `collectionName` (string): Nome collezione
- `conditions` (array): Array di condizioni query

**Condition Format:**

```javascript
// Where
{ type: 'where', field: 'age', operator: '>=', value: 18 }

// OrderBy
{ type: 'orderBy', field: 'createdAt', direction: 'desc' }

// Limit
{ type: 'limit', value: 10 }
```

**Returns:**

```javascript
{
  data: Array<{ id: string, ...fields }> | null,
  error: string | null
}
```

**Example:**

```javascript
const { data: adults } = await queryDocuments("users", [
  { type: "where", field: "age", operator: ">=", value: 18 },
  { type: "orderBy", field: "name", direction: "asc" },
  { type: "limit", value: 50 },
]);
```

**Operators:**

- `==`, `!=`, `<`, `<=`, `>`, `>=`
- `array-contains`, `array-contains-any`
- `in`, `not-in`

---

#### subscribeToCollection

Listener real-time per collezione.

```javascript
const unsubscribe = subscribeToCollection(collectionName, callback, conditions);
```

**Parameters:**

- `collectionName` (string): Nome collezione
- `callback` (function): Chiamata con array documenti
- `conditions` (array, optional): Condizioni query

**Returns:**

- `unsubscribe` (function): Stop listener

**Example:**

```javascript
const unsubscribe = subscribeToCollection("campaigns", setCampaigns, [
  {
    type: "where",
    field: "members",
    operator: "array-contains",
    value: userId,
  },
]);
return unsubscribe;
```

---

#### subscribeToDocument

Listener real-time per singolo documento.

```javascript
const unsubscribe = subscribeToDocument(collectionName, documentId, callback);
```

**Parameters:**

- `collectionName` (string): Nome collezione
- `documentId` (string): ID documento
- `callback` (function): Chiamata con documento

**Returns:**

- `unsubscribe` (function): Stop listener

**Example:**

```javascript
const unsubscribe = subscribeToDocument("campaigns", campaignId, setCampaign);
return unsubscribe;
```

---

### Campaigns

**Path:** `src/services/firebase/campaigns.js`

Servizi specifici per gestione campagne.

#### createCampaign

Crea nuova campagna con codice univoco.

```javascript
const { campaign, error } = await createCampaign(name, userId, username);
```

**Parameters:**

- `name` (string): Nome campagna
- `userId` (string): UID del creatore
- `username` (string): Username del creatore

**Returns:**

```javascript
{
  campaign: {
    id: string,
    name: string,
    code: string,             // 8 caratteri univoci
    createdBy: string,
    createdAt: string,
    updatedAt: string,
    members: [string],
    memberDetails: {
      [userId]: {
        username: string,
        joinedAt: string
      }
    }
  } | null,
  error: string | null
}
```

**Example:**

```javascript
const { campaign, error } = await createCampaign(
  "Italia 2024",
  user.uid,
  user.displayName,
);
if (!error) console.log("Code:", campaign.code);
```

---

#### getCampaignByCode

Cerca campagna per codice.

```javascript
const campaign = await getCampaignByCode(code);
```

**Parameters:**

- `code` (string): Codice campagna (8 caratteri)

**Returns:**

- `Campaign object | null`

**Example:**

```javascript
const campaign = await getCampaignByCode("ABC12345");
console.log(campaign ? campaign.name : "Not found");
```

---

#### joinCampaign

Unisciti a campagna esistente.

```javascript
const { campaign, error } = await joinCampaign(code, userId, username);
```

**Parameters:**

- `code` (string): Codice campagna
- `userId` (string): UID utente
- `username` (string): Username utente

**Returns:**

```javascript
{
  campaign: Campaign | null,
  error: string | null
}
```

**Example:**

```javascript
const { campaign, error } = await joinCampaign(
  "ABC12345",
  user.uid,
  user.displayName,
);
if (error) alert(error);
```

**Errors:** "Campagna non trovata", "Sei già membro di questa campagna"

---

#### leaveCampaign

Esci da campagna.

```javascript
const { success, error } = await leaveCampaign(campaignId, userId);
```

**Parameters:**

- `campaignId` (string): ID campagna
- `userId` (string): UID utente

**Returns:**

```javascript
{
  success: boolean,
  error: string | null
}
```

**Example:**

```javascript
const { success } = await leaveCampaign(campaign.id, user.uid);
if (success) console.log("Left campaign");
```

---

#### updateCampaignName

Aggiorna nome campagna.

```javascript
const { success, error } = await updateCampaignName(campaignId, newName);
```

**Parameters:**

- `campaignId` (string): ID campagna
- `newName` (string): Nuovo nome

**Returns:**

```javascript
{
  success: boolean,
  error: string | null
}
```

**Example:**

```javascript
const { error } = await updateCampaignName(campaign.id, "Nuovo Nome");
```

---

#### toggleCampaignImportant

Segna/rimuovi campagna come importante (stella).

```javascript
const { success, error } = await toggleCampaignImportant(
  campaignId,
  isImportant,
);
```

**Parameters:**

- `campaignId` (string): ID campagna
- `isImportant` (boolean): Stato importante

**Returns:**

```javascript
{
  success: boolean,
  error: string | null
}
```

**Example:**

```javascript
const { error } = await toggleCampaignImportant(campaign.id, true);
```

---

#### voteForCampaignStatus

Vota per cambiare stato campagna.

```javascript
const { success, statusChanged, error } = await voteForCampaignStatus(
  campaignId,
  userId,
  desiredStatus,
);
```

**Parameters:**

- `campaignId` (string): ID campagna
- `userId` (string): UID votante
- `desiredStatus` (string): "not-started" | "in-progress" | "completed"

**Returns:**

```javascript
{
  success: boolean,
  statusChanged: boolean,  // true se tutti hanno votato e stato è cambiato
  error: string | null
}
```

**Example:**

```javascript
const { statusChanged } = await voteForCampaignStatus(
  campaignId,
  user.uid,
  "in-progress",
);
alert(statusChanged ? "Campagna avviata!" : "Voto registrato");
```

**Errors:** "La campagna è già in questo stato", "Non si può cambiare lo stato di una campagna terminata", "Hai già votato per questo stato"

---

#### revokeStatusVote

Revoca voto per cambio stato.

```javascript
const { success, error } = await revokeStatusVote(
  campaignId,
  userId,
  statusVotedFor,
);
```

**Parameters:**

- `campaignId` (string): ID campagna
- `userId` (string): UID votante
- `statusVotedFor` (string): Stato per cui aveva votato

**Returns:**

```javascript
{
  success: boolean,
  error: string | null
}
```

**Example:**

```javascript
const { error } = await revokeStatusVote(campaignId, user.uid, "in-progress");
```

---

#### getUserCampaigns

Recupera tutte le campagne di cui l'utente è membro.

**Parameters:**

- `userId` (string): ID utente

**Returns:**

```javascript
{
  campaigns: Array<Campaign>,
  error: string | null
}
```

**Esempio:**

```javascript
const { campaigns } = await getUserCampaigns(user.uid);
console.log(`Found ${campaigns.length} campaigns`);
```

---

### Matches

**Path:** `src/services/firebase/matches.js`

Servizi per gestione partite all'interno delle campagne.

#### createMatch

Crea nuova partita in una campagna.

```javascript
const { success, match, error } = await createMatch(
  campaignId,
  memberIds,
  memberDetails,
);
```

**Parameters:**

- `campaignId` (string): ID campagna
- `memberIds` (Array<string>): Array di user IDs
- `memberDetails` (object): Dettagli membri dalla campagna

**Returns:**

```javascript
{
  success: boolean,
  match: {
    id: string,
    status: "in-progress",
    turns: 0,
    participants: {...},
    draftCompleted: false,
    createdAt: string
  } | null,
  error: string | null
}
```

**Example:**

```javascript
const { match, error } = await createMatch(
  campaignId,
  campaign.members,
  campaign.memberDetails,
);
if (error) alert(error);
```

**Errors:** "Campaign not found", "Completa la partita corrente prima di crearne una nuova"

---

#### updateMatchTurns

Aggiorna numero turni della partita.

```javascript
const { success, error } = await updateMatchTurns(campaignId, matchId, turns);
```

**Parameters:**

- `campaignId` (string): ID campagna
- `matchId` (string): ID partita
- `turns` (number): Numero turni

**Returns:**

```javascript
{
  success: boolean,
  error: string | null
}
```

**Example:**

```javascript
const { error } = await updateMatchTurns(campaignId, matchId, 300);
```

---

#### completeMatch

Completa partita con tutti i dettagli e calcola punteggi.

```javascript
const { success, error } = await completeMatch(
  campaignId,
  matchId,
  turns,
  scores,
  bonusTags,
  winnerId,
  victoryType,
);
```

**Parameters:**

- `campaignId` (string): ID campagna
- `matchId` (string): ID partita
- `turns` (number): Turni finali
- `scores` (object): `{ userId: rawScore }`
- `bonusTags` (object): `{ userId: [tagId, ...] }`
- `winnerId` (string): User ID vincitore (o "" per defeat/canceled)
- `victoryType` (string): Tipo vittoria

**Victory Types:**

- "science", "culture", "diplomatic", "domination", "religious", "score"
- "forfait" - Vittoria per resa avversari
- "defeat" - Tutti sconfitti da bot
- "canceled" - Partita annullata

**Returns:**

```javascript
{
  success: boolean,
  error: string | null
}
```

**Example:**

```javascript
const { error } = await completeMatch(
  campaignId,
  matchId,
  320,
  { user1: 450, user2: 520 },
  { user1: ["second-place"], user2: ["survivor"] },
  "user2",
  "science",
);
```

---

#### updateParticipantScore

Aggiorna manualmente il punteggio grezzo di un partecipante in una partita.

**Parameters:**

- `campaignId` (string): ID campagna
- `matchId` (string): ID partita
- `participantId` (string): ID partecipante
- `score` (number): Punteggio grezzo

**Returns:**

```javascript
{
  success: boolean,
  error: string | null
}
```

**Esempio:**

```javascript
const { success } = await updateParticipantScore(
  campaignId,
  matchId,
  userId,
  150,
);
```

---

#### linkDraftToMatch

Collega i leader selezionati dal draft ai partecipanti di una partita.

**Parameters:**

- `campaignId` (string): ID campagna
- `matchId` (string): ID partita
- `selectedLeaders` (object): `{ userId: leaderId, ... }`

**Returns:**

```javascript
{
  success: boolean,
  error: string | null
}
```

**Esempio:**

```javascript
const { success } = await linkDraftToMatch(campaignId, matchId, {
  user1: "abraham-lincoln",
  user2: "cleopatra",
});
```

---

### Draft

**Path:** `src/services/firebase/draft.js`

Servizi per sistema draft leader.

#### initializeDraft

Inizializza draft per una campagna.

```javascript
const { success, error } = await initializeDraft(campaignId);
```

**Parameters:**

- `campaignId` (string): ID campagna

**Returns:**

```javascript
{
  success: boolean,
  error: string | null
}
```

**Example:**

```javascript
await initializeDraft(campaignId);
```

---

#### togglePlayerReady

Segna/rimuovi giocatore come pronto per il draft.

```javascript
const { success, error } = await togglePlayerReady(
  campaignId,
  playerId,
  isReady,
  allMembers,
);
```

**Parameters:**

- `campaignId` (string): ID campagna
- `playerId` (string): User ID giocatore
- `isReady` (boolean): Stato ready
- `allMembers` (Array<string>): Tutti i membri della campagna

**Returns:**

```javascript
{
  success: boolean,
  error: string | null
}
```

**Example:**

```javascript
const { error } = await togglePlayerReady(
  campaignId,
  user.uid,
  true,
  campaign.members,
);
```

---

#### executeDraft

Esegue il draft assegnando leader random ai giocatori.

```javascript
const { success, error } = await executeDraft(campaignId, playerIds);
```

**Parameters:**

- `campaignId` (string): ID campagna
- `playerIds` (Array<string>): Array di user IDs

**Returns:**

```javascript
{
  success: boolean,
  error: string | null
}
```

**Example:**

```javascript
await executeDraft(campaignId, campaign.members);
```

---

#### submitBanVote

Vota per bannare un leader di un avversario.

```javascript
const { success, error } = await submitBanVote(
  campaignId,
  voterId,
  targetPlayerId,
  bannedLeaderId,
  allMembers,
);
```

**Parameters:**

- `campaignId` (string): ID campagna
- `voterId` (string): User ID votante
- `targetPlayerId` (string): User ID target del ban
- `bannedLeaderId` (string): ID leader da bannare
- `allMembers` (Array<string>): Tutti i membri

**Returns:**

```javascript
{
  success: boolean,
  error: string | null
}
```

**Example:**

```javascript
const { error } = await submitBanVote(
  campaignId,
  user.uid,
  targetId,
  leaderId,
  campaign.members,
);
```

---

#### finalizeBans

Finalizza i ban votati e passa alla fase completata.

```javascript
const { success, error } = await finalizeBans(campaignId, playerIds);
```

**Parameters:**

- `campaignId` (string): ID campagna
- `playerIds` (Array<string>): Array di user IDs

**Returns:**

```javascript
{
  success: boolean,
  error: string | null
}
```

**Example:**

```javascript
await finalizeBans(campaignId, campaign.members);
```

---

#### selectFinalLeader

Seleziona leader finale dopo il draft.

```javascript
const { success, error } = await selectFinalLeader(
  campaignId,
  playerId,
  leaderId,
);
```

**Parameters:**

- `campaignId` (string): ID campagna
- `playerId` (string): User ID giocatore
- `leaderId` (string): ID leader scelto

**Returns:**

```javascript
{
  success: boolean,
  error: string | null
}
```

**Example:**

```javascript
const { error } = await selectFinalLeader(
  campaignId,
  user.uid,
  selectedLeader.id,
);
if (!error) console.log("Leader selected");
```

---

#### markPlayerSeenDraft

Segna che un giocatore ha visualizzato il risultato del draft.

**Parameters:**

- `campaignId` (string): ID campagna
- `playerId` (string): ID giocatore

**Returns:**

```javascript
{
  success: boolean,
  error: string | null
}
```

**Esempio:**

```javascript
const { success } = await markPlayerSeenDraft(campaignId, user.uid);
```

---

#### voteResetDraft

Vota per resettare il draft e ricominciare da capo.

**Parameters:**

- `campaignId` (string): ID campagna
- `playerId` (string): ID giocatore votante
- `votesReset` (boolean): `true` per votare reset, `false` per annullare voto

**Returns:**

```javascript
{
  success: boolean,
  error: string | null
}
```

**Esempio:**

```javascript
const { success } = await voteResetDraft(campaignId, user.uid, true);
```

---

#### resetDraft

Resetta manualmente il draft allo stato iniziale.

**Parameters:**

- `campaignId` (string): ID campagna

**Returns:**

```javascript
{
  success: boolean,
  error: string | null
}
```

**Esempio:**

```javascript
const { success } = await resetDraft(campaignId);
```

---

### Storage

**Path:** `src/services/firebase/storage.js`

Servizi per file storage.

#### uploadFile

Upload file su Firebase Storage.

```javascript
const { url, error } = await uploadFile(file, path);
```

**Parameters:**

- `file` (File): File object da upload
- `path` (string): Percorso storage (es: `avatars/user123.jpg`)

**Returns:**

```javascript
{
  url: string | null,    // URL pubblico del file
  error: string | null
}
```

**Example:**

```javascript
const file = document.querySelector('input[type="file"]').files[0];
const { url } = await uploadFile(file, `avatars/${userId}.jpg`);
if (url) await updateUserProfile({ photoURL: url });
```

---

#### uploadFileWithProgress

Upload con tracking progresso.

```javascript
const { url, error } = await uploadFileWithProgress(file, path, onProgress);
```

**Parameters:**

- `file` (File): File da upload
- `path` (string): Percorso storage
- `onProgress` (function): Callback per progresso

**Example:**

```javascript
const { url } = await uploadFileWithProgress(
  file,
  `images/${Date.now()}.jpg`,
  (progress) => {
    setUploadProgress(progress);
  },
);
```

---

#### getFileURL

Ottieni URL pubblico di un file.

```javascript
const { url, error } = await getFileURL(path);
```

**Parameters:**

- `path` (string): Percorso file

**Returns:**

```javascript
{
  url: string | null,
  error: string | null
}
```

**Example:**

```javascript
const { url } = await getFileURL("avatars/user123.jpg");
```

---

#### deleteFile

Elimina file da storage.

```javascript
const { error } = await deleteFile(path);
```

**Parameters:**

- `path` (string): Percorso file

**Returns:**

```javascript
{
  error: string | null;
}
```

**Example:**

```javascript
const { error } = await deleteFile("avatars/old-avatar.jpg");
```

---

#### listFiles

Lista file in una directory.

```javascript
const { files, error } = await listFiles(path);
```

**Parameters:**

- `path` (string): Percorso directory

**Returns:**

```javascript
{
  files: Array<string> | null,  // Array di nomi file
  error: string | null
}
```

**Example:**

```javascript
const { files } = await listFiles("avatars/");
```

---

## Custom Hooks

Path: `src/hooks/`

Documentazione completa in [HOOKS.md](HOOKS.md).

**Available Hooks:**

- `useAuth()` - Auth state tracking
- `useCollection()` - Real-time collection
- `useDocument()` - Real-time document
- `useFileUpload()` - File upload con progress

---

## Contexts

Path: `src/contexts/`

Documentazione completa in [CONTEXTS.md](CONTEXTS.md).

**Available Contexts:**

- `AuthContext` - Global auth state
- `ModalContext` - Modal management

**Hooks:**

- `useAuthContext()` - Access auth
- `useModal()` - Access modal context

---

## Utils

Path: `src/utils/`

### Campaign Utils

**Path:** `src/utils/campaignUtils.js`

#### generateCampaignCode

Genera codice campagna univoco di 8 caratteri.

```javascript
const code = generateCampaignCode();
```

**Parameters:** None

**Returns:**

- `string` - Codice 8 caratteri (es: "AB12CD34")

**Example:**

```javascript
const code = generateCampaignCode();
console.log(code); // "XY34ZW56"
```

---

#### isValidCampaignCode

Valida formato codice campagna.

```javascript
const isValid = isValidCampaignCode(code);
```

**Parameters:**

- `code` (string): Codice da validare

**Returns:**

- `boolean` - true se valido

**Example:**

```javascript
isValidCampaignCode("ABC12345");
isValidCampaignCode("abc123");
isValidCampaignCode("ABC@1234");
```

**Regole:** 8 caratteri, solo lettere (A-Z) e numeri (0-9), case-insensitive

---

#### formatCampaignCode

Formatta codice per display (con spazi).

```javascript
const formatted = formatCampaignCode(code);
```

**Parameters:**

- `code` (string): Codice 8 caratteri

**Returns:**

- `string` - Codice formattato (es: "AB 12 CD 34")

**Example:**

```javascript
formatCampaignCode("ABC12345");
```

---

## Error Handling

Tutti i servizi ritornano oggetti con pattern consistente:

```javascript
{
  data/user/campaign/...: result | null,
  error: string | null
}
```

**Best Practice:**

```javascript
const { data, error } = await someService();

if (error) {
  console.error("Error:", error);
  // Gestisci errore (alert, toast, etc.)
  return;
}

// Usa data
console.log("Success:", data);
```

---

## Type Definitions (Reference)

### FirebaseUser

```typescript
interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  photoURL: string | null;
  phoneNumber: string | null;
  // ...altri campi Firebase
}
```

### Campaign

```typescript
interface Campaign {
  id: string;
  name: string;
  code: string; // 8 caratteri
  createdBy: string; // UID creatore
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  members: string[]; // Array di UIDs
  memberDetails: {
    [uid: string]: {
      username: string;
      joinedAt: string;
    };
  };
}
```

---

## Rate Limits & Quotas

### Firebase Quotas (Free Tier)

**Authentication:**

- Unlimited users
- 50 requests/sec (per project)

**Firestore:**

- 1GB storage
- 50k reads/day
- 20k writes/day
- 20k deletes/day

**Storage:**

- 5GB storage
- 1GB/day download

**Hosting:**

- 10GB storage
- 360MB/day bandwidth

---

## Best Practices

### 1. Error Handling

```javascript
// ✅ Always check errors
const { data, error } = await service();
if (error) {
  // Handle error
  return;
}

// ✅ Use try/catch for unexpected errors
try {
  await service();
} catch (err) {
  console.error("Unexpected:", err);
}
```

### 2. Real-time Listeners

```javascript
// ✅ Always cleanup
useEffect(() => {
  const unsubscribe = subscribeToCollection("items", callback);
  return () => unsubscribe();
}, []);
```

### 3. Firestore Queries

```javascript
// ✅ Query server-side
useCollection("campaigns", [
  {
    type: "where",
    field: "members",
    operator: "array-contains",
    value: userId,
  },
]);

// ❌ Evita filter client-side
const { documents: all } = useCollection("campaigns");
const mine = all.filter((c) => c.members.includes(userId));
```

---

Per maggiori dettagli, consulta:

- [Architecture](ARCHITECTURE.md)
- [Components](COMPONENTS.md)
- [Hooks](HOOKS.md)
- [Contexts](CONTEXTS.md)
- [Developer Guide](DEVELOPER_GUIDE.md)
