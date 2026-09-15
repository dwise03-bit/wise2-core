export const WISE_DEFENSE_API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_WISE_DEFENSE_API_URL || 'http://localhost:3000',
  endpoints: {
    status: '/api/status',
    system: '/api/system',
    incidents: '/api/incidents',
    recentIncidents: '/api/incidents/recent',
    watchZones: '/api/watch-zones',
    sdr: '/api/sdr',
    sdrStatus: '/api/sdr/status',
    mesh: '/api/mesh',
    meshNodes: '/api/mesh/nodes',
    weather: '/api/weather',
    alerts: '/api/alerts',
    sitrep: '/api/sitrep',
    impChat: '/api/imp/chat',
    health: '/wise-defense/hardware',
  },
  timeouts: {
    default: 5000,
    longRunning: 30000,
  },
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
  },
  polling: {
    incidents: 5000,
    system: 2000,
    sdr: 3000,
    mesh: 4000,
  },
};
