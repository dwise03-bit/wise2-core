# EVERY DAY TRADER — immediate research toolkit

Added October 8, 2026 after reviewing the uploaded Finviz / Invo recording.
This is a working research and paper-journal module; it is not a deployed dashboard or connected brokerage account.

## Use now

Python 3, standard library only. From repository root:

```bash
python3 EVERY-DAY-TRADER/research/research.py links --ticker CMG
python3 -m unittest discover -s EVERY-DAY-TRADER/research -v
```

Open the generated links. The presets are our research starting points:

| Preset | Filters | Purpose |
|---|---|---|
| liquid-trend | Mid cap or larger; average volume over 1M; price over $10; above 200-day SMA | Liquid trend candidates |
| volume-watch | Average volume over 1M; price over $10; relative volume over 2 | Investigate unusual activity |
| dividend-research | Large cap or larger; positive dividend; positive 5-year EPS growth; average volume over 500K | Start dividend due diligence |

Finviz may change filter codes; confirm the selected filter labels on the opened page. A match is a research candidate, not a buy instruction. Dividend screening does not establish payout safety.

Before paper practice, record quote source, observation time, actual delay, earnings date, catalyst, spread and your thesis. Confirm the chart symbol and exchange. TradingView Paper Trading requires the user to connect its simulator in their own account.

Practice example only — these are invented prices, not a current CMG quote:

```bash
python3 EVERY-DAY-TRADER/research/research.py paper-record --ticker CMG --entry 50 --stop 48 --risk-budget 25 --source 'manual practice example' --observed-at '2026-10-08T12:00:00-04:00' --output /tmp/cmg-paper-example.json
```

The result records 12 whole shares and $24 of planned stop-distance risk. Actual losses can exceed this due to gaps or slippage. Zero shares means the budget is too small for one share at the chosen stop distance. The file is a candidate journal record, not a simulated fill. Output files are created exclusively to prevent accidental overwrite; keep personal journal records outside the public repository.

## Source audit and priorities

1. Immediate: Finviz research links and screening presets — implemented here. Free quotes are delayed; check the page's current label. Do not use the recording's displayed prices as current prices.
2. High priority: chart verification and paper-practice records — implemented here. No live quote ingestion, API credentials, order submission or account connection exists in this module.
3. Deferred: Invo research. The official guide says Mimic copies take profit, leverage and position size. A leaderboard or winning screenshot is insufficient evidence to deploy money. No wallet connection, deposit or copied trade has been performed.

The stock-charting screen shows KOSS and a Webull advertisement, but the visible frames do not conclusively identify its hosting service. TradingView is a separately verified paper-practice option, not a claimed identification of that screen. The reel's FBI framing supplies no evidence of an official restriction.

Official sources checked October 8, 2026:
- https://finviz.com/help/screener
- https://finviz.com/help/faq
- https://www.tradingview.com/support/solutions/43000516466-paper-trading-main-functionality/
- https://www.invoapp.com/guides/managing-trades

## Next integration boundary

The inspected wise2-core tree has arsenal registries but no existing EVERY DAY TRADER application. Keep this first-party module separate from pinned upstream sources. A future dashboard may consume the journal JSON read-only. Add an actual market-data provider with explicit delay metadata before creating price alerts. AI Hedge Fund report normalization remains separate work and was not required by this recording.
