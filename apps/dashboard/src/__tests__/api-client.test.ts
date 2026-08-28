import { ApiClient, ApiResponse } from '../lib/api-client';

describe('ApiClient', () => {
  let client: ApiClient;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    client = new ApiClient('http://localhost:3001/api');
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should set and get token', () => {
      const token = 'test-token-123';
      client.setToken(token);
      expect(client.getToken()).toBe(token);
    });

    it('should include Bearer token in Authorization header', async () => {
      const token = 'test-token-123';
      client.setToken(token);

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      });

      await client.request('GET', '/test');

      const headers = fetchMock.mock.calls[0][1].headers;
      expect(headers.Authorization).toBe(`Bearer ${token}`);
    });

    it('should not include Authorization header when token is null', async () => {
      client.setToken(null);

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      });

      await client.request('GET', '/test', undefined, { skipAuth: true });

      const headers = fetchMock.mock.calls[0][1].headers;
      expect(headers.Authorization).toBeUndefined();
    });
  });

  describe('Tenant Scoping', () => {
    it('should set and get tenant ID', () => {
      const tenantId = 'tenant-456';
      client.setTenantId(tenantId);
      expect(client.getTenantId()).toBe(tenantId);
    });

    it('should include X-Tenant-Id header when tenant is set', async () => {
      const tenantId = 'tenant-456';
      client.setTenantId(tenantId);

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      });

      await client.request('GET', '/test');

      const headers = fetchMock.mock.calls[0][1].headers;
      expect(headers['X-Tenant-Id']).toBe(tenantId);
    });
  });

  describe('Request Methods', () => {
    it('should make GET request', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: '123' } }),
      });

      const result = await client.request('GET', '/test');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: '123' });
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:3001/api/test',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should make POST request with body', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: '123' } }),
      });

      const body = { name: 'Test' };
      await client.request('POST', '/test', body);

      const call = fetchMock.mock.calls[0];
      expect(call[1].method).toBe('POST');
      expect(call[1].body).toBe(JSON.stringify(body));
    });
  });

  describe('Retry Logic', () => {
    it('should retry on 500 error', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ success: false, error: { message: 'Server error' } }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: { id: '123' } }),
        });

      const result = await client.request('GET', '/test');

      expect(result.success).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('should not retry when skipRetry is true', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ success: false, error: { message: 'Server error' } }),
      });

      const result = await client.request('GET', '/test', undefined, { skipRetry: true });

      expect(result.success).toBe(false);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('should not retry non-retryable status codes', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ success: false, error: { message: 'Bad request' } }),
      });

      const result = await client.request('GET', '/test');

      expect(result.success).toBe(false);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch network errors', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));

      await expect(client.request('GET', '/test')).rejects.toThrow('Max retries exceeded');
    });

    it('should return error response from server', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }),
      });

      const result = await client.request('GET', '/test');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Endpoint Methods', () => {
    beforeEach(() => {
      client.setToken('test-token');
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { items: [], total: 0, page: 1, limit: 20 } }),
      });
    });

    it('should call listLeads endpoint', async () => {
      await client.listLeads(1, 20);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/crm/leads?page=1&limit=20'),
        expect.any(Object)
      );
    });

    it('should call login endpoint with skipAuth', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { token: 'abc123', user: {} } }),
      });

      await client.login('test@example.com', 'password123');

      const headers = fetchMock.mock.calls[0][1].headers;
      expect(headers.Authorization).toBeUndefined();
    });
  });
});
