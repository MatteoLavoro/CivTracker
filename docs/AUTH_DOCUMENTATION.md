# Authentication System Documentation

This documentation describes the authentication system implemented in CivTracker.

## Overview

The authentication system provides secure user registration and login functionality using Firebase Authentication. It features a dark theme with responsive design for both mobile and desktop.

## Color Scheme

- **Primary Color**: `rgba(15, 50, 82, 1)` - Main brand color
- **Primary Hover**: `rgba(20, 65, 105, 1)` - Hover state
- **Background**: Dark gradient from `#0a1929` to `#1a2332`
- **Surface**: `rgba(20, 30, 40, 0.95)` with backdrop blur

## Components

### Pages

#### Auth (`src/pages/Auth/Auth.jsx`)

Main authentication page with toggle between login and registration modes.

**Features**:

- Email/password authentication
- Username field for registration
- Form validation with error messages
- Loading states
- Seamless mode switching
- Automatic redirect to home on success

**Props**: None (managed internally)

**State**:

- `isLogin`: boolean - Toggle between login/register
- `formData`: object - Email, username, password
- `validationErrors`: object - Field-specific errors
- `loading`: boolean - Form submission state
- `error`: string - Firebase error messages

#### Home (`src/pages/Home/Home.jsx`)

Post-login dashboard with "Work in Progress" message.

**Features**:

- User display name
- Sign out functionality
- Future features preview
- Responsive layout

### Layout Components

#### AuthLayout (`src/components/layout/AuthLayout.jsx`)

Wrapper component for authentication pages providing consistent styling.

**Props**:

- `children`: ReactNode - Page content
- `title`: string - Main heading
- `subtitle`: string - Description text

**Usage**:

```jsx
<AuthLayout title="Welcome" subtitle="Sign in to continue">
  <YourForm />
</AuthLayout>
```

### Common Components

#### Button (`src/components/common/Button.jsx`)

Reusable button component with multiple variants and states.

**Props**:

- `children`: ReactNode - Button content
- `onClick`: function - Click handler
- `type`: string - 'button' | 'submit' | 'reset' (default: 'button')
- `variant`: string - 'primary' | 'secondary' | 'outline' (default: 'primary')
- `disabled`: boolean - Disabled state
- `fullWidth`: boolean - Full width button
- `loading`: boolean - Loading state with spinner

**Variants**:

- **Primary**: Main action buttons (rgba(15, 50, 82))
- **Secondary**: Alternative actions
- **Outline**: Tertiary actions

**Usage**:

```jsx
<Button type="submit" variant="primary" fullWidth loading={isLoading}>
  Submit
</Button>
```

#### Input (`src/components/common/Input.jsx`)

Reusable input component with validation and error display.

**Props**:

- `label`: string - Input label
- `type`: string - Input type (default: 'text')
- `value`: string - Input value
- `onChange`: function - Change handler
- `placeholder`: string - Placeholder text
- `error`: string - Error message
- `required`: boolean - Required field
- `disabled`: boolean - Disabled state
- `icon`: string - Icon emoji/text

**Features**:

- Password visibility toggle
- Focus states with border animation
- Error state styling
- Icon support
- Mobile-optimized (prevents zoom on iOS)

**Usage**:

```jsx
<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="your@email.com"
  error={errors.email}
  required
  icon="📧"
/>
```

### Utility Components

#### ProtectedRoute (`src/components/ProtectedRoute.jsx`)

Route wrapper that requires authentication.

**Props**:

- `children`: ReactNode - Protected content

**Behavior**:

- Shows loading spinner while checking auth
- Redirects to `/` if not authenticated
- Renders children if authenticated

**Usage**:

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

## Routing Structure

```
/ (root)
├─ / - Auth page (redirects to /home if authenticated)
├─ /home - Home dashboard (protected)
└─ * - Catch all (redirects based on auth state)
```

## Authentication Flow

### Registration Flow

1. User enters email, username, and password
2. Form validates all fields:
   - Email format check
   - Username length (min 3 characters)
   - Password length (min 6 characters)
3. On submit, calls `signUp()` from Firebase service
4. Sets display name to username
5. Redirects to `/home` on success
6. Shows error message on failure

### Login Flow

