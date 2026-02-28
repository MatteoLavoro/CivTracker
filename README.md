# CivTracker

Modern web application with React, Vite, and Firebase featuring authentication, dark theme, and modular architecture.

## Tech Stack

- **React 19** + **Vite 7** - Latest React with fast build tooling
- **Firebase 12** - Authentication, Firestore, Storage
- **Tailwind CSS 4** - Utility-first CSS framework
- **React Router DOM 6** - Client-side routing

## Design

- **Dark Theme** - Gradient background from #0a1929 to #1a2332
- **Primary Color** - rgba(15, 50, 82, 1)
- **Responsive** - Mobile-first design with breakpoints at sm (640px), md (768px), lg (1024px)

## Project Structure

```
src/
├── components/
│   ├── common/           # Button, Input with variants and validation
│   ├── layout/           # AuthLayout wrapper
│   └── ProtectedRoute.jsx
├── contexts/             # AuthContext for global auth state
├── hooks/                # useAuth, useCollection, useDocument, useFileUpload
├── pages/
│   ├── Auth/             # Login/Register page (landing page)
│   └── Home/             # Protected dashboard (WIP)
├── services/
│   └── firebase/         # Firebase config and modular services
├── utils/                # Helper functions
└── assets/               # Static assets
```

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure Firebase:**
   - Copy your Firebase config to [src/services/firebase/config.js](src/services/firebase/config.js)
   - Or set environment variables (VITE_FIREBASE_API_KEY, etc.)

3. **Start development server:**
   ```bash
   npm run dev
   ```
4. **Open browser:**
   - Navigate to `http://localhost:5173` (or the port shown in terminal)
   - Register a new account or login

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code with ESLint

## Features

### Authentication System

- Email + Username + Password registration
- Login with email/password
- Protected routes with loading states
- Form validation (email format, password length)
- "Remember me" option
- Persistent sessions

See [docs/AUTH_DOCUMENTATION.md](docs/AUTH_DOCUMENTATION.md) for complete authentication documentation.

### Components

**Button** - 3 variants (primary, secondary, outline) with loading states

```javascript
import { Button } from "./components/common/Button";
<Button variant="primary" loading={isLoading}>
  Submit
</Button>;
```

**Input** - Validation, error display, password visibility toggle

```javascript
import { Input } from "./components/common/Input";
<Input type="email" label="Email" error={emailError} />;
```

**AuthLayout** - Consistent auth page wrapper with glassmorphism

```javascript
import { AuthLayout } from "./components/layout/AuthLayout";
<AuthLayout title="Welcome" subtitle="Login to continue">
  {children}
</AuthLayout>;
```

### Usage Examples

#### Authentication

```javascript
import { useAuthContext } from "./contexts";
import { signIn, signUp, logOut } from "./services/firebase";

// Get current user
const { user, loading } = useAuthContext();

// Sign up
await signUp("email@example.com", "password", "username");

// Sign in
await signIn("email@example.com", "password");

// Sign out
await logOut();
```

#### Firestore Database

```javascript
import { useCollection, useDocument } from "./hooks";
import { createDocument, updateDocument } from "./services/firebase";

// Real-time collection
const { documents, loading } = useCollection("users");

// Real-time document
const { document, loading } = useDocument("users", userId);

// Create document
await createDocument("users", { name: "John", age: 30 });

// Update document
await updateDocument("users", docId, { age: 31 });
```

#### File Storage

```javascript
import { useFileUpload } from "./hooks";
import { uploadFile, deleteFile } from "./services/firebase";

// Upload with progress
const { uploadFile, progress, uploading } = useFileUpload();
const url = await uploadFile(file, "avatars/user.jpg");

// Delete file
await deleteFile("avatars/user.jpg");
```

## Documentation

- [Authentication System](docs/AUTH_DOCUMENTATION.md) - Complete auth guide
- [Firebase Services](src/services/firebase/README.md) - Firebase integration

## Deploy

```bash
# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy
```

## Project Status

✅ **Completed:**

- Firebase configuration with environment variables
- Modular service architecture (auth, firestore, storage)
- Custom React hooks
- Authentication UI (login/register)
- Protected routing
- Dark theme with responsive design
- Comprehensive documentation

🚧 **Work in Progress:**

- Analytics dashboard
- Map tracking
- Progress reports
- Team management
