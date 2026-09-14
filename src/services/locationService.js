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
 *
 * Kept equal to TARGET_ACCURACY_METERS so a location is only ever shown
 * once it genuinely meets the ±5 m target — never a looser real reading
 * relabeled as if it were ±5 m.
 */
export const LOW_ACCURACY_THRESHOLD_METERS = 5;

/**
 * A reading at or below this reported accuracy (metres) is considered
 * good enough to stop collecting immediately. This is a *target*, not a
 * guarantee — many devices/environments will never reach it, and the
 * app must accept and display whatever the browser actually reports.
 */
export const TARGET_ACCURACY_METERS = 5;

/** Stop collecting after this many successful readings, win or not. */
export const MAX_READING_ATTEMPTS = 6;

/** Hard ceiling on total time spent refining a reading, in milliseconds. */
export const MAX_COLLECTION_TIME_MS = 12000;

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
 * API, collecting readings until a good one is obtained, and resolves
 * with a clean, minimal object:
 *
 *   { latitude, longitude, accuracy, timestamp }
 *
 * How it improves accuracy without faking anything:
 * - Uses watchPosition (not a single getCurrentPosition call) so the
 *   device's location subsystem can keep refining its fix — GPS chips
 *   commonly report a rough reading first and a tighter one a few
 *   seconds later as more satellites lock in.
 * - Keeps only the single BEST real reading seen so far (smallest
 *   reported `accuracy`) and reports progress via `onProgress` so the UI
 *   can show "Best accuracy: ±N m" while it works.
 * - Stops as soon as any of these is true, to avoid waiting forever or
 *   draining the battery: the best reading reaches
 *   TARGET_ACCURACY_METERS, MAX_READING_ATTEMPTS readings have come in,
 *   or MAX_COLLECTION_TIME_MS has elapsed — then resolves with the best
 *   reading actually obtained.
 * - Never rounds, adjusts, or invents the `accuracy` value. Whatever the
 *   browser reports for the winning reading is exactly what gets
 *   returned and displayed.
 *
 * Coordinates and accuracy are used exactly as reported by the browser.
 * Rejects with an Error whose `.code` is one of LOCATION_ERROR when
 * location could not be obtained at all.
 *
 * This function does not send the result anywhere and never will — the
 * returned location is only used to show the visitor their own position
 * on their own screen (see src/utils/mapLinks.js for the map/navigation
 * helpers that consume this same shape).
 *
 * @param {Object} [config]
 * @param {(best: {latitude:number, longitude:number, accuracy:number, timestamp:number}) => void} [config.onProgress]
 *   Called each time a new best (lower-accuracy-number) reading arrives.
 * @param {Object} [config.geoOptions] Overrides for the Geolocation API options.
 */
export function getCurrentLocation({ onProgress, geoOptions = {} } = {}) {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      const err = new Error("Your browser does not support location services.");
      err.code = LOCATION_ERROR.UNSUPPORTED;
      reject(err);
      return;
    }

    const finalOptions = { ...DEFAULT_OPTIONS, ...geoOptions };

    let best = null;
    let attempts = 0;
    let settled = false;
    let watchId = null;
    let safetyTimer = null;
    const startedAt = Date.now();

    function cleanup() {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      if (safetyTimer !== null) {
        clearTimeout(safetyTimer);
        safetyTimer = null;
      }
    }

    function finish() {
      if (settled) return;
      settled = true;
      cleanup();
      if (best) {
        resolve(best);
      } else {
        const err = new Error("Location could not be determined.");
        err.code = LOCATION_ERROR.POSITION_UNAVAILABLE;
        reject(err);
      }
    }

    function handleSuccess(position) {
      if (settled) return;
      attempts += 1;

      const { latitude, longitude, accuracy } = position.coords;
      const reading = { latitude, longitude, accuracy, timestamp: position.timestamp };

      if (!best || (typeof accuracy === "number" && accuracy < best.accuracy)) {
        best = reading;
        onProgress?.(best);
      }

      const reachedTarget = best && best.accuracy <= TARGET_ACCURACY_METERS;
      const reachedAttempts = attempts >= MAX_READING_ATTEMPTS;
      const reachedTime = Date.now() - startedAt >= MAX_COLLECTION_TIME_MS;

      if (reachedTarget || reachedAttempts || reachedTime) {
        finish();
      }
    }

    function handleError(positionError) {
      if (settled) return;
      // If we already have at least one usable reading, a later timeout
      // or transient error just means "stop trying" — use what we have.
      if (best) {
        finish();
        return;
      }
      settled = true;
      cleanup();
      const code = mapPositionError(positionError);
      const err = new Error(positionError.message || "Location request failed.");
      err.code = code;
      reject(err);
    }

    watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, finalOptions);

    // Absolute safety net in case the browser keeps the watch alive
    // without ever satisfying the attempt/target conditions above.
    safetyTimer = setTimeout(finish, MAX_COLLECTION_TIME_MS + 2000);
  });
}
