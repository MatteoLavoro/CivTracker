import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider, ModalProvider } from "./contexts";
import "./index.css";
import App from "./App.jsx";

// Import seeding utilities only in development (exposed on window)
if (import.meta.env.DEV) {
  import("./utils/seedDatabase");
}

// Register Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log(
          "Service Worker registered successfully:",
          registration.scope,
        );

        // Check for updates periodically
        setInterval(() => {
          registration.update().catch((error) => {
            // Offline or transient network errors must not break the app
            console.warn("Service Worker update failed:", error);
          });
        }, 60000); // Check every minute
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ModalProvider>
        <App />
      </ModalProvider>
    </AuthProvider>
  </StrictMode>,
);
