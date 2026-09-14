// Map & navigation link helpers
//
// Pure, stateless helpers that turn the visitor's own
// { latitude, longitude, accuracy, timestamp } object (from
// locationService.getCurrentLocation()) into inputs for displaying a
// map and opening directions. Everything here runs entirely in the
// visitor's browser — nothing is sent to a server, saved anywhere, or
// shared with anyone else. These helpers should only ever be called
// with a location the current visitor explicitly obtained for
// themselves.

/**
 * Picks a reasonable map zoom level from a location's reported accuracy
 * (metres). Tighter accuracy -> closer zoom. This is only a sensible
 * default for the future map view; it is not itself a map.
 */
export function suggestZoomLevel(accuracy) {
  if (typeof accuracy !== "number" || Number.isNaN(accuracy)) return 14;
  if (accuracy <= 25) return 17;
  if (accuracy <= 100) return 15;
  if (accuracy <= 500) return 13;
  if (accuracy <= 2000) return 11;
  return 9;
}

/**
 * Builds the { center, zoom } parameters a future interactive map
 * component would need to render a marker for this location.
 */
export function toMapViewParams(location) {
  if (!location) return null;
  const { latitude, longitude, accuracy } = location;
  return {
    center: { lat: latitude, lng: longitude },
    zoom: suggestZoomLevel(accuracy),
    accuracy,
  };
}

/**
 * Builds a Google Maps "search this point" URL from raw latitude/
 * longitude values, in the exact form https://www.google.com/maps?q=LAT,LNG.
 * This is the simplest, most widely compatible Google Maps link — it
 * works the same on Android, iOS, and desktop browsers (Android/iOS will
 * generally offer to open it in the native Google Maps app).
 *
 * Safely returns null if latitude/longitude aren't valid finite numbers,
 * so callers never construct a URL from missing or malformed data.
 */
export function getGoogleMapsLink(latitude, longitude) {
  if (typeof latitude !== "number" || typeof longitude !== "number") return null;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

/**
 * Convenience wrapper around getGoogleMapsLink for a location object
 * shaped like { latitude, longitude, ... } (the shape returned by
 * locationService.getCurrentLocation()).
 */
export function buildNavigationUrl(location) {
  if (!location) return null;
  return getGoogleMapsLink(location.latitude, location.longitude);
}

/**
 * Converts an accuracy radius (metres) into a rough bounding-box half-
 * width in degrees, so the embedded map frames the location sensibly
 * whether the reported accuracy is tight (GPS) or loose (Wi-Fi/IP).
 */
function accuracyToDegreeSpan(accuracy) {
  const metres = typeof accuracy === "number" && !Number.isNaN(accuracy) ? accuracy : 100;
  // Roughly convert a generous multiple of the accuracy radius into
  // degrees of latitude (111,320 m per degree), then clamp to a
  // sensible visible range.
  const span = (metres * 4) / 111320;
  return Math.min(Math.max(span, 0.002), 2);
}

/**
 * Builds an embeddable OpenStreetMap URL (no API key required) centered
 * on the visitor's own location with a marker. Used only to show the
 * visitor their own position — nothing about this request leaves the
 * browser except the standard map-tile request to the map provider,
 * which is how any map on any website works.
 */
export function buildEmbedMapUrl(location) {
  if (!location) return null;
  const { latitude, longitude } = location;
  const span = accuracyToDegreeSpan(location.accuracy);
  const bbox = [longitude - span, latitude - span, longitude + span, latitude + span].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
}
