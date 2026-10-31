// Hook to get real-time data from a Firestore collection
import { useState, useEffect, useRef } from "react";
import { subscribeToCollection } from "../services/firebase/firestore";

/**
 * Hook to get real-time data from a Firestore collection
 * @param {string} collectionName - Name of the collection
 * @param {Array} conditions - Array of query conditions
 * @returns {Object} { documents, loading, error }
 */
export function useCollection(collectionName, conditions = []) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(Boolean(collectionName));
  const [error, setError] = useState(null);

  // Serialize conditions so the query is re-created only when they change
  const conditionsKey = JSON.stringify(conditions);
  const conditionsRef = useRef(conditions);

  // Keep the latest conditions available without re-subscribing every render
  useEffect(() => {
    conditionsRef.current = conditions;
  });

  useEffect(() => {
    if (!collectionName) return;

    let unsubscribe;
    let errorTimer;
    try {
      unsubscribe = subscribeToCollection(
        collectionName,
        (docs) => {
          setDocuments(docs);
          setError(null);
          setLoading(false);
        },
        conditionsRef.current,
        (err) => {
          setError(err?.message || "Errore di connessione");
          setLoading(false);
        },
      );
    } catch (err) {
      // Invalid query (e.g. missing parameters): report it instead of hanging
      errorTimer = setTimeout(() => {
        setError(err?.message || "Errore di connessione");
        setLoading(false);
      }, 0);
    }

    return () => {
      clearTimeout(errorTimer);
      if (unsubscribe) unsubscribe();
    };
    // conditions are read from the ref; conditionsKey tracks their value
  }, [collectionName, conditionsKey]);

  return { documents, loading, error };
}
