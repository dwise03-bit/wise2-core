import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface AlpacaTransport {
  get(url: string, headers: Record<string, string>, params?: Record<string, string>): Promise<any>;
  post(url: string, body: unknown, headers: Record<string, string>): Promise<any>;
}

@Injectable()
export class AxiosAlpacaTransport implements AlpacaTransport {
  async get(url: string, headers: Record<string, string>, params?: Record<string, string>) {
    const response = await axios.get(url, { headers, params, timeout: 15000 });
    return response.data;
  }

  async post(url: string, body: unknown, headers: Record<string, string>) {
    const response = await axios.post(url, body, { headers, timeout: 15000 });
    return response.data;
  }
}

export type PaperOrderInput = {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  entry: number;
  stop: number;
  target: number;
  strategy: string;
  clientApproved: boolean;
};

@Injectable()
export class AlpacaPaperService {
  constructor(
    private readonly config: ConfigService,
    private readonly transport: AlpacaTransport,
  ) {}

  private settings() {
    const key = this.config.get<string>('ALPACA_API_KEY_ID');
    const secret = this.config.get<string>('ALPACA_API_SECRET_KEY');
    const paperBase = (this.config.get<string>('ALPACA_PAPER_BASE_URL') || 'https://paper-api.alpaca.markets').replace(/\/$/, '');
    const dataBase = (this.config.get<string>('ALPACA_DATA_BASE_URL') || 'https://data.alpaca.markets').replace(/\/$/, '');
    if (!key || !secret) {
      throw new ServiceUnavailableException('Alpaca paper trading is not configured on the WISE² backend');
    }
    if (!paperBase.startsWith('https://paper-api.alpaca.markets')) {
      throw new ServiceUnavailableException('WISE² Trading is locked to Alpaca paper trading');
    }
    return {
      paperBase,
      dataBase,
      headers: {
        'APCA-API-KEY-ID': key,
        'APCA-API-SECRET-KEY': secret,
        'Content-Type': 'application/json',
      },
    };
  }

  async getPaperAccount() {
    const cfg = this.settings();
    const account = await this.transport.get(`${cfg.paperBase}/v2/account`, cfg.headers);
    const positions = await this.transport.get(`${cfg.paperBase}/v2/positions`, cfg.headers);
    const equity = Number(account.equity || 0);
    const lastEquity = Number(account.last_equity || equity);
    const openExposure = Array.isArray(positions)
      ? positions.reduce((sum: number, position: any) => sum + Math.abs(Number(position.market_value || 0)), 0)
      : 0;
    return {
      equity,
      buyingPower: Number(account.buying_power || 0),
      dailyPnl: equity - lastEquity,
      openExposure,
    };
  }

  async getScanner(symbols = ['NVDA', 'SPY', 'AMD', 'BTC/USD']) {
    const cfg = this.settings();
    const results = await Promise.all(symbols.map(async (displaySymbol) => {
      const isCrypto = displaySymbol.includes('/');
      const apiSymbol = displaySymbol.replace('/', '');
      const latestUrl = isCrypto
        ? `${cfg.dataBase}/v1beta3/crypto/us/latest/trades`
        : `${cfg.dataBase}/v2/stocks/${apiSymbol}/trades/latest`;
      const raw = await this.transport.get(
        latestUrl,
        cfg.headers,
        isCrypto ? { symbols: apiSymbol } : undefined,
      );
      const trade = isCrypto ? raw?.trades?.[apiSymbol] : raw?.trade;
      const price = Number(trade?.p || trade?.price || 0);
      const assetClass = isCrypto ? 'CRYPTO' : displaySymbol === 'SPY' ? 'ETF' : 'STOCK';
      const stopPct = isCrypto ? 0.025 : 0.015;
      const targetPct = isCrypto ? 0.055 : 0.035;
      const score = price > 0 ? (isCrypto ? 79 : displaySymbol === 'NVDA' ? 87 : displaySymbol === 'SPY' ? 82 : 76) : 0;
      return {
        symbol: displaySymbol,
        assetClass,
        strategy: isCrypto ? 'Crypto Trend' : displaySymbol === 'NVDA' ? 'Momentum Pullback' : displaySymbol === 'SPY' ? 'Trend Continuation' : 'Breakout',
        wiseScore: score,
        entry: price,
        stop: price * (1 - stopPct),
        target: price * (1 + targetPct),
        quantity: isCrypto ? 0.01 : 1,
        thesis: price > 0 ? 'Live Alpaca market snapshot. Review WISE Guard before any paper order.' : 'No live trade snapshot is currently available.',
      };
    }));
    return results.filter(item => item.entry > 0).sort((a, b) => b.wiseScore - a.wiseScore);
  }

  async submitPaperOrder(input: PaperOrderInput) {
    if (!input.clientApproved) {
      throw new BadRequestException('Explicit user approval is required for every paper trade');
    }
    if (!input.symbol || !['buy', 'sell'].includes(input.side) || !Number.isFinite(input.quantity) || input.quantity <= 0) {
      throw new BadRequestException('Invalid paper order');
    }
    if (![input.entry, input.stop, input.target].every(value => Number.isFinite(value) && value > 0)) {
      throw new BadRequestException('Entry, stop, and target must be positive numbers');
    }

    const cfg = this.settings();
    const account = await this.getPaperAccount();
    const estimatedRisk = Math.abs(input.entry - input.stop) * input.quantity;
    const riskPct = account.equity > 0 ? (estimatedRisk / account.equity) * 100 : 100;
    const maxRiskPct = Number(this.config.get<string>('WISE2_MAX_PAPER_RISK_PCT') || '1');
    const maxNotional = Number(this.config.get<string>('WISE2_MAX_PAPER_NOTIONAL') || '5000');
    const notional = input.entry * input.quantity;
    if (riskPct > maxRiskPct) {
      throw new BadRequestException(`WISE Guard blocked order: estimated risk ${riskPct.toFixed(2)}% exceeds ${maxRiskPct}%`);
    }
    if (notional > maxNotional) {
      throw new BadRequestException(`WISE Guard blocked order: notional exceeds $${maxNotional}`);
    }

    const alpacaSymbol = input.symbol.replace('/', '');
    const order = await this.transport.post(`${cfg.paperBase}/v2/orders`, {
      symbol: alpacaSymbol,
      qty: String(input.quantity),
      side: input.side,
      type: 'market',
      time_in_force: input.symbol.includes('/') ? 'gtc' : 'day',
      client_order_id: `wise2-${Date.now()}`,
    }, cfg.headers);

    return {
      id: String(order.id),
      status: String(order.status),
      symbol: input.symbol,
    };
  }
}
