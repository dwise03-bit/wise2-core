# Alpha Vantage Setup Guide

## Overview
The Every Day Trader dashboard supports real-time market data from Alpha Vantage. This guide walks through the setup process.

## Step 1: Get Your Free Alpha Vantage API Key

1. Visit [https://www.alphavantage.co/](https://www.alphavantage.co/)
2. Click "GET FREE API KEY"
3. Enter your email and agree to terms
4. Your API key will be sent to your email (or displayed immediately)
5. Keep this key safe — it's your access token

**Rate Limits (Free Tier):**
- 5 requests per minute
- 100 requests per day
- Intraday data limited to 60 candles per request

## Step 2: Configure Environment Variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_MARKET_DATA_SOURCE=alpha-vantage
NEXT_PUBLIC_ALPHA_VANTAGE_KEY=your_api_key_here
```

**Important**: The `NEXT_PUBLIC_` prefix makes these available to the browser. Do not expose production keys in client-side code.

## Step 3: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

The dashboard will now fetch live quotes and candles from Alpha Vantage.

## Step 4: Verify Data Flow

1. Open the dashboard at `http://localhost:3000/every-day-trader`
2. Check the browser console for any API errors
3. Verify price updates every 5 seconds
4. Watch PLOT AI analysis recalculate with real data

## API Endpoints Used

### Market Quotes
```
https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=NVDA&apikey=KEY
```

Returns:
- Current price
- Daily change
- High/Low
- Volume
- Timestamp

### Candlestick Data (Intraday)
```
https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=NVDA&interval=60min&apikey=KEY
```

Returns:
- OHLC data for last 60 candles
- Volume per candle
- Timestamp for each bar

## Troubleshooting

### "API Rate Limit Exceeded"
- Wait 60 seconds before retrying
- Consider upgrading to premium tier
- Increase update interval in `page.tsx` (currently 5000ms)

### "Invalid API Key"
- Double-check key in `.env.local`
- Ensure no extra spaces or quotes
- Verify key is active on Alpha Vantage website

### "No Data Displayed"
- Check browser console for fetch errors
- Verify network request in DevTools
- Ensure symbols (NVDA, AAPL, SPY, QQQ) are valid
- Wait 5+ seconds for first update

### "Mixed Market Data"
- Alpha Vantage has a 60-candle limit per request
- Dashboard may show partial historical data
- Consider using intraday interval of "60min" or higher

## Alternative: Yahoo Finance (Rapid API)

To use Yahoo Finance instead:

1. Sign up at [https://rapidapi.com/](https://rapidapi.com/)
2. Subscribe to "Yahoo Finance" API
3. Get your Rapid API key
4. Update `.env.local`:

```bash
NEXT_PUBLIC_MARKET_DATA_SOURCE=yahoo
NEXT_PUBLIC_RAPID_API_KEY=your_rapid_key_here
```

## Upgrading to Premium

Alpha Vantage offers premium tiers with:
- Higher rate limits (500+ requests/minute)
- More historical data
- Faster response times
- Email support

Visit [https://www.alphavantage.co/premium/](https://www.alphavantage.co/premium/) to upgrade.

## Performance Notes

- **Update Interval**: Currently 5 seconds (5000ms). Adjust in `page.tsx` line 40-43
- **Symbols Tracked**: NVDA, AAPL, SPY, QQQ. Add more symbols in `liveDataManager.startLiveUpdates()`
- **Data Retention**: Last 20 candles stored in `marketDataService`
- **PLOT AI Latency**: Analysis updates within 50-100ms of data arrival

## Rollback to Mock Data

To revert to development mock data:

```bash
# Remove or comment out in .env.local:
# NEXT_PUBLIC_MARKET_DATA_SOURCE=alpha-vantage
# NEXT_PUBLIC_ALPHA_VANTAGE_KEY=...

# Or explicitly set:
NEXT_PUBLIC_MARKET_DATA_SOURCE=mock
```

Restart server and dashboard will use realistic generated data.
