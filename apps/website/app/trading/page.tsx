'use client';

import TradingDashboard from './TradingDashboard';

/**
 * The trading dashboard owns its navigation and responsive layout.
 * Rendering it directly avoids a second fixed shell competing for width.
 */
export default function TradingPage() {
  return <TradingDashboard />;
}
