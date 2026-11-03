# Grok Bot Trading Service

AI-native Solana/BSC token trading system using TypeSafe Jev for decision-making.

## Architecture

### Judge Service (`judge.py`)
FastAPI service that wraps the TypeSafe API for token judgement.

- Exposes `/judge` endpoint for question sets
- Accepts: `question_set` (market, solana, bsc, robinhood, social, pick) + `state` dict
- Returns: Jev answers with confidence scores and usage metrics
- Auth: Bearer token via DESK_SECRET

### Collect (`collect.py`)
Data aggregation from multiple sources in order:

1. **Universe** — Fresh pools from GeckoTerminal (3 chains, 2 pages each)
2. **Shortlist** — Merge with FOMO token batch, dedupe by tid
3. **Trade Counts** — DexScreener trade volume/count data
4. **Dossier** — Full chain data (mcap, liq, holders, authority, honeypot) + Solana RPC for wallet %, top 10%
5. **Social State** — X account metadata (if exists) for social judgement

### Four-Pass Filter (`filter.py`)

1. **free_kill()** — Age, liquidity, volume, mcap hard thresholds
2. **trade_kill()** — 24h trade count and sell presence checks
3. **chain_kill()** — Holder count, authority risk, honeypot, top wallet % checks
4. **soft_kill()** — Jev answer soft thresholds (shape confidence, sell risk, data quality)

### Pick (`pick.py`)
Token selection from survivors:

- Single survivor: auto-trade at 1.0x size
- Multiple: call judge("pick") for best + worth_trading_at_all assessment
- Size cuts: 0.4x for dark data coverage, 0.6x for no X account

### Book (`book.py`)
SQLite position tracking:

- **position table** — Currently held token (id=1 constraint)
- **bench table** — Rejected tokens with reason-based duration (15m to 100k min)
- `held()` — Get current position or None
- `take(order)` — Record new position
- `benched(tid)` — Check if token still on bench
- `sit(tid, reason)` — Bench a token

### Main Loop (`main.py`)
Orchestrates the complete cycle:

1. Check if holding position (skip if yes)
2. Call universe → shortlist
3. Free kill screening (budget: all tokens)
4. Trade kill screening (budget: 25 DexScreener calls/cycle)
5. Chain kill screening (budget: 3 dossier fetches)
6. Soft kill (judge calls for market + chain)
7. Pick best survivor
8. Record position or return nothing

**Cycle time**: 15 minutes (900s)  
**GeckoTerminal**: 3 dossier slots per cycle  
**DexScreener**: 25 trade-count calls per cycle  

## Configuration

### Environment Variables

```bash
# Judge service
TYPESAFE_API_KEY=sk_... (from TypeSafe Console)
JUDGE_URL=http://localhost:8080

# Bot authentication
DESK_SECRET=... (Bearer token for judge calls)

# Data APIs
GECKO_API_KEY=... (GeckoTerminal free tier)
FOMO_API_KEY=... (FOMO Detector API)

# Solana RPC (optional, for top wallet %)
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Database
BOOK_DB_PATH=desk.db

# Mode
SHADOW_MODE=true (dry-run; false = actual trades)
```

### Docker

```bash
# Build and start
docker-compose up --build

# Shadow mode (default)
docker-compose up

# Live trading
SHADOW_MODE=false docker-compose up

# View logs
docker-compose logs -f bot
docker-compose logs -f judge
```

## Testing

### Run Judge Service Only

```bash
docker-compose up judge
curl -X POST http://localhost:8080/judge \
  -H "Authorization: Bearer $DESK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"question_set":"market","state":{"mcap_usd":100000}}'
```

### Run Cycle Once (Shadow Mode)

```bash
docker-compose up bot
# Bot runs for 15 minutes in shadow mode
```

### Test Individual Filters

```python
from src.filter import free_kill, trade_kill
from src.collect import universe, shortlist, dossier

# Test universe fetch
ids = universe()
print(f"Found {len(ids)} pools")

# Test free kill
for pool in shortlist({}):
    if k := free_kill(pool):
        print(f"Rejected {pool['ticker']}: {k}")
```

## Thresholds

### Hard Filters

| Check | Min | Max |
|-------|-----|-----|
| Age | 15m | 72h |
| Liquidity | $12k | - |
| Volume (24h) | $40k | - |
| MCap | $60k | $8M |
| Trade Count (24h) | 150 | - |
| Top Wallet | - | 5% |
| Top 10% | - | 60% |
| Holders | 80 | - |

### Soft Filters (Jev Answers)

- Shape crowd probability: min 0.55
- Pick confidence: min 0.55
- Pick worth: min 0.60

### Bench Durations (Reason → Minutes)

- Honeypot, authority_open: 100,000 min
- Low liquidity, volume, trades: 500 min
- Concentration risk: 250 min
- Reversible (low crowd, soft_kill): 20-25 min

## Data Model

### Dossier (Pool State)

```python
{
    "ticker": "SOL",          # Symbol
    "addr": "...",            # Token address
    "chain": "solana",        # blockchain
    "net": 1399811149,        # Chain ID
    "age_minutes": 30.0,
    "mcap_usd": 500000,
    "liquidity_usd": 25000,
    "volume_24h_usd": 100000,
    "holder_count": 500,
    "trades_24h": 1200,
    "authority_risk": "open",      # open, loaded, none
    "honeypot_detected": False,
    "top_wallet_pct": 2.5,
    "top_10_pct": 45.0,
}
```

### Order (Trade Instruction)

```python
{
    "model": "single-survivor",
    "token": {
        "ticker": "SOL",
        "address": "...",
        "network_id": 1399811149,
        "chain": "solana"
    },
    "size_factor": 0.8,       # 1.0 = full size, 0.4 = small (dark data)
    "confidence": 0.72,       # Jev pick confidence
    "why": {
        "shape": {...},       # Jev answers
        "sell_side_risk": {...}
    }
}
```

## Deployment

### Production Setup

1. Create `.env` with all variables
2. Set `SHADOW_MODE=false` to enable real trades
3. Configure persistent volumes for SQLite
4. Set judge service healthcheck and restart policy
5. Monitor logs and position tracking
6. Set up alerts for failed cycles, bench expirations

### Scaling

- Multiple bot instances can share one judge service
- Each bot maintains independent SQLite position/bench database
- Scale judge horizontally for high QPS (Jev rate limits)

## Troubleshooting

### Judge Service Won't Start

```bash
docker-compose logs judge
# Check TYPESAFE_API_KEY is set
# Verify bearer token in bot's DESK_SECRET
```

### Bot Keeps Benching Everything

- Check thresholds in `thresholds.py`
- Verify API keys for FOMO, GeckoTerminal
- Check soft_kill reason distribution in logs
- Inspect bench table: `sqlite3 desk.db "SELECT * FROM bench"`

### Position Not Updating

- Verify BOOK_DB_PATH volume is mounted
- Check position table: `sqlite3 desk.db "SELECT * FROM position"`
- Review book.py logging

## License

Part of WISE² Genesis.
