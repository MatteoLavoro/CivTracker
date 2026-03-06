// Hook to track authentication state
import { useState, useEffect } from "react";
import { onAuthChange } from "../services/firebase/auth";
import { preloadImage } from "../utils/imagePreloader";

/**
 * Hook to track authentication state
 * @returns {Object} { user, loading, error }
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const unsubscribe = onAuthChange((user) => {
        setUser(user);
        setLoading(false);

        // Preload user's profile image
        if (user?.photoURL) {
          preloadImage(user.photoURL).catch((err) => {
            console.warn("Failed to preload user profile image:", err);
          });
        }
      });

      return unsubscribe;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  return { user, loading, error };
}
