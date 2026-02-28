// Hook to get real-time data from a Firestore document
import { useState, useEffect } from "react";
import { subscribeToDocument } from "../services/firebase/firestore";

/**
 * Hook to get real-time data from a Firestore document
 * @param {string} collectionName - Name of the collection
 * @param {string} documentId - ID of the document
 * @returns {Object} { document, loading, error }
 */
export function useDocument(collectionName, documentId) {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionName || !documentId) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = subscribeToDocument(
        collectionName,
        documentId,
        (doc) => {
          setDocument(doc);
          setLoading(false);
        },
      );

      return unsubscribe;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [collectionName, documentId]);

  return { document, loading, error };
}
