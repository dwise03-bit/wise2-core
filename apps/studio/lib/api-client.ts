/**
 * API Client for SoundLabs Studio
 * Handles HTTP requests to the backend API with automatic JWT token management
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  };
  expiresIn: number;
}

export interface SignupResponse {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  message: string;
}

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
    }
  }

  /**
   * Set the access token for authenticated requests
   */
  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  /**
   * Set the refresh token in localStorage
   */
  setRefreshToken(token: string | null) {
    if (token) {
      localStorage.setItem('refreshToken', token);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }

  /**
   * Get the current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Get the current refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  /**
   * Make an authenticated HTTP request
   */
  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 (Unauthorized) by attempting to refresh token
    if (response.status === 401 && this.accessToken) {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        try {
          const refreshed = await this.refreshAccessToken(refreshToken);
          this.setAccessToken(refreshed.accessToken);

          // Retry original request with new token
          headers['Authorization'] = `Bearer ${refreshed.accessToken}`;
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          });

          if (!retryResponse.ok) {
            throw new Error(`API request failed: ${retryResponse.statusText}`);
          }

          return retryResponse.json();
        } catch (error) {
          // Refresh failed, clear tokens and redirect to login
          this.setAccessToken(null);
          this.setRefreshToken(null);
          if (typeof window !== 'undefined') {
            window.location.href = '/auth';
          }
          throw error;
        }
      }
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new ApiError(
        errorBody.message || `API request failed: ${response.statusText}`,
        response.status,
        errorBody
      );
    }

    return response.json();
  }

  /**
   * Sign up a new user
   */
  async signup(
    email: string,
    password: string,
    name?: string
  ): Promise<SignupResponse> {
    return this.request<SignupResponse>('/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        firstName: name?.split(' ')[0] || undefined,
        lastName: name?.split(' ')[1] || undefined,
      }),
    });
  }

  /**
   * Log in a user
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store tokens
    this.setAccessToken(response.accessToken);
    if (response.refreshToken) {
      this.setRefreshToken(response.refreshToken);
    }

    return response;
  }

  /**
   * Log out a user
   */
  async logout(): Promise<void> {
    try {
      await this.request('/v1/auth/logout', {
        method: 'POST',
      });
    } finally {
      // Clear tokens regardless of logout success
      this.setAccessToken(null);
      this.setRefreshToken(null);
    }
  }

  /**
   * Refresh the access token
   */
  private async refreshAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string }> {
    return this.request('/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    return this.request('/v1/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return this.request('/v1/auth/password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return this.request('/v1/auth/password-reset/confirm', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return this.request('/v1/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public data: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
