// Protected Route Component
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../contexts";

/**
 * Protected Route wrapper
 * Redirects to auth page if user is not authenticated
 */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a1929 0%, #1a2332 100%)",
          color: "white",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "4px solid rgba(255,255,255,0.1)",
            borderTopColor: "rgba(15,50,82,1)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        ></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
