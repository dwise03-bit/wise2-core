export const COMMERCE_STORAGE_KEY = "wise-touch-commerce-v1";

export const PACKS = [
  { id: "pack-cyberpunk-legacy", kind: "pack", name: "Cyberpunk Legacy", subtitle: "Mega Pack", category: "Sci-Fi & Futuristic", creator: "WISE TOUCH Labs", price: 29.99, rating: 4.9, badge: "Featured", accent: "from-cyan-500/25 via-purple-500/10 to-black", contents: ["450+ assets", "120+ prompts", "35+ overlays", "Commercial license"] },
  { id: "pack-dragon-god", kind: "pack", name: "Dragon God", subtitle: "Mythic Pack", category: "Fantasy & Myth", creator: "Mythic Forge", price: 24.99, rating: 4.8, badge: "New Drop", accent: "from-orange-600/30 via-red-950/20 to-black", contents: ["Creature systems", "Mythic environments", "Prompt recipes", "Commercial license"] },
  { id: "pack-anime-god", kind: "pack", name: "Anime God", subtitle: "System Pack", category: "Anime Systems", creator: "Neon Architects", price: 19.99, rating: 4.9, badge: "New", accent: "from-fuchsia-600/25 via-red-950/20 to-black", contents: ["Character DNA", "Power effects", "Scene blueprints", "Commercial license"] },
  { id: "pack-street-kings", kind: "pack", name: "Street Kings", subtitle: "Graffiti Pack", category: "Urban & Street", creator: "Diabolikill Studio", price: 14.99, rating: 4.7, badge: "Trending", accent: "from-lime-600/15 via-zinc-900 to-black", contents: ["Letter systems", "Wall textures", "Tag stencils", "Commercial license"] },
  { id: "pack-lighting", kind: "pack", name: "Cinematic Lighting", subtitle: "Master Pack", category: "Lighting & FX", creator: "WISE TOUCH Labs", price: 17.99, rating: 4.8, badge: "Staff Pick", accent: "from-amber-500/25 via-zinc-900 to-black", contents: ["Lighting recipes", "Atmosphere maps", "Camera notes", "Commercial license"] },
  { id: "bundle-builder", kind: "pack", name: "Ultimate Builder", subtitle: "10-Pack Bundle", category: "Bundles", creator: "WISE TOUCH Labs", price: 79.99, rating: 4.9, badge: "Best Value", accent: "from-purple-600/25 via-orange-950/20 to-black", contents: ["10 complete packs", "Lifetime updates", "Priority docs", "Commercial license"] },
];

export const BLUEPRINTS = [
  { id: "blueprint-titan", kind: "blueprint", name: "Cyberpunk Titan", subtitle: "Complete System", category: "Sci-Fi & Futuristic", creator: "Diabolikill Studio", price: 29.99, rating: 4.9, badge: "Best Seller", accent: "from-cyan-500/25 via-blue-950/20 to-black", contents: ["450+ optimized prompts", "Full Visual DNA structure", "Camera and composition", "Commercial license"] },
  { id: "blueprint-anime", kind: "blueprint", name: "Anime God", subtitle: "System Blueprint", category: "Anime Systems", creator: "Neon Architects", price: 19.99, rating: 4.9, badge: "Trending", accent: "from-red-600/30 via-fuchsia-950/20 to-black", contents: ["Character framework", "Power parameters", "Example outputs", "Commercial license"] },
  { id: "blueprint-temple", kind: "blueprint", name: "Dragon Temple", subtitle: "Environment Kit", category: "Fantasy & Myth", creator: "Mythic Forge", price: 24.99, rating: 4.8, badge: "Staff Pick", accent: "from-orange-600/30 via-zinc-950 to-black", contents: ["Environment DNA", "Lighting setup", "Usage guide", "Commercial license"] },
  { id: "blueprint-graffiti", kind: "blueprint", name: "Street Kings", subtitle: "Graffiti Pack", category: "Urban & Street", creator: "Diabolikill Studio", price: 14.99, rating: 4.7, badge: "New Drop", accent: "from-pink-600/25 via-zinc-950 to-black", contents: ["Letter structures", "Material settings", "Prompt variants", "Commercial license"] },
  { id: "blueprint-noir", kind: "blueprint", name: "Neon Noir City", subtitle: "Lighting & Atmosphere", category: "Lighting & FX", creator: "WISE TOUCH Labs", price: 17.99, rating: 4.8, badge: "Limited", accent: "from-blue-600/25 via-purple-950/20 to-black", contents: ["Cityscape prompts", "Neon atmosphere", "Cinematic angles", "Commercial license"] },
];

export function createCommerceState(value = {}) {
  return { version: 1, cartIds: [...new Set(value.cartIds || [])], wishlistIds: [...new Set(value.wishlistIds || [])] };
}

export function toggleCommerceId(state, field, id) {
  const current = createCommerceState(state);
  const values = current[field] || [];
  return { ...current, [field]: values.includes(id) ? values.filter((item) => item !== id) : [...values, id] };
}

export function cartTotal(state, catalog = [...PACKS, ...BLUEPRINTS]) {
  const ids = new Set(createCommerceState(state).cartIds);
  return catalog.filter((item) => ids.has(item.id)).reduce((sum, item) => sum + item.price, 0);
}

export function validateCheckout(input, state) {
  const errors = [];
  if (!createCommerceState(state).cartIds.length) errors.push("Your cart is empty.");
  if (!/^\S+@\S+\.\S+$/.test(String(input?.email || "").trim())) errors.push("Enter a valid delivery email.");
  if (!String(input?.country || "").trim()) errors.push("Select a billing country or region.");
  if (!input?.licenseAccepted) errors.push("Accept the digital product and license terms.");
  return { valid: errors.length === 0, errors };
}
