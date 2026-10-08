// Runtime configuration for the landing page.
// Placeholders only. Do not commit real provider URLs, keys, or tokens here.
//
// TRAFFIC_FEED_MODE:
//   "mock"    — default. Shows the simulated LIE atmosphere. No network calls.
//   "provider" — only after the provider's API/embed terms, attribution,
//                refresh limits, and commercial-use permission are verified.
window.EDT_CONFIG = {
  TRAFFIC_FEED_MODE: "mock",
  TRAFFIC_PROVIDER_URL: "",
  TRAFFIC_CAMERA_ID: "",
  // Conservative refresh interval for any approved provider, in milliseconds.
  TRAFFIC_REFRESH_MS: 60000,
};
