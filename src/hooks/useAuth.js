// Hook to track authentication state
import { useState, useEffect } from "react";
import { onAuthChange } from "../services/firebase/auth";

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
      });

      return unsubscribe;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  return { user, loading, error };
}
