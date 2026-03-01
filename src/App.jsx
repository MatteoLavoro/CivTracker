import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./contexts";
import { Auth, Home } from "./pages";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { InstallPrompt } from "./components/common";
import "./App.css";

function App() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-spinner"></div>
      </div>
    );
  }

  return (
    <>
      <InstallPrompt />
      <BrowserRouter>
        <Routes>
          {/* Auth Route - Redirect to home if already logged in */}
          <Route
            path="/"
            element={user ? <Navigate to="/home" replace /> : <Auth />}
          />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home or auth */}
          <Route
            path="*"
            element={<Navigate to={user ? "/home" : "/"} replace />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
