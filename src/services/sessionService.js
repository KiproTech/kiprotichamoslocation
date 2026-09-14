// Session service
//
// Generates a single anonymous identifier for the current browser visit.
// It exists only in memory for the lifetime of the tab, is never sent
// anywhere, and is not derived from phone number, email, IMEI,
// advertising ID, or any other identifying source.

let cachedSessionId = null;

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for browsers without crypto.randomUUID support.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Returns a stable anonymous session ID for the lifetime of the current
 * page session (kept only in memory — not persisted to storage yet).
 */
export function getSessionId() {
  if (!cachedSessionId) {
    cachedSessionId = generateId();
  }
  return cachedSessionId;
}
