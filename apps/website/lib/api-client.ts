/**
 * Centralized API Client
 * Handles all API communication with error handling, auth, and response formatting
 */

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  auth?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  }

  private async getAuthToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  async request<T = any>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      auth = false,
    } = options;

    try {
      const url = `${this.baseUrl}${endpoint}`;
      const requestOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };

      if (auth) {
        const token = await this.getAuthToken();
        if (token) {
          requestOptions.headers = {
            ...requestOptions.headers,
            Authorization: `Bearer ${token}`,
          };
        }
      }

      if (body && method !== 'GET') {
        requestOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, requestOptions);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
          status: response.status,
        };
      }

      return {
        success: true,
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
      };
    }
  }

  // Convenience methods
  async get<T = any>(endpoint: string, auth?: boolean): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', auth });
  }

  async post<T = any>(endpoint: string, body?: any, auth?: boolean): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, auth });
  }

  async put<T = any>(endpoint: string, body?: any, auth?: boolean): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, auth });
  }

  async delete<T = any>(endpoint: string, auth?: boolean): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', auth });
  }

  async patch<T = any>(endpoint: string, body?: any, auth?: boolean): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body, auth });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
