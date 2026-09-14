import { LOCATION_ERROR } from "../services/locationService.js";

// Plain-language messages shown to visitors. Keeps technical error
// details (from GeolocationPositionError) out of the UI.
export const LOCATION_MESSAGES = {
  [LOCATION_ERROR.UNSUPPORTED]: "Your browser does not support location services.",
  [LOCATION_ERROR.PERMISSION_DENIED]:
    "Your location was not shared because location permission was denied. If you want to continue, enable location permission in your browser settings and try again.",
  [LOCATION_ERROR.POSITION_UNAVAILABLE]:
    "Your device could not determine your location. Please check that location services are enabled and try again.",
  [LOCATION_ERROR.TIMEOUT]:
    "The location request took too long. Please try again.",
  [LOCATION_ERROR.UNKNOWN]:
    "Something went wrong while getting your location. Please try again.",
};

export function getFriendlyLocationMessage(code) {
  return LOCATION_MESSAGES[code] || LOCATION_MESSAGES[LOCATION_ERROR.UNKNOWN];
}
