import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

/**
 * Test utilities and helpers for dashboard tests
 */

// Custom render function with common providers/wrappers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

/**
 * Fixtures for IMP tests
 */

export const impFixtures = {
  expressions: [
    'idle',
    'listening',
    'thinking',
    'speaking',
    'happy',
    'curious',
    'focused',
    'playful',
    'warning',
    'error',
    'sleeping',
    'offline',
  ] as const,

  colorVariants: ['blue', 'gold', 'green', 'magenta'] as const,

  sizes: ['sm', 'md', 'lg'] as const,

  events: [
    {
      type: 'user_message' as const,
      timestamp: new Date(),
    },
    {
      type: 'voice_start' as const,
      timestamp: new Date(),
    },
    {
      type: 'voice_end' as const,
      timestamp: new Date(),
    },
    {
      type: 'ai_thinking' as const,
      timestamp: new Date(),
    },
    {
      type: 'ai_stream_start' as const,
      timestamp: new Date(),
    },
    {
      type: 'ai_stream_end' as const,
      timestamp: new Date(),
    },
    {
      type: 'tool_start' as const,
      timestamp: new Date(),
    },
    {
      type: 'tool_success' as const,
      timestamp: new Date(),
    },
    {
      type: 'tool_error' as const,
      timestamp: new Date(),
    },
    {
      type: 'device_offline' as const,
      timestamp: new Date(),
    },
  ],
};

/**
 * Create mock Hermes chat response
 */
export const createMockHermesResponse = (overrides = {}) => ({
  response: 'This is a test response from Hermes.',
  mode: 'chat',
  model: 'gpt-4-turbo',
  provider: 'openai',
  durationMs: 250,
  sources: [],
  evidenceStatus: 'none',
  ...overrides,
});

/**
 * Create mock chat message
 */
export const createMockChatMessage = (overrides = {}) => ({
  id: `msg_${Date.now()}_test`,
  role: 'assistant' as const,
  content: 'Test message content',
  timestamp: new Date(),
  ...overrides,
});

/**
 * Helper to wait for async operations
 */
export const waitFor = (callback: () => void, options = {}) => {
  return new Promise((resolve) => {
    const timer = setInterval(() => {
      try {
        callback();
        clearInterval(timer);
        resolve(true);
      } catch (e) {
        // Keep trying
      }
    }, 50);
    setTimeout(() => {
      clearInterval(timer);
      resolve(false);
    }, 5000);
  });
};

/**
 * Mock fetch globally
 */
export const setupFetchMock = () => {
  return {
    mockResponse: (data: any, options = {}) => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(data),
          text: () => Promise.resolve(JSON.stringify(data)),
          ...options,
        } as Response)
      );
    },
    mockError: (error: string) => {
      global.fetch = jest.fn(() => Promise.reject(new Error(error)));
    },
    mockStatus: (status: number, message: string) => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: status < 400,
          status,
          statusText: message,
          json: () => Promise.resolve({ error: { message } }),
        } as Response)
      );
    },
  };
};

/**
 * Mock localStorage
 */
export const setupLocalStorageMock = () => {
  const store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key]);
    },
    store,
  };
};
