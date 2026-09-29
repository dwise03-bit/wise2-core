import { Injectable, Logger } from '@nestjs/common';

export interface TradingViewWatchlistItem {
  symbol: string;
  exchange?: string;
  name?: string;
  price?: number;
  change?: number;
  changePercent?: number;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  type: 'ABOVE' | 'BELOW';
  price: number;
  active: boolean;
  triggered?: boolean;
  createdAt: Date;
}

/**
 * TradingView Integration Service
 * Fetches and caches watchlist data from public TradingView API
 * Manages price alerts and real-time syncing
 */
@Injectable()
export class TradingViewService {
  private readonly logger = new Logger('TradingViewService');
  private watchlistCache = new Map<string, TradingViewWatchlistItem[]>();
  private alertsCache = new Map<string, PriceAlert[]>();
  private cacheTTL = 60000; // 1 minute
  private lastFetchTime = new Map<string, number>();

  async getWatchlist(username: string): Promise<TradingViewWatchlistItem[]> {
    // Check cache first
    const cached = this.watchlistCache.get(username);
    const lastFetch = this.lastFetchTime.get(username) || 0;

    if (cached && Date.now() - lastFetch < this.cacheTTL) {
      this.logger.debug(`[Cache HIT] Watchlist for ${username}`);
      return cached;
    }

    this.logger.debug(`[Cache MISS] Fetching watchlist for ${username}`);

    try {
      const response = await fetch(
        `https://api.tradingview.com/api/v1/user/get_profile?username=${username}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`TradingView API returned ${response.status}`);
      }

      const data = (await response.json()) as any;

      // Extract watchlist from profile
      let watchlist: TradingViewWatchlistItem[] = [];
      if (data?.watchlist && Array.isArray(data.watchlist)) {
        watchlist = data.watchlist.map((item: any) => ({
          symbol: item.symbol || item.ticker,
          exchange: item.exchange,
          name: item.name,
        }));
      }

      // Cache result
      this.watchlistCache.set(username, watchlist);
      this.lastFetchTime.set(username, Date.now());

      this.logger.log(`✅ Synced ${watchlist.length} symbols from TradingView (${username})`);
      return watchlist;
    } catch (error) {
      this.logger.error(`Failed to fetch TradingView watchlist: ${error}`);

      // Fallback to demo watchlist
      const fallback: TradingViewWatchlistItem[] = [
        { symbol: 'BTCUSD', name: 'Bitcoin' },
        { symbol: 'ETHUSD', name: 'Ethereum' },
        { symbol: 'AAPL', name: 'Apple' },
        { symbol: 'MSFT', name: 'Microsoft' },
      ];

      this.watchlistCache.set(username, fallback);
      return fallback;
    }
  }

  getAlerts(username: string): PriceAlert[] {
    return this.alertsCache.get(username) || [];
  }

  createAlert(
    username: string,
    symbol: string,
    type: 'ABOVE' | 'BELOW',
    price: number
  ): PriceAlert {
    const alert: PriceAlert = {
      id: `${symbol}-${Date.now()}`,
      symbol,
      type,
      price,
      active: true,
      createdAt: new Date(),
    };

    const alerts = this.alertsCache.get(username) || [];
    alerts.push(alert);
    this.alertsCache.set(username, alerts);

    this.logger.log(`✅ Alert created: ${symbol} ${type} $${price}`);
    return alert;
  }

  toggleAlert(username: string, alertId: string): boolean {
    const alerts = this.alertsCache.get(username) || [];
    const alert = alerts.find(a => a.id === alertId);

    if (alert) {
      alert.active = !alert.active;
      this.logger.log(`✅ Alert toggled: ${alert.symbol} → ${alert.active ? 'Active' : 'Paused'}`);
      return true;
    }

    return false;
  }

  deleteAlert(username: string, alertId: string): boolean {
    const alerts = this.alertsCache.get(username) || [];
    const index = alerts.findIndex(a => a.id === alertId);

    if (index > -1) {
      alerts.splice(index, 1);
      this.logger.log(`✅ Alert deleted: ${alertId}`);
      return true;
    }

    return false;
  }

  checkAlerts(username: string, symbol: string, currentPrice: number): PriceAlert[] {
    const alerts = this.alertsCache.get(username) || [];
    const triggered: PriceAlert[] = [];

    alerts.forEach(alert => {
      if (alert.symbol === symbol && alert.active && !alert.triggered) {
        const shouldTrigger =
          (alert.type === 'ABOVE' && currentPrice >= alert.price) ||
          (alert.type === 'BELOW' && currentPrice <= alert.price);

        if (shouldTrigger) {
          alert.triggered = true;
          triggered.push(alert);
          this.logger.warn(`🔔 ALERT TRIGGERED: ${symbol} ${alert.type} $${alert.price}`);
        }
      }
    });

    return triggered;
  }

  clearCache(username?: string): void {
    if (username) {
      this.watchlistCache.delete(username);
      this.lastFetchTime.delete(username);
      this.logger.log(`Cache cleared for ${username}`);
    } else {
      this.watchlistCache.clear();
      this.lastFetchTime.clear();
      this.logger.log('All caches cleared');
    }
  }
}
