import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/auth-context';
import * as apiClient from '../lib/api-client';

jest.mock('../lib/api-client');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Test component that uses the auth context
function TestComponent() {
  const { user, token, isAuthenticated, login, logout, error } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      <div data-testid="user-email">{user?.email || 'No user'}</div>
      <div data-testid="error">{error || 'No error'}</div>
      <button
        data-testid="login-btn"
        onClick={() => login('test@example.com', 'password123')}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={() => logout()}>
        Logout
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should initialize with unauthenticated state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
  });

  it('should handle login', async () => {
    mockApiClient.apiClient.login = jest.fn().mockResolvedValue({
      success: true,
      data: {
        token: 'test-token-123',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
          tenantId: 'tenant-456',
          createdAt: '2026-08-20T00:00:00Z',
        },
        tenantId: 'tenant-456',
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginBtn = screen.getByTestId('login-btn');
    fireEvent.click(loginBtn);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });

  it('should persist token to localStorage on login', async () => {
    mockApiClient.apiClient.login = jest.fn().mockResolvedValue({
      success: true,
      data: {
        token: 'persistent-token',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
          tenantId: 'tenant-456',
          createdAt: '2026-08-20T00:00:00Z',
        },
        tenantId: 'tenant-456',
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginBtn = screen.getByTestId('login-btn');
    fireEvent.click(loginBtn);

    await waitFor(() => {
      expect(localStorage.getItem('authToken')).toBe('persistent-token');
      expect(localStorage.getItem('user')).toBeDefined();
    });
  });

  it('should handle logout', async () => {
    // Pre-populate localStorage
    localStorage.setItem('authToken', 'test-token');
    localStorage.setItem('user', JSON.stringify({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      tenantId: 'tenant-456',
    }));

    mockApiClient.apiClient.logout = jest.fn().mockResolvedValue({
      success: true,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial auth state to load
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    const logoutBtn = screen.getByTestId('logout-btn');
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      expect(localStorage.getItem('authToken')).toBeNull();
    });
  });

  it('should handle login error', async () => {
    mockApiClient.apiClient.login = jest.fn().mockResolvedValue({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginBtn = screen.getByTestId('login-btn');
    fireEvent.click(loginBtn);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid email or password');
    });
  });

  it('should recover session from localStorage', async () => {
    const userData = {
      id: 'user-123',
      email: 'persisted@example.com',
      name: 'Test User',
      role: 'USER',
      tenantId: 'tenant-456',
      createdAt: '2026-08-20T00:00:00Z',
    };

    localStorage.setItem('authToken', 'persisted-token');
    localStorage.setItem('user', JSON.stringify(userData));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('persisted@example.com');
    });
  });

  it('should throw error when useAuth used outside provider', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within AuthProvider');

    consoleErrorSpy.mockRestore();
  });
});
