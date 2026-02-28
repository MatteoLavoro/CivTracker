// Hook to get real-time data from a Firestore collection
import { useState, useEffect } from "react";
import { subscribeToCollection } from "../services/firebase/firestore";

/**
 * Hook to get real-time data from a Firestore collection
 * @param {string} collectionName - Name of the collection
 * @param {Array} conditions - Array of query conditions
 * @returns {Object} { documents, loading, error }
 */
export function useCollection(collectionName, conditions = []) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionName) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = subscribeToCollection(
        collectionName,
        (docs) => {
          setDocuments(docs);
          setLoading(false);
        },
        conditions,
      );

      return unsubscribe;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [collectionName, JSON.stringify(conditions)]);

  return { documents, loading, error };
}
