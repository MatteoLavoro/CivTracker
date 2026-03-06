/**
 * Image preloading utilities
 * Preload images to improve perceived performance
 */

const preloadedImages = new Set();

/**
 * Preload a single image
 * @param {string} src - Image URL to preload
 * @returns {Promise} - Resolves when image is loaded, rejects on error
 */
export function preloadImage(src) {
  if (!src || preloadedImages.has(src)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      preloadedImages.add(src);
      resolve();
    };
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Preload multiple images
 * @param {Array<string>} sources - Array of image URLs to preload
 * @returns {Promise} - Resolves when all images are loaded or rejected
 */
export function preloadImages(sources) {
  if (!sources || !Array.isArray(sources)) {
    return Promise.resolve();
  }

  const validSources = sources.filter(
    (src) => src && !preloadedImages.has(src),
  );

  if (validSources.length === 0) {
    return Promise.resolve();
  }

  return Promise.allSettled(validSources.map((src) => preloadImage(src)));
}

/**
 * Clear preloaded images cache
 */
export function clearPreloadCache() {
  preloadedImages.clear();
}
