# Pages

Page-level components representing different routes/views.

## Structure

```
pages/
├── Home/
│   ├── Home.jsx
│   └── Home.css
├── Auth/
│   ├── Login.jsx
│   └── Register.jsx
└── Dashboard/
    └── Dashboard.jsx
```

## Example

```javascript
// pages/Home/Home.jsx
export function Home() {
  return (
    <div className="home-page">
      <h1>Welcome to CivTracker</h1>
    </div>
  );
}
```

## Usage with Router

```javascript
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home/Home";
import { Dashboard } from "./pages/Dashboard/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
```
