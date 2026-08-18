# WISE² TRADING Command Center Spec

Last updated: August 18, 2026

## Screens

### Overview

Show:

- system status
- current session
- 4H bias
- regime
- strategy mode
- realized P&L
- unrealized P&L
- exposure
- drawdown state
- kill-switch state

Empty-state rules:

- disconnected feed: `NOT CONNECTED`
- missing metric: `NO DATA`

### Market Map

Show:

- Asia range
- London range
- New York range
- previous day high/low
- active liquidity pools
- detected raids
- structural swing range
- Fibonacci zones
- target liquidity

### Setups

Each setup card must include:

- instrument
- direction
- setup tier
- confidence score
- estimated probability
- 4H alignment
- sweep classification
- Fib zone
- regime
- stop
- target
- R:R
- accepted/rejected reason

### Research

Show:

- strategy versions
- experiments
- model comparisons
- parameter sweeps
- feature importance
- regime splits

### Validation

Show:

- training results
- validation results
- OOS results
- walk-forward results
- Monte Carlo results
- sensitivity warnings

### Analytics

Show:

- win rate
- expectancy
- profit factor
- Sharpe
- Sortino
- max drawdown
- average R
- monthly returns
- session splits
- regime splits
- setup-class splits

### Risk

Show:

- daily risk usage
- consecutive losses
- correlated exposure
- max drawdown threshold
- shutdown state
- kill-switch control state

### Execution

Show:

- open positions
- pending orders
- fills
- rejection events
- slippage
- latency
- broker connectivity

## UI Rules

- production data must be visually distinct from simulated data
- simulated modes must be explicitly labeled
- live execution controls must remain hidden or disabled without approval
- kill-switch status must be visible on every major screen
- validation failures must be impossible to miss

## Suggested Build Order

1. Overview shell
2. Risk rail
3. Setups list with rejection reasons
4. Validation dashboard
5. Market map
6. Execution monitor
