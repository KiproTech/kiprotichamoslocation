// Small formatting helpers kept separate from the service so the service
// stays focused on obtaining data, not presenting it.

/**
 * Formats a latitude/longitude value to a fixed precision without
 * altering the underlying value used elsewhere in the app.
 */
export function formatCoordinate(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return value.toFixed(6);
}

/**
 * Formats the accuracy radius (metres) reported by the browser.
 */
export function formatAccuracy(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `± ${Math.round(value)} metres`;
}

/**
 * Formats the position timestamp (ms since epoch, as provided by the
 * Geolocation API) into a readable local date/time string.
 */
export function formatTimestamp(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return new Date(value).toLocaleString();
}
