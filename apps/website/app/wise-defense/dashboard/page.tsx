import { redirect } from 'next/navigation';

/**
 * Knight Wing now runs inside the tenant-aware WISE Defense command center.
 * Keep this legacy website route as a compatibility entry point so bookmarked
 * links cannot reach the retired dashboard that contained hardcoded radio state.
 */
export default function KnightWingDashboardRedirect() {
  redirect('/wise-defense/knightwing');
}
