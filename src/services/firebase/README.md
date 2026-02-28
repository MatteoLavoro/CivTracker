# Firebase Services

Firebase integration with modular services for CivTracker.

## Files

- `config.js` - Firebase initialization
- `auth.js` - Authentication
- `firestore.js` - Database
- `storage.js` - File storage
- `index.js` - Main exports

**Note**: Hooks are now in `src/hooks/` and contexts in `src/contexts/`

## Quick Usage

### Authentication

```javascript
// Use context (recommended)
import { useAuthContext } from "../../contexts";
const { user, loading } = useAuthContext();

// Or use hook directly
import { useAuth } from "../../hooks";
const { user, loading } = useAuth();

// Auth methods
import { signIn, signUp, logOut } from "../../services/firebase";
await signUp("email@example.com", "password", "Name");
await signIn("email@example.com", "password");
await logOut();
```

### Firestore

```javascript
import {
  createDocument,
  getCollection,
  updateDocument,
} from "../../services/firebase";
import { useCollection } from "../../hooks";

// Hook
const { documents, loading } = useCollection("items");

// Methods
const { id } = await createDocument("items", { name: "Item" });
const { data } = await getCollection("items");
await updateDocument("items", id, { name: "Updated" });
```

### Storage

```javascript
import { uploadFile, deleteFile } from "../../services/firebase";
import { useFileUpload } from "../../hooks";

// Hook
const { uploadFile, progress, uploading } = useFileUpload();

// Methods
const { url } = await uploadFile(file, "path/file.jpg");
await deleteFile("path/file.jpg");
```

## Available Functions

### Auth (auth.js)

- `signUp(email, password, displayName)`
- `signIn(email, password)`
- `signInWithGoogle()`
- `logOut()`
- `resetPassword(email)`
- `onAuthChange(callback)`
- `getCurrentUser()`

### Firestore (firestore.js)

- `createDocument(collection, data)`
- `setDocument(collection, id, data)`
- `getDocument(collection, id)`
- `getCollection(collection)`
- `updateDocument(collection, id, data)`
- `deleteDocument(collection, id)`
- `queryDocuments(collection, conditions)`
- `subscribeToCollection(collection, callback, conditions)`
- `subscribeToDocument(collection, id, callback)`

### Storage (storage.js)

- `uploadFile(file, path)`
- `uploadFileWithProgress(file, path, onProgress)`
- `getFileURL(path)`
- `deleteFile(path)`
- `listFiles(path)`

## Hooks

Custom hooks are located in `src/hooks/`:

- `useAuth()` - Returns `{ user, loading, error }`
- `useCollection(collection, conditions)` - Returns `{ documents, loading, error }`
- `useDocument(collection, id)` - Returns `{ document, loading, error }`
- `useFileUpload()` - Returns `{ uploadFile, progress, uploading, error, downloadURL }`
