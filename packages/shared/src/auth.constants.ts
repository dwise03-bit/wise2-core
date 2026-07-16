/**
 * Authentication Constants
 * Shared configuration for auth API endpoints and token management
 */

// API Configuration
export const API_BASE_URL =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3010'
    : 'https://api.wise2.net';

// API Endpoints
export const AUTH_ENDPOINTS = {
  login: `${API_BASE_URL}/v1/auth/login`,
  logout: `${API_BASE_URL}/v1/auth/logout`,
  refresh: `${API_BASE_URL}/v1/auth/refresh`,
  signup: `${API_BASE_URL}/v1/auth/signup`,
  verifyEmail: `${API_BASE_URL}/v1/auth/verify-email`,
  passwordReset: `${API_BASE_URL}/v1/auth/password-reset`,
  passwordResetConfirm: `${API_BASE_URL}/v1/auth/password-reset/confirm`,
  changePassword: `${API_BASE_URL}/v1/auth/change-password`,
} as const;

// Token Configuration
export const TOKEN_CONFIG = {
  accessTokenKey: 'wise2_access_token',
  refreshTokenKey: 'wise2_refresh_token',
  userKey: 'wise2_user',
  expiryKey: 'wise2_token_expiry',
  // 15 minutes in milliseconds
  accessTokenExpiry: 15 * 60 * 1000,
  // 7 days in milliseconds
  refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000,
  // Refresh token 2 minutes before expiry
  refreshThreshold: 2 * 60 * 1000,
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
  SUPPORT: 'SUPPORT',
} as const;

// API Response Status
export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_NOT_VERIFIED: 'Email not verified. Please check your inbox for the verification link.',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED: 'Unauthorized. Please log in again.',
  FORBIDDEN: 'Access denied.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  WEAK_PASSWORD: 'Password is too weak',
  UNKNOWN_ERROR: 'An unexpected error occurred',
} as const;
