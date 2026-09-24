export type BrokerName = 'paper' | 'alpaca' | 'interactive-brokers' | 'tradier';

export interface OrderRequest {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  type: 'market' | 'limit';
  limitPrice?: number;
  stopPrice?: number;
}

export interface BrokerAdapter {
  readonly name: BrokerName;
  getQuote(symbol: string): Promise<{ symbol: string; price: number; asOf: string }>;
  getPortfolio(accountId: string): Promise<unknown>;
  previewOrder(order: OrderRequest): Promise<{ accepted: boolean; estimatedValue?: number; reason?: string }>;
  submitOrder(order: OrderRequest): Promise<{ id: string; status: 'paper' | 'submitted' }>;
}

export class PaperBroker implements BrokerAdapter {
  readonly name = 'paper' as const;

  async getQuote(symbol: string) {
    return { symbol: symbol.toUpperCase(), price: 0, asOf: new Date().toISOString() };
  }

  async getPortfolio(_accountId: string) {
    return { mode: 'paper', positions: [], cash: 0 };
  }

  async previewOrder(order: OrderRequest) {
    if (!order.symbol || order.quantity <= 0) return { accepted: false, reason: 'Invalid order details' };
    return { accepted: true };
  }

  async submitOrder(order: OrderRequest) {
    const preview = await this.previewOrder(order);
    if (!preview.accepted) throw new Error(preview.reason);
    return { id: `paper-${Date.now()}`, status: 'paper' as const };
  }
}

export function createBroker(): BrokerAdapter {
  // Live adapters are intentionally opt-in; credentials and account mapping are required.
  return new PaperBroker();
}
