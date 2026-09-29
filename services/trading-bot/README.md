# WISE² Trading Bot

**Automated technical analysis & real-time Discord trade alerts**

## 🎯 Features

### Core Analysis
- **ÆTHER-Trader Engine** — Liquidity-based swing trading analysis
- **Fibonacci Retracements** — Entry zone detection at key levels
- **RSI Momentum** — Trend strength & divergence analysis
- **Market Regime Detection** — Trending, ranging, volatile market classification
- **Liquidity Sweeps** — Buy/sell side liquidation detection
- **Risk/Reward Scoring** — Automatic position sizing validation

### Discord Integration
- **Real-time Alerts** — Setup notifications with full analysis
- **Interactive Commands** — Track symbols, get prices, view charts
- **Setup Visualization** — Embedded charts with entry/target/stop zones
- **Price Monitoring** — Volume, trend, and action charts

### Data Sources
- **Binance API** — Crypto trading pairs
- **Alpha Vantage** — Stock market data
- **Mock Data** — Development/testing fallback

## 🚀 Quick Start

### 1. Prerequisites
```bash
# Discord Bot Token (from Discord Developer Portal)
export DISCORD_TOKEN=your_token_here

# Optional: API Keys for live data
export BINANCE_API_KEY=your_key
export ALPHA_VANTAGE_KEY=your_key
```

### 2. Install & Build
```bash
cd services/trading-bot
npm install
npm run build
```

### 3. Run
```bash
npm start
# Development with hot reload:
npm run dev
```

## 📋 Commands

### Tracking
```
!track <symbol> [timeframe]    Start tracking a symbol
!untrack <symbol>              Stop tracking
!tracked                        List all tracked symbols
```

**Examples:**
```
!track BTC/USDT 1h             Track Bitcoin on 1-hour candles
!track AAPL 4h                 Track Apple on 4-hour candles
!untrack BTC/USDT              Stop tracking Bitcoin
!tracked                        Show active trackers
```

### Analysis
```
!price <symbol>                Get current price
!setups [symbol]               Show active trade setups
!chart <symbol> [type]         Generate price/volume chart
```

**Examples:**
```
!price BTC/USDT                Get Bitcoin price
!setups BTC/USDT               Show setups for Bitcoin
!setups                         Show all active setups
!chart BTC/USDT price          Generate price chart
!chart BTC/USDT volume         Generate volume chart
```

### Help
```
!help                           Show command reference
```

## 📊 Setup Format

When a trade setup is detected:

```
🎯 New Setup: BTC/USDT
Direction: 📈 LONG
Type: LIQUIDITY_SWEEP
Confidence: 87.5%
Entry Zone: $42,500 - $42,750
Stop Loss: $41,200
Target: $45,800
Risk/Reward: 2.45:1
Fib Level: 0.382
Market Regime: TRENDING_UP (82%)
Rationale: Long setup in DISCOUNT zone at Fib 0.382...
```

With embedded chart showing:
- Price action (blue line)
- Entry zone (yellow band)
- Stop loss level (red dashed)
- Target level (green dashed)
- Impulse range (cyan dashed)

## 🏗️ Architecture

```
services/trading-bot/
├── src/
│   ├── index.ts                    Bot entry point
│   ├── services/
│   │   ├── trading-bot-service.ts  Core trading logic
│   │   ├── price-data-service.ts   Market data fetching
│   │   └── chart-service.ts        Chart generation
│   └── handlers/
│       └── command-handler.ts      Discord command processing
├── package.json
├── tsconfig.json
└── README.md
```

### Data Flow
```
Market Data (Binance/Alpha Vantage)
    ↓
PriceDataService (fetch + cache)
    ↓
TradingBotService (ÆTHER-Trader analysis)
    ↓
Discord Alerts → CommandHandler → Charts
```

## 🔌 Integration with ÆTHER-Trader

```typescript
import { AETHERTrader, OHLCV } from 'packages/trading-engine/src/aether-trader';

// Create trader
const trader = new AETHERTrader('BTC/USDT');

// Feed candles
const candle: OHLCV = {
  time: new Date(),
  open: 42500,
  high: 42750,
  low: 42300,
  close: 42600,
  volume: 1500000
};
trader.addCandle(candle);

// Scan for setups
const setups = trader.scan();
setups.forEach(setup => {
  console.log(`${setup.direction} at ${setup.entryZone.start}`);
});
```

## ⚙️ Configuration

Environment variables (copy `.env.example` to `.env`):

| Variable | Default | Purpose |
|----------|---------|---------|
| `DISCORD_TOKEN` | required | Bot authentication |
| `POLL_INTERVAL_SECONDS` | 60 | Update frequency |
| `MAX_TRACKED_SYMBOLS` | 10 | Limit concurrent tracking |
| `BINANCE_API_KEY` | optional | Crypto market data |
| `ALPHA_VANTAGE_KEY` | optional | Stock market data |
| `NOTIFY_ON_SETUP` | true | Alert on new setups |
| `CHART_WIDTH` | 1200 | Chart image width |
| `CHART_HEIGHT` | 600 | Chart image height |

## 📈 Analysis Workflow

1. **Market Data Ingestion**
   - Fetch OHLCV candles from Binance/Alpha Vantage
   - Cache for 5 minutes to reduce API calls

2. **Structural Analysis**
   - Detect swing highs/lows
   - Identify impulse ranges
   - Classify market regime (trending/ranging)

3. **Entry Zone Detection**
   - Calculate Fibonacci retracements
   - Determine premium/discount zones
   - Validate risk/reward ratio (min 1.5:1)

4. **Setup Validation**
   - RSI momentum confirmation
   - Regime alignment check
   - Liquidity sweep detection

5. **Alert & Visualization**
   - Format setup details to Discord
   - Generate setup chart with levels
   - Post real-time updates

## 🧪 Testing

```bash
# With mock data (no API keys needed)
npm run dev

# Discord: !track BTC/USDT
# Bot will post demo setups with mock price data
```

## 📚 ÆTHER-Trader Documentation

See `packages/trading-engine/src/aether-trader.ts` for:
- `MarketStructureEngine` — Swing/impulse detection
- `FibonacciEngine` — Level calculations
- `RSIEngine` — Momentum analysis
- `RegimeEngine` — Market condition classification
- `LiquidityEngine` — Sweep detection
- `SetupEngine` — Setup generation

## 🔒 Security

- Discord token stored in `.env` (never committed)
- API keys optional for development
- No credential logging in console
- Webhook payloads validated

## 🚀 Deployment

### Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY services/trading-bot .
RUN npm install && npm run build
CMD ["npm", "start"]
```

### PM2
```bash
pm2 start services/trading-bot/dist/index.js --name "wise2-trading-bot"
pm2 save
```

### Systemd
```ini
[Unit]
Description=WISE² Trading Bot
After=network.target

[Service]
Type=simple
User=wise2
WorkingDirectory=/opt/wise2/services/trading-bot
ExecStart=/usr/bin/node /opt/wise2/services/trading-bot/dist/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Bot offline | Check `DISCORD_TOKEN` validity |
| No chart images | Install `canvas` system deps: `apt-get install libcairo2-dev` |
| Slow updates | Increase `POLL_INTERVAL_SECONDS` |
| API rate limits | Use cache or reduce tracked symbols |
| Mock data only | Add API keys to `.env` |

## 📝 License

WISE² Core - Private

## 👤 Author

Built with ❤️ for WISE² Genesis
