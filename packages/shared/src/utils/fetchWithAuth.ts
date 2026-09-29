/**
 * Authenticated Fetch Wrapper
 * Handles automatic token injection, refresh, and error handling
 */

import {
  AUTH_ENDPOINTS,
  TOKEN_CONFIG,
  AUTH_ERROR_MESSAGES,
} from '../auth.constants';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

interface TokenRefreshResponse {
  accessToken: string;
  expiresIn: number;
}

/**
 * Get the access token from storage
 */
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_CONFIG.accessTokenKey);
}

/**
 * Get the refresh token from storage
 */
function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_CONFIG.refreshTokenKey);
}

/**
 * Store tokens in local storage
 */
function storeTokens(accessToken: string, refreshToken: string, expiresIn: number) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_CONFIG.accessTokenKey, accessToken);
  localStorage.setItem(TOKEN_CONFIG.refreshTokenKey, refreshToken);
  localStorage.setItem(
    TOKEN_CONFIG.expiryKey,
    String(Date.now() + expiresIn * 1000)
  );
}

/**
 * Clear all auth tokens from storage
 */
export function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_CONFIG.accessTokenKey);
  localStorage.removeItem(TOKEN_CONFIG.refreshTokenKey);
  localStorage.removeItem(TOKEN_CONFIG.userKey);
  localStorage.removeItem(TOKEN_CONFIG.expiryKey);
}

/**
 * Refresh the access token using refresh token
 */
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(AUTH_ENDPOINTS.refresh, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const data: TokenRefreshResponse = await response.json();
    localStorage.setItem(TOKEN_CONFIG.accessTokenKey, data.accessToken);
    localStorage.setItem(
      TOKEN_CONFIG.expiryKey,
      String(Date.now() + data.expiresIn * 1000)
    );
    return true;
  } catch (error) {
    clearTokens();
    return false;
  }
}

/**
 * Main fetch wrapper with authentication
 */
export async function fetchWithAuth(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { skipAuth = false, skipRefresh = false, ...fetchOptions } = options;

  // Prepare headers
  const headers = new Headers(fetchOptions.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Add authorization header if not skipped
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // Update fetch options
  fetchOptions.headers = headers;
  fetchOptions.credentials = 'include'; // Send cookies with requests

  // Make the request
  let response = await fetch(url, fetchOptions);

  // Handle 401 Unauthorized
  if (response.status === 401 && !skipRefresh && !skipAuth) {
    // Try to refresh the token
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      // Retry the request with new token
      const token = getAccessToken();
      if (token) {
        const newHeaders = new Headers(fetchOptions.headers);
        newHeaders.set('Authorization', `Bearer ${token}`);
        fetchOptions.headers = newHeaders;
        response = await fetch(url, fetchOptions);
      }
    } else {
      // Redirect to login if refresh failed
      if (typeof window !== 'undefined') {
        clearTokens();
        window.location.href = '/auth/login';
      }
    }
  }

  return response;
}

/**
 * Parse error response from API
 */
export async function parseAuthError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data.message || AUTH_ERROR_MESSAGES.UNKNOWN_ERROR;
  } catch {
    if (response.status === 401) {
      return AUTH_ERROR_MESSAGES.UNAUTHORIZED;
    }
    if (response.status === 403) {
      return AUTH_ERROR_MESSAGES.FORBIDDEN;
    }
    if (response.status === 409) {
      return AUTH_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS;
    }
    if (response.status >= 500) {
      return AUTH_ERROR_MESSAGES.SERVER_ERROR;
    }
    return AUTH_ERROR_MESSAGES.UNKNOWN_ERROR;
  }
}

/**
 * Login utility function
 */
export async function loginWithCredentials(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: any }> {
  try {
    const response = await fetchWithAuth(AUTH_ENDPOINTS.login, {
      method: 'POST',
      skipAuth: true,
      skipRefresh: true,
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await parseAuthError(response);
      return { success: false, error };
    }

    const data = await response.json();
    storeTokens(data.accessToken, data.refreshToken, data.expiresIn);

    // Store user info
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_CONFIG.userKey, JSON.stringify(data.user));
    }

    return { success: true, user: data.user };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : AUTH_ERROR_MESSAGES.NETWORK_ERROR;
    return { success: false, error: message };
  }
}

/**
 * Logout utility function
 */
export async function logoutUser(): Promise<{ success: boolean }> {
  try {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      await fetchWithAuth(AUTH_ENDPOINTS.logout, {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    }

    clearTokens();
    return { success: true };
  } catch (error) {
    clearTokens();
    return { success: true };
  }
}
