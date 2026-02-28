# Components

Reusable React components.

## Structure

Organize components by feature or type:

```
components/
├── common/          # Common UI components (Button, Input, etc.)
├── layout/          # Layout components (Header, Footer, Sidebar)
└── features/        # Feature-specific components
```

## Example

```javascript
// components/common/Button.jsx
export function Button({ children, onClick, variant = "primary" }) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}
```

## Usage

```javascript
import { Button } from "./components/common/Button";

function MyPage() {
  return <Button onClick={() => console.log("clicked")}>Click me</Button>;
}
```
