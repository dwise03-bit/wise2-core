import { NextRequest } from 'next/server';
import { middleware } from '../middleware';

function makeRequest(path: string, authToken?: string) {
  const headers: Record<string, string> = {};
  if (authToken) {
    headers.cookie = `authToken=${authToken}`;
  }
  return new NextRequest(`http://localhost:3000${path}`, { headers });
}

describe('command-center middleware', () => {
  it('redirects unauthenticated dashboard requests to login', () => {
    const response = middleware(makeRequest('/dashboard/leads'));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/login');
    expect(response.headers.get('location')).toContain('redirect=%2Fdashboard%2Fleads');
  });

  it('allows authenticated dashboard requests', () => {
    const response = middleware(makeRequest('/dashboard/leads', 'valid-token'));
    expect(response.headers.get('location')).toBeNull();
  });

  it('protects /leads, /customers, /billing, and /hvac', () => {
    for (const path of ['/leads', '/customers', '/billing', '/hvac/dispatch']) {
      const response = middleware(makeRequest(path));
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
    }
  });

  it('allows public login page without redirect loop', () => {
    const response = middleware(makeRequest('/login'));
    expect(response.headers.get('location')).toBeNull();
  });
});
