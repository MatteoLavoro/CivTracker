// Hook to get a single leader from Firestore
import { useDocument } from "./useDocument";

/**
 * Hook to get a single leader with real-time updates
 * @param {string} leaderId - Leader document ID
 * @returns {Object} { leader, loading, error }
 */
export function useLeader(leaderId) {
  const { document: leader, loading, error } = useDocument("leaders", leaderId);

  return { leader, loading, error };
}
