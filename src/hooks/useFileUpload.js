// Hook to handle file upload with progress tracking
import { useState } from "react";

/**
 * Hook to handle file upload with progress tracking
 * @returns {Object} { uploadFile, progress, uploading, error, downloadURL }
 */
export function useFileUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadURL, setDownloadURL] = useState(null);

  const uploadFile = async (file, path, onProgressCallback) => {
    setUploading(true);
    setProgress(0);
    setError(null);
    setDownloadURL(null);

    try {
      const { uploadFileWithProgress } =
        await import("../services/firebase/storage");

      const result = await uploadFileWithProgress(
        file,
        path,
        (progressValue) => {
          setProgress(progressValue);
          if (onProgressCallback) {
            onProgressCallback(progressValue);
          }
        },
      );

      if (result.error) {
        throw new Error(result.error);
      }

      setDownloadURL(result.url);
      setUploading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setUploading(false);
      return { url: null, error: err.message };
    }
  };

  return { uploadFile, progress, uploading, error, downloadURL };
}
