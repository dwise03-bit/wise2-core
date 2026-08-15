import { NextRequest } from 'next/server';

/**
 * Extract Bearer token from Authorization header
 */
export function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7); // Remove 'Bearer ' prefix
}

/**
 * Get backend API URL from environment
 */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || 'http://localhost:3001';
}

/**
 * Build headers for backend API requests
 */
export function buildBackendHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Handle API response errors
 */
export async function handleApiError(response: Response) {
  let errorMessage = 'Unknown error occurred';
  let errorData: any = null;

  try {
    errorData = await response.json();
    errorMessage = errorData.message || errorData.error || errorMessage;
  } catch {
    errorMessage = `API error: ${response.status} ${response.statusText}`;
  }

  return {
    message: errorMessage,
    status: response.status,
    data: errorData,
  };
}
