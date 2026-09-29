/**
 * API Configuration
 * Centralized API URL management for frontend services
 */

export function getApiUrl(): string {
  // Production server IP address
  const productionUrl = 'http://173.208.147.165:3000';

  // Use environment variable if available, otherwise use production URL
  return process.env.NEXT_PUBLIC_API_URL || productionUrl;
}

export function getWebSocketUrl(): string {
  const apiUrl = getApiUrl();
  // Convert http to ws for WebSocket connections
  return apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
}
