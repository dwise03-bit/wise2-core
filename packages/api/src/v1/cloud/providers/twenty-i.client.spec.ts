import { TwentyIClient } from './twenty-i.client';

describe('TwentyIClient', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('base64-encodes the general api key in the authorization header', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '[]',
    });

    const client = new TwentyIClient({ apiKey: 'test-api-key' });
    await client.get('/reseller/*/packageTypes');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.20i.com/reseller/*/packageTypes',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: `Bearer ${Buffer.from('test-api-key', 'utf8').toString('base64')}`,
        }),
      }),
    );
  });
});
