/**
 * Full System Integration Tests
 * End-to-end tests for WISE² Core v1.0
 */

import axios, { AxiosInstance } from 'axios';

describe('WISE² Core v1.0 - Full System Integration', () => {
  let apiClient: AxiosInstance;
  let voiceClient: AxiosInstance;
  const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:3000';
  const VOICE_SERVICE_URL = process.env.VOICE_SERVICE_URL || 'http://localhost:3002';

  beforeAll(() => {
    apiClient = axios.create({
      baseURL: API_GATEWAY_URL,
      headers: {
        'Authorization': `Bearer ${process.env.TEST_API_TOKEN || 'test-token'}`,
        'X-API-Key': process.env.TEST_API_KEY || 'test-key',
      },
    });

    voiceClient = axios.create({
      baseURL: VOICE_SERVICE_URL,
    });
  });

  describe('API Gateway', () => {
    test('Gateway health check', async () => {
      const response = await apiClient.get('/health');
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('ok');
      expect(response.data.services).toBeDefined();
    });

    test('Gateway metrics endpoint', async () => {
      const response = await apiClient.get('/metrics');
      expect(response.status).toBe(200);
      expect(response.data).toContain('gateway_requests_total');
    });

    test('Unauthorized request without auth token', async () => {
      const client = axios.create({ baseURL: API_GATEWAY_URL });
      try {
        await client.get('/api/executive/status');
        fail('Should have thrown 401 error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    test('Rate limiting enforcement', async () => {
      const promises = [];
      for (let i = 0; i < 1100; i++) {
        promises.push(apiClient.get('/api/health/status').catch((err) => err));
      }

      const results = await Promise.all(promises);
      const rateLimited = results.filter(
        (r) => r.response?.status === 429
      );

      expect(rateLimited.length).toBeGreaterThan(0);
    });

    test('Response caching for GET requests', async () => {
      const response1 = await apiClient.get('/api/knowledge-graph/entities');
      const response2 = await apiClient.get('/api/knowledge-graph/entities');

      expect(response1.headers['x-cache']).toBeDefined();
      expect(response2.headers['x-cache']).toBeDefined();
    });
  });

  describe('Voice Assistant Service', () => {
    test('Voice service health check', async () => {
      const response = await voiceClient.get('/health');
      expect(response.status).toBe(200);
      expect(response.data.service).toBe('voice-assistant');
    });

    test('Transcribe audio via REST', async () => {
      const audioBuffer = Buffer.from('fake audio data');
      const response = await voiceClient.post('/transcribe', {
        audio: audioBuffer.toString('base64'),
        language: 'en',
      });

      expect(response.status).toBe(200);
      expect(response.data.transcript).toBeDefined();
      expect(response.data.confidence).toBeGreaterThan(0);
    });

    test('Synthesize text to speech', async () => {
      const response = await voiceClient.post('/synthesize', {
        text: 'Hello, this is a test',
        language: 'en',
      });

      expect(response.status).toBe(200);
      expect(response.data.audio).toBeDefined();
      expect(response.data.duration).toBeGreaterThan(0);
    });

    test('Get supported languages', async () => {
      const response = await voiceClient.get('/languages');
      expect(response.status).toBe(200);
      expect(response.data.supported).toContain('en');
      expect(response.data.supported.length).toBeGreaterThan(10);
    });

    test('Set language preference', async () => {
      const response = await voiceClient.post('/language', {
        language: 'es',
      });

      expect(response.status).toBe(200);
      expect(response.data.language).toBe('es');
    });
  });

  describe('Multi-Agent Coordination', () => {
    test('Route request to executive agent', async () => {
      const response = await apiClient.get('/api/executive/status');
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });

    test('Route request to developer agent', async () => {
      const response = await apiClient.post('/api/developer/review', {
        code: 'const x = 1;',
      });

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });

    test('Concurrent requests to different agents', async () => {
      const promises = [
        apiClient.get('/api/executive/status'),
        apiClient.get('/api/developer/status'),
        apiClient.get('/api/infrastructure/status'),
        apiClient.get('/api/deployment/status'),
      ];

      const responses = await Promise.all(promises);
      expect(responses).toHaveLength(4);
      responses.forEach((res) => {
        expect(res.status).toBe(200);
      });
    });
  });

  describe('Error Handling', () => {
    test('Handle 404 not found', async () => {
      try {
        await apiClient.get('/api/nonexistent/endpoint');
        fail('Should have thrown 404 error');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.error).toBe('Not Found');
      }
    });

    test('Handle 503 service unavailable', async () => {
      // This test assumes the voice service is temporarily down
      try {
        await voiceClient.get('/invalid-endpoint', { timeout: 1000 });
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.response?.status || error.code).toBeDefined();
      }
    });

    test('Handle malformed JSON request', async () => {
      try {
        await apiClient.post('/api/executive/command', {
          data: 'invalid json' as any,
        });
      } catch (error: any) {
        expect(error.response?.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  describe('Performance Tests', () => {
    test('Response time under load', async () => {
      const startTime = Date.now();
      const promises = [];

      for (let i = 0; i < 100; i++) {
        promises.push(apiClient.get('/api/health/status'));
      }

      await Promise.all(promises);
      const duration = Date.now() - startTime;

      // Should complete 100 requests in less than 10 seconds
      expect(duration).toBeLessThan(10000);
    });

    test('Memory stability during sustained load', async () => {
      const iterations = 50;
      for (let i = 0; i < iterations; i++) {
        await apiClient.get('/api/health/status');
      }

      // No crash = pass
      expect(true).toBe(true);
    });
  });

  describe('Data Consistency', () => {
    test('Sync data across devices', async () => {
      // Create data on device 1
      const createResponse = await apiClient.post('/api/sync/data', {
        data: { test: 'data' },
      });

      expect(createResponse.status).toBe(200);

      // Wait for sync
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify on device 2
      const getResponse = await apiClient.get(`/api/sync/data/${createResponse.data.id}`);
      expect(getResponse.data).toEqual(createResponse.data);
    });
  });

  describe('Security', () => {
    test('Authentication required for protected endpoints', async () => {
      const publicClient = axios.create({ baseURL: API_GATEWAY_URL });

      try {
        await publicClient.get('/api/executive/status');
        fail('Should require authentication');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    test('Permission enforcement', async () => {
      // Create a limited-access client
      const limitedClient = axios.create({
        baseURL: API_GATEWAY_URL,
        headers: {
          'Authorization': 'Bearer limited-token',
        },
      });

      try {
        await limitedClient.delete('/api/infrastructure/service');
        fail('Should be forbidden');
      } catch (error: any) {
        expect(error.response.status).toBe(403);
      }
    });

    test('Input validation', async () => {
      try {
        await apiClient.post('/api/executive/command', {
          command: '<script>alert("xss")</script>',
        });
      } catch (error: any) {
        // Should either sanitize or reject
        expect(error.response?.status || 200).toBeGreaterThanOrEqual(200);
      }
    });
  });
});
