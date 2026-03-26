import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./contexts";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { InstallPrompt } from "./components/common";
import "./App.css";

const AuthPage = lazy(() =>
  import("./pages/Auth/Auth").then((module) => ({ default: module.Auth })),
);
const HomePage = lazy(() =>
  import("./pages/Home/Home").then((module) => ({ default: module.Home })),
);
const CampaignPage = lazy(() =>
  import("./pages/Campaign/Campaign").then((module) => ({
    default: module.Campaign,
  })),
);
const DevPage = lazy(() =>
  import("./pages/Dev/Dev").then((module) => ({ default: module.Dev })),
);

function RouteLoadingFallback() {
  return (
    <div className="app-loading">
      <div className="app-spinner"></div>
    </div>
  );
}

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
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            {/* Auth Route - Redirect to home if already logged in */}
            <Route
              path="/"
              element={user ? <Navigate to="/home" replace /> : <AuthPage />}
            />

            {/* Protected Routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />

            {/* Campaign Route */}
            <Route
              path="/campaign/:campaignId"
              element={
                <ProtectedRoute>
                  <CampaignPage />
                </ProtectedRoute>
              }
            />

            {/* Dev Route - Development Tools */}
            <Route
              path="/dev"
              element={
                <ProtectedRoute>
                  <DevPage />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to home or auth */}
            <Route
              path="*"
              element={<Navigate to={user ? "/home" : "/"} replace />}
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;
