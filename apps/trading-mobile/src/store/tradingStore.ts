import { create } from 'zustand';

interface TradingStore {
  portfolio: { balance: number; equity: number; pnl: number };
  orders: any[];
  positions: any[];
  initialize: () => Promise<void>;
}

export const TradingStore = create<TradingStore>((set) => ({
  portfolio: { balance: 100000, equity: 100000, pnl: 0 },
  orders: [],
  positions: [],
  initialize: async () => {
    // Initialize with demo data
    set({
      portfolio: { balance: 100000, equity: 100000, pnl: 1250 },
      orders: [],
      positions: [
        { symbol: 'AAPL', shares: 10, price: 150.25 },
        { symbol: 'GOOGL', shares: 5, price: 140.50 },
      ],
    });
  },
}));
