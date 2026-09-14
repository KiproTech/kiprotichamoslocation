// Device information service
//
// Everything here reads from standard, publicly available browser APIs
// (navigator, screen, Intl). None of this bypasses browser security or
// reaches into protected device data — user agent sniffing is inherently
// a best-effort heuristic, not a guarantee, and is presented that way.

function safeGet(fn, fallback = "Unknown") {
  try {
    const value = fn();
    return value === undefined || value === null || value === "" ? fallback : value;
  } catch {
    return fallback;
  }
}

/**
 * Best-effort device type classification based on user agent hints and
 * screen size. Not 100% accurate — some tablets identify as desktops and
 * vice versa depending on the browser.
 */
function detectDeviceType(ua) {
  const lowerUA = ua.toLowerCase();

  if (/ipad/.test(lowerUA) || (/macintosh/.test(lowerUA) && navigator.maxTouchPoints > 1)) {
    return "Tablet";
  }
  if (/tablet|kindle|silk|playbook/.test(lowerUA)) {
    return "Tablet";
  }
  if (/android/.test(lowerUA) && !/mobile/.test(lowerUA)) {
    return "Tablet";
  }
  if (/mobi|iphone|ipod|android/.test(lowerUA)) {
    return "Phone";
  }
  if (/windows|macintosh|linux|cros/.test(lowerUA)) {
    return "Desktop";
  }
  return "Unknown";
}

/**
 * Best-effort browser detection. Checked in an order that avoids common
 * false positives (e.g. Edge and Opera also include "Chrome" in their UA).
 */
function detectBrowser(ua) {
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/samsungbrowser/i.test(ua)) return "Samsung Internet";
  if (/firefox\//i.test(ua)) return "Firefox";
  if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) return "Chrome";
  if (/safari\//i.test(ua) && /version\//i.test(ua)) return "Safari";
  return "Unknown";
}

/**
 * Best-effort operating system detection.
 */
function detectOperatingSystem(ua, platform) {
  const lowerUA = ua.toLowerCase();
  const lowerPlatform = (platform || "").toLowerCase();

  if (/android/.test(lowerUA)) return "Android";
  if (/iphone|ipad|ipod/.test(lowerUA)) return "iOS";
  // iPadOS 13+ reports as Macintosh with touch support.
  if (/macintosh/.test(lowerUA) && navigator.maxTouchPoints > 1) return "iOS";
  if (/cros/.test(lowerUA)) return "ChromeOS";
  if (/win/.test(lowerUA) || /win/.test(lowerPlatform)) return "Windows";
  if (/mac/.test(lowerUA) || /mac/.test(lowerPlatform)) return "macOS";
  if (/linux/.test(lowerUA) || /linux/.test(lowerPlatform)) return "Linux";
  return "Unknown";
}

/**
 * Collects basic browser/device information available through standard,
 * publicly documented browser APIs. Nothing here requires special
 * permission and nothing bypasses browser security.
 */
export function getDeviceInfo() {
  const userAgent = safeGet(() => navigator.userAgent, "");
  const platform = safeGet(() => navigator.platform);
  const language = safeGet(() => navigator.language);
  const timezone = safeGet(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const screenWidth = safeGet(() => window.screen.width, null);
  const screenHeight = safeGet(() => window.screen.height, null);

  return {
    deviceType: userAgent ? detectDeviceType(userAgent) : "Unknown",
    browser: userAgent ? detectBrowser(userAgent) : "Unknown",
    operatingSystem: userAgent ? detectOperatingSystem(userAgent, platform) : "Unknown",
    screenWidth,
    screenHeight,
    language,
    timezone,
    platform,
    userAgent: userAgent || "Unknown",
  };
}
