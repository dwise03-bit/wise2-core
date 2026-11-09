# WISE² Trading

WISE² Trading is a standalone WISE² Core application for live TradingView alerts, policy/risk controls, coaching and journal records, and Discord notifications. NinjaTrader is the designated platform connector; Apex program policies are an optional account environment, not WISE² product rules.

## What is live today

- TradingView CME NQ/MNQ is the entitled live source. Delayed Yahoo/QQQ is not used.
- Pine `tv/nq_ema_134860.pine` posts every confirmed bar with EMA 13/48/60 and LONG/SHORT/WAIT.
- Webhook `/api/tradingview` stores the live snapshot. K10 polls `/api/k10/companion` or `https://wise2.net/api/k10/nq`.
- Orders stay fail-closed. Live means live market data and alerts, not auto-routing.

## NinjaTrader and Apex boundary

- WISE² is the control plane: identity, alert intake, client policy, audit trail, coaching, and notifications.
- NinjaTrader is the trading-platform connector. Its APIs support account data, market data, and order actions, but access must be separately authorized.
- Apex accounts are a client program environment. Current rules and permitted automation must be checked for the client’s specific plan before enabling any execution path.

## What is deliberately not enabled

No code path sends orders to a brokerage or exchange. A NinjaTrader integration needs the client’s authorized account, least-privilege credentials, approved Apex plan/rules, account-level max loss policy, audit storage, idempotency keys, and a human confirmation design.

## TradingView alert body

```json
{
  "secret": "your-long-secret",
  "symbol": "NQ1!",
  "side": "LONG",
  "price": 20150.25,
  "ema13": 20140.1,
  "ema48": 20110.4,
  "ema60": 20090.8,
  "strategy": "EMA_13_48_60",
  "timeframe": "1"
}
```

## Run

```bash
cp .env.example .env.local
npm install
npm run dev
```

The app listens at `http://localhost:3017`; TradingView requires a publicly reachable HTTPS URL in production.
