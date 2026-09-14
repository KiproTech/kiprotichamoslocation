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
 * Builds a "latitude,longitude" destination string, the format a maps/
 * navigation service expects for a directions destination.
 */
export function toDestinationString(location) {
  if (!location) return null;
  const { latitude, longitude } = location;
  return `${latitude},${longitude}`;
}

/**
 * Builds a Google Maps directions URL to the visitor's own location.
 * Used by the "Open My Location in Maps" button so the visitor can view
 * or navigate to where they currently are, in a new tab.
 */
export function buildNavigationUrl(location) {
  const destination = toDestinationString(location);
  if (!destination) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
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
