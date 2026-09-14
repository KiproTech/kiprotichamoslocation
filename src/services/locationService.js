// Location service
//
// Wraps the browser's Geolocation API and normalizes the result into a
// plain object. No network requests are made from this module — the
// returned data stays in memory for the current browser session only.
//
// Accuracy notes:
// - GPS accuracy depends heavily on the device (dedicated GPS chips are
//   generally far more accurate than Wi-Fi/IP based positioning).
// - Indoor locations are typically less accurate, sometimes by a large
//   margin, because GPS signals are weak or blocked indoors.
// - The `accuracy` value returned by the browser is an estimated radius,
//   in metres, of a 95% confidence circle around the reported coordinates
//   — it is an estimate, not a guarantee.
// - This website cannot request or guarantee any specific accuracy; it
//   can only ask the browser for the best it is able to provide.

/**
 * Error codes this service can resolve to. Mirrors the meaningful subset
 * of GeolocationPositionError plus one for missing browser support.
 */
export const LOCATION_ERROR = {
  UNSUPPORTED: "UNSUPPORTED",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  POSITION_UNAVAILABLE: "POSITION_UNAVAILABLE",
  TIMEOUT: "TIMEOUT",
  UNKNOWN: "UNKNOWN",
};

/**
 * Above this reported accuracy radius (metres), a result is treated as
 * "low accuracy" rather than a usable location — the UI will ask the
 * visitor to try again instead of presenting it as their location.
 */
export const LOW_ACCURACY_THRESHOLD_METERS = 100;

/**
 * Returns true when a location's reported accuracy is too poor to
 * confidently show as the visitor's location.
 */
export function isLowAccuracy(location) {
  return (
    !location ||
    typeof location.accuracy !== "number" ||
    Number.isNaN(location.accuracy) ||
    location.accuracy > LOW_ACCURACY_THRESHOLD_METERS
  );
}

const DEFAULT_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
};

/**
 * Checks whether the current browser exposes the Geolocation API at all.
 */
export function isGeolocationSupported() {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
}

/**
 * Maps a native GeolocationPositionError to one of our LOCATION_ERROR codes.
 */
function mapPositionError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return LOCATION_ERROR.PERMISSION_DENIED;
    case error.POSITION_UNAVAILABLE:
      return LOCATION_ERROR.POSITION_UNAVAILABLE;
    case error.TIMEOUT:
      return LOCATION_ERROR.TIMEOUT;
    default:
      return LOCATION_ERROR.UNKNOWN;
  }
}

/**
 * Requests the visitor's current location using the browser Geolocation
 * API and resolves with a clean, minimal object:
 *
 *   { latitude, longitude, accuracy, timestamp }
 *
 * Coordinates and accuracy are used exactly as reported by the browser —
 * nothing here fabricates or adjusts them. Rejects with an Error whose
 * `.code` is one of LOCATION_ERROR when something goes wrong.
 *
 * This function does not send the result anywhere and never will — the
 * returned location is only used to show the visitor their own position
 * on their own screen (see src/utils/mapLinks.js for the map/navigation
 * helpers that consume this same shape).
 */
export function getCurrentLocation(options = {}) {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      const err = new Error("Your browser does not support location services.");
      err.code = LOCATION_ERROR.UNSUPPORTED;
      reject(err);
      return;
    }

    const finalOptions = { ...DEFAULT_OPTIONS, ...options };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        resolve({
          latitude,
          longitude,
          accuracy,
          timestamp: position.timestamp,
        });
      },
      (positionError) => {
        const code = mapPositionError(positionError);
        const err = new Error(positionError.message || "Location request failed.");
        err.code = code;
        reject(err);
      },
      finalOptions
    );
  });
}
