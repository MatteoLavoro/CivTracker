// Campaign Utilities

/**
 * Generate a unique 8-character campaign code
 * Format: XXXXXXXX (letters and numbers)
 * @returns {string} Unique campaign code
 */
export function generateCampaignCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Validate campaign code format
 * @param {string} code - Campaign code to validate
 * @returns {boolean} True if valid
 */
export function isValidCampaignCode(code) {
  if (!code || typeof code !== "string") return false;
  if (code.length !== 8) return false;
  return /^[A-Z0-9]{8}$/.test(code.toUpperCase());
}

/**
 * Format campaign code for display (XX XX XX XX)
 * @param {string} code - Campaign code
 * @returns {string} Formatted code
 */
export function formatCampaignCode(code) {
  if (!code || code.length !== 8) return code;
  return code.match(/.{1,2}/g).join(" ");
}
