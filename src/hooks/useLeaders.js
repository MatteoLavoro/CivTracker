// Hook to get all leaders from Firestore
import { useCollection } from "./useCollection";

/**
 * Hook to get all leaders with real-time updates
 * @returns {Object} { leaders, loading, error }
 */
export function useLeaders() {
  const {
    documents: leaders,
    loading,
    error,
  } = useCollection("leaders", [
    { type: "orderBy", field: "number", direction: "asc" },
  ]);

  return { leaders, loading, error };
}
