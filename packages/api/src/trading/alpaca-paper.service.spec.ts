import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AlpacaPaperService, AlpacaTransport } from './alpaca-paper.service';

describe('AlpacaPaperService', () => {
  const configValues: Record<string, string> = {
    ALPACA_API_KEY_ID: 'paper-key',
    ALPACA_API_SECRET_KEY: 'paper-secret',
    ALPACA_PAPER_BASE_URL: 'https://paper-api.alpaca.markets',
    ALPACA_DATA_BASE_URL: 'https://data.alpaca.markets',
    WISE2_MAX_PAPER_RISK_PCT: '1',
    WISE2_MAX_PAPER_NOTIONAL: '5000',
  };

  const config = {
    get: jest.fn((key: string) => configValues[key]),
  } as unknown as ConfigService;

  const makeTransport = (): jest.Mocked<AlpacaTransport> => ({
    get: jest.fn(),
    post: jest.fn(),
  });

  it('refuses any paper order that was not explicitly approved by the client', async () => {
    const transport = makeTransport();
    const service = new AlpacaPaperService(config, transport);

    await expect(service.submitPaperOrder({
      symbol: 'NVDA',
      side: 'buy',
      quantity: 1,
      entry: 100,
      stop: 98,
      target: 105,
      strategy: 'Momentum',
      clientApproved: false,
    })).rejects.toBeInstanceOf(BadRequestException);
    expect(transport.post).not.toHaveBeenCalled();
  });

  it('maps the Alpaca paper account and positions into the Android account contract', async () => {
    const transport = makeTransport();
    transport.get
      .mockResolvedValueOnce({ equity: '10500.50', last_equity: '10300.00', buying_power: '18000.00' })
      .mockResolvedValueOnce([
        { market_value: '1200.00' },
        { market_value: '-300.00' },
      ]);
    const service = new AlpacaPaperService(config, transport);

    await expect(service.getPaperAccount()).resolves.toEqual({
      equity: 10500.5,
      buyingPower: 18000,
      dailyPnl: 200.5,
      openExposure: 1500,
    });
  });

  it('submits approved orders only to the configured paper endpoint', async () => {
    const transport = makeTransport();
    transport.post.mockResolvedValue({ id: 'order-1', status: 'accepted', symbol: 'NVDA' });
    const service = new AlpacaPaperService(config, transport);

    await expect(service.submitPaperOrder({
      symbol: 'NVDA',
      side: 'buy',
      quantity: 1,
      entry: 100,
      stop: 99,
      target: 103,
      strategy: 'Momentum',
      clientApproved: true,
    })).resolves.toEqual({ id: 'order-1', status: 'accepted', symbol: 'NVDA' });

    expect(transport.post).toHaveBeenCalledWith(
      'https://paper-api.alpaca.markets/v2/orders',
      expect.objectContaining({ symbol: 'NVDA', side: 'buy', qty: '1', type: 'market' }),
      expect.objectContaining({ 'APCA-API-KEY-ID': 'paper-key', 'APCA-API-SECRET-KEY': 'paper-secret' }),
    );
  });

  it('fails closed when Alpaca paper credentials are not configured', async () => {
    const emptyConfig = { get: jest.fn(() => undefined) } as unknown as ConfigService;
    const service = new AlpacaPaperService(emptyConfig, makeTransport());

    await expect(service.getPaperAccount()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
