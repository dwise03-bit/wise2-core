/**
 * Cross-app URLs.
 *
 * The authenticated dashboard is a SEPARATE Next.js app served on its own
 * subdomain (dashboard.wise2.net → :3002), not a route inside this website app.
 * Linking to a bare "/dashboard" here 404s. Use DASHBOARD_URL for any
 * navigation that should land the user in the dashboard app.
 *
 * Override at build time with NEXT_PUBLIC_DASHBOARD_URL (NEXT_PUBLIC_* vars are
 * inlined into the client bundle during `next build`).
 */
export const DASHBOARD_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://dashboard.wise2.net';
