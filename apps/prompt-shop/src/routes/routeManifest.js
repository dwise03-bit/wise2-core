/**
 * Baseline route manifest.
 *
 * Milestone 0 intentionally preserves the surviving single-screen application's
 * internal tabs. These route definitions document the intended URL surface
 * without changing behavior before normalization.
 */
export const routeManifest = [
  { path: "/", id: "dashboard", label: "Build Floor", status: "active" },
  { path: "/directory", id: "directory", label: "System Bays", status: "active" },
  { path: "/favorites", id: "favorites", label: "Favorites", status: "active" },
  { path: "/hybrid", id: "meter", label: "Hybrid Mixer", status: "active" },
  { path: "/prompt", id: "prompt", label: "Prompt Engine", status: "active" },
  { path: "/image-studio", id: "image", label: "Free Image Fabrication", status: "active" },
  { path: "/generate", id: "video", label: "Generate Masterpiece", status: "active" },
  { path: "/my-builds", id: "results", label: "My Builds", status: "active" },
  { path: "/blueprints", id: "blueprints", label: "Blueprint Vault", status: "active" },
  { path: "/preview", id: "preview", label: "Preview Build", status: "active" },
  { path: "/packs", id: "packs", label: "Supply Depot", status: "active" },
  { path: "/marketplace", id: "marketplace", label: "Blueprint Marketplace", status: "active" },
  { path: "/checkout", id: "checkout", label: "Checkout", status: "active" },
  { path: "/resources", id: "resources", label: "Learn & Grow", status: "active" },
  { path: "/account", id: "account", label: "Account Settings", status: "active" },
  { path: "/system/:slug", id: "system-detail", label: "System Detail", status: "active-internal" },
  { path: "/system/:systemSlug/subsystem/:subsystemSlug", id: "subsystem-detail", label: "Subsystem Detail", status: "active-internal" },
];
