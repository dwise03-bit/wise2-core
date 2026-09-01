import {describe, expect, it, vi} from 'vitest';
import {defaultConfig} from '../config.js';
import {hermesChat} from '../backends/hermes.js';

describe('Hermes backend', () => {
  it('uses the OpenAI-compatible chat endpoint without exposing credentials', async () => {
    const cfg = {...defaultConfig(), hermesUrl: 'http://hermes.local/'};
    const fetcher = vi.fn(async (url: string | URL | Request, init?: RequestInit) => new Response(JSON.stringify({choices:[{message:{content:'ok'}}]}), {status:200, headers:{'content-type':'application/json'}}));
    await expect(hermesChat(cfg, 'hello', fetcher)).resolves.toBe('ok');
    expect(fetcher).toHaveBeenCalledWith('http://hermes.local/v1/chat/completions', expect.objectContaining({method:'POST'}));
  });
});