1. User enters email and password
2. Form validates required fields
3. On submit, calls `signIn()` from Firebase service
4. Redirects to `/home` on success
5. Shows error message on failure

### Logout Flow

1. User clicks "Sign Out" button
2. Calls `logOut()` from Firebase service
3. Redirects to `/` (auth page)
4. AuthContext clears user state

## Form Validation

### Email Validation

- Required field
- Must match email pattern: `/\S+@\S+\.\S+/`

### Username Validation (Register only)

- Required field
- Minimum 3 characters

### Password Validation

- Required field
- Minimum 6 characters

## Error Handling

### Validation Errors

- Displayed below each input field
- Red text color (#ff4444)
- Clears when user starts typing

### Firebase Errors

- Displayed at top of form
- Red background with border
- Common errors:
  - Invalid credentials
  - Email already in use
  - Weak password
  - Network errors

## Responsive Design

### Breakpoints

- **Desktop**: > 768px
  - Full layout with all features
  - Username displayed in header
  - Larger form elements

- **Tablet**: 481px - 768px
  - Adjusted padding and spacing
  - Username hidden in header
  - Optimized form layout

- **Mobile**: ≤ 480px
  - Compact layout
  - Full-width buttons
  - Larger touch targets
  - Single column grid

### Mobile Optimizations

1. **Font sizes**: 16px minimum to prevent iOS zoom
2. **Touch targets**: Minimum 44x44px
3. **No horizontal scroll**: overflow-x: hidden
4. **Smooth scrolling**: Native scroll behavior
5. **Safe areas**: Padding for notches

## Styling Best Practices

### CSS Organization

- Each component has its own CSS file
- Global styles in `index.css`
- No inline styles (except loading spinner)
- CSS custom properties for theming

### Animation Guidelines

- Transitions: 0.2s - 0.3s for interactions
- Keyframe animations for loaders
- Reduced motion support

### Accessibility

- Focus visible states
- ARIA labels where needed
- Keyboard navigation support
- Screen reader friendly

## Firebase Integration

### Services Used

- **Authentication**: Email/password provider
- **Firestore**: User data storage (future)
- **Storage**: Profile images (future)

### Security

- Client-side validation
- Firebase security rules (server-side)
- Password minimum requirements
- Secure session management

## Testing Checklist

- [ ] Registration with valid data
- [ ] Registration with invalid email
- [ ] Registration with short username
- [ ] Registration with short password
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Form validation messages
- [ ] Loading states
- [ ] Sign out functionality
- [ ] Protected route redirect
- [ ] Mobile responsive layout
- [ ] Tablet responsive layout
- [ ] Desktop layout
- [ ] Password visibility toggle
- [ ] Error message display

## Future Enhancements

1. **Social Login**: Google, Facebook, GitHub
2. **Password Reset**: Email reset link
3. **Remember Me**: Persistent session
4. **Two-Factor Auth**: SMS or app-based
5. **Profile Completion**: Avatar, bio, etc.
6. **Email Verification**: Required verification
7. **Rate Limiting**: Prevent brute force
8. **OAuth**: Third-party integrations

## Troubleshooting

### "User not found" error

- User may have entered wrong email
- Check Firebase console for user existence

### "Wrong password" error

- Password is incorrect
- Suggest password reset flow

### "Email already in use" error

- User trying to register with existing email
- Suggest login instead

### Loading never completes

- Check network connection
- Verify Firebase configuration
- Check browser console for errors

## Development Notes

### File Structure

```
src/
├── pages/
│   ├── Auth/
│   │   ├── Auth.jsx
│   │   └── Auth.css
│   └── Home/
│       ├── Home.jsx
│       └── Home.css
├── components/
│   ├── common/
│   │   ├── Button.jsx/css
│   │   └── Input.jsx/css
│   ├── layout/
│   │   └── AuthLayout.jsx/css
│   └── ProtectedRoute.jsx
├── contexts/
│   └── AuthContext.jsx
├── hooks/
│   └── useAuth.js
└── services/
    └── firebase/
```

### Naming Conventions

- Components: PascalCase
- CSS classes: kebab-case
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE

### Code Style

- Functional components with hooks
- Destructured props
- JSDoc comments for props
- Separate style files
- Clean, readable code

---

**Last Updated**: February 28, 2026  
**Version**: 1.0.0  
**Author**: CivTracker Team
