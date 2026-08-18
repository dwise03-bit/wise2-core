# AETHER-TRADER

Deterministic research package for formalizing, backtesting, validating, and stress-testing a liquidity-raid trading strategy.

## What it includes

- Deterministic 4H bias, RSI, Fibonacci, liquidity, and session models
- Setup scoring with explicit pass/fail gates
- Structural stops, target models, and position sizing
- Backtesting with spread, commission, and slippage modeling
- Walk-forward validation and Monte Carlo stress testing
- Honest performance gate that reports failure when out-of-sample performance does not meet the target

## Quick start

```bash
pnpm --filter @wise2/aether-trader build
pnpm --filter @wise2/aether-trader test
node --experimental-strip-types packages/aether-trader/src/cli.ts --demo
```

## CSV input

The CLI accepts a CSV with these columns:

`timestamp,open,high,low,close,volume,spread`

Example:

```bash
node --experimental-strip-types packages/aether-trader/src/cli.ts --csv ./data/market.csv
```
