import { useState, useEffect } from "react";
import { X, Download, Share, Plus } from "lucide-react";
import "./InstallPrompt.css";

export const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [platform, setPlatform] = useState(null);

  useEffect(() => {
    // Check if user has already seen the prompt
    const hasSeenPrompt = localStorage.getItem("pwa-install-prompt-seen");

    // Check if app is already installed
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone ||
      document.referrer.includes("android-app://");

    if (hasSeenPrompt || isStandalone) {
      return;
    }

    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMobile = isIOS || isAndroid;

    if (!isMobile) {
      // Don't show on desktop
      return;
    }

    if (isIOS) {
      setPlatform("ios");
      // Show immediately on iOS since there's no beforeinstallprompt event
      setTimeout(() => setShowPrompt(true), 1000);
    } else if (isAndroid) {
      setPlatform("android");
    }

    // Listen for the beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPlatform("android");
      setTimeout(() => setShowPrompt(true), 1000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    handleClose();
  };

  const handleClose = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-prompt-seen", "true");
  };

  if (!showPrompt || !platform) {
    return null;
  }

  return (
    <div className="install-prompt-overlay">
      <div className="install-prompt">
        <button
          className="install-prompt-close"
          onClick={handleClose}
          aria-label="Chiudi"
        >
          <X size={24} />
        </button>

        <div className="install-prompt-content">
          <div className="install-prompt-icon">
            <img src="/web-app-manifest-192x192.png" alt="CivTracker" />
          </div>

          <h2 className="install-prompt-title">Installa CivTracker</h2>

          {platform === "android" ? (
            <>
              <p className="install-prompt-description">
                Installa l'app per un accesso rapido e un'esperienza migliore!
              </p>

              <div className="install-prompt-actions">
                <button
                  className="install-prompt-button primary"
                  onClick={handleInstallClick}
                >
                  <Download size={20} />
                  Installa App
                </button>
                <button
                  className="install-prompt-button secondary"
                  onClick={handleClose}
                >
                  Non ora
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="install-prompt-description">
                Installa l'app sulla tua schermata home per un accesso rapido!
              </p>

              <div className="install-prompt-steps">
                <div className="install-prompt-step">
                  <div className="install-prompt-step-number">1</div>
                  <div className="install-prompt-step-content">
                    <p>
                      Tocca il pulsante di condivisione{" "}
                      <Share size={16} className="inline-icon" /> nella barra
                      inferiore del browser
                    </p>
                  </div>
                </div>

                <div className="install-prompt-step">
                  <div className="install-prompt-step-number">2</div>
                  <div className="install-prompt-step-content">
                    <p>
                      Scorri e tocca{" "}
                      <strong>"Aggiungi a schermata Home"</strong>{" "}
                      <Plus size={16} className="inline-icon" />
                    </p>
                  </div>
                </div>

                <div className="install-prompt-step">
                  <div className="install-prompt-step-number">3</div>
                  <div className="install-prompt-step-content">
                    <p>
                      Conferma toccando <strong>"Aggiungi"</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="install-prompt-actions">
                <button
                  className="install-prompt-button secondary full-width"
                  onClick={handleClose}
                >
                  Ho capito
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
