export const WEBSITE_TABS = ["dashboard", "directory", "meter", "preview", "blueprints", "prompt", "image", "video", "results", "packs", "marketplace", "checkout", "resources", "favorites", "account"];

export const TAB_PATHS = Object.freeze({
  dashboard: "/",
  directory: "/directory",
  meter: "/hybrid",
  preview: "/preview",
  blueprints: "/blueprints",
  prompt: "/prompt",
  image: "/image-studio",
  video: "/generate",
  results: "/my-builds",
  packs: "/packs",
  marketplace: "/marketplace",
  checkout: "/checkout",
  resources: "/resources",
  favorites: "/favorites",
  account: "/account",
});

export const TAB_LABELS = Object.freeze({ dashboard: "Dashboard", directory: "System Bays", meter: "Hybrid Mixer", preview: "Preview Build", blueprints: "Blueprints", prompt: "Prompt Engine", image: "Free Images", video: "Low-Cost Video", results: "My Builds", packs: "Supply Depot", marketplace: "Marketplace", checkout: "Checkout", resources: "Resources", favorites: "Favorites", account: "Account" });

export function tabFromPath(pathname = "/") {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
  return Object.entries(TAB_PATHS).find(([, path]) => path === normalized)?.[0] || "dashboard";
}

export function pathFromTab(tab) {
  return TAB_PATHS[tab] || "/";
}
