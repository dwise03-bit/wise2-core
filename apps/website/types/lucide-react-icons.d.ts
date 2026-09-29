/**
 * lucide-react ships a single bundled declaration file (`dist/lucide-react.d.ts`)
 * and no per-icon `.d.ts`, so the deep icon subpaths resolve to untyped `.js`.
 *
 * Some components deliberately deep-import icons instead of using the
 * `lucide-react` barrel, because Next.js's `optimizePackageImports` barrel
 * rewrite resolves this icon set inconsistently between the server and client
 * bundles and causes a hydration mismatch. This declaration gives those
 * subpaths the same type the barrel exports.
 */
declare module 'lucide-react/dist/esm/icons/*' {
  import type { LucideIcon } from 'lucide-react';

  const Icon: LucideIcon;
  export default Icon;
}
