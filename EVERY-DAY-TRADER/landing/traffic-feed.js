// Traffic feed boundary for the hero background.
//
// Visual context only. Road conditions are not market data or trading signals.
// No third-party camera is hard-coded, scraped, proxied, rehosted, or iframed here.

/**
 * @typedef {Object} FeedFrame
 * @property {string} location      Human label, e.g. "Central LIE"
 * @property {string|null} src      Approved media URL, or null for no live feed
 * @property {string|null} updatedAt ISO timestamp of the last provider update
 * @property {"moving"|"building"|"heavy"|null} roadFlow Only from verified data
 * @property {boolean} simulated    True when the frame is not a live feed
 */

/**
 * Interface every provider implements.
 * @typedef {Object} TrafficFeedProvider
 * @property {string} name
 * @property {() => Promise<FeedFrame>} getFrame
 */

/** Ships today. Never reports a live feed. */
export const MockTrafficFeedProvider = {
  name: "mock",
  async getFrame() {
    return {
      location: "Central LIE",
      src: null,
      updatedAt: null,
      roadFlow: null,
      simulated: true,
    };
  },
};

/**
 * Placeholder for a future approved provider. Returns no live feed until a
 * verified integration replaces this body. Never falls back to unverified sources.
 */
export const ApprovedProviderStub = {
  name: "approved-provider-stub",
  async getFrame() {
    return { location: "Central LIE", src: null, updatedAt: null, roadFlow: null, simulated: true };
  },
};

export function selectProvider(config) {
  if (config.TRAFFIC_FEED_MODE === "provider" && config.TRAFFIC_PROVIDER_URL) {
    return ApprovedProviderStub;
  }
  return MockTrafficFeedProvider;
}

const FLOW_LABEL = { moving: "Moving", building: "Building", heavy: "Heavy" };

/**
 * Renders the LIE status strip. Shows the honest state at all times.
 * Only a non-simulated frame with a src may reveal the live feed.
 */
export async function mountLIECameraPanel(config, doc = document) {
  const provider = selectProvider(config);
  const frame = await provider.getFrame().catch(() => null);
  const text = doc.getElementById("lie-status-text");
  const loc = doc.getElementById("lie-location");
  const flow = doc.getElementById("lie-road-flow");
  const feed = doc.getElementById("lie-feed");
  const status = doc.getElementById("lie-status");

  if (!frame || frame.simulated || !frame.src) {
    text.textContent = "LIE ATMOSPHERE — SIMULATED VISUAL";
    loc.textContent = "Live roadway feed unavailable";
    flow.textContent = "ROAD FLOW: Unavailable";
    status.dataset.live = "false";
    return { live: false };
  }

  feed.hidden = false;
  const video = doc.createElement("video");
  video.src = frame.src;
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.loop = true;
  video.setAttribute("aria-hidden", "true");
  feed.replaceChildren(video);

  text.textContent = "LIVE";
  loc.textContent = frame.location;
  const stamp = frame.updatedAt ? new Date(frame.updatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "—";
  flow.textContent = frame.roadFlow
    ? `ROAD FLOW: ${FLOW_LABEL[frame.roadFlow]} · updated ${stamp}`
    : `Updated ${stamp}`;
  status.dataset.live = "true";
  return { live: true };
}
