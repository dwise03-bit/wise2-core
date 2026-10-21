"""Dependency-free research launcher and paper trade recorder. No order execution."""
import argparse
import json
import math
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode

PRESETS = {
    "liquid-trend": "cap_midover,sh_avgvol_o1000,sh_price_o10,ta_sma200_pa",
    "volume-watch": "sh_avgvol_o1000,sh_price_o10,sh_relvol_o2",
    "dividend-research": "cap_largeover,fa_div_pos,fa_eps5years_pos,sh_avgvol_o500",
}

def ticker(value):
    value = value.strip().upper()
    if not re.fullmatch(r"[A-Z][A-Z0-9.-]{0,14}", value):
        raise ValueError("Use a stock ticker, such as CMG or BRK.B.")
    return value

def links(symbol=None):
    result = {name: "https://finviz.com/screener.ashx?" + urlencode({"v": "111", "f": filters})
              for name, filters in PRESETS.items()}
    result["market-map"] = "https://finviz.com/map.ashx"
    result["paper-trading-guide"] = "https://www.tradingview.com/support/solutions/43000516466-paper-trading-main-functionality/"
    if symbol:
        symbol = ticker(symbol)
        result["company-research"] = "https://finviz.com/quote.ashx?" + urlencode({"t": symbol})
        result["chart-search"] = "https://www.tradingview.com/symbols/" + symbol + "/"
    return result

def paper_record(symbol, entry, stop, risk_budget, source, observed_at):
    """Long-only whole-share practice sizing; not a fill or recommendation."""
    if any(not math.isfinite(x) or x <= 0 for x in (entry, stop, risk_budget)):
        raise ValueError("Entry, stop and practice risk budget must be finite and positive.")
    if stop >= entry:
        raise ValueError("For a long practice setup, stop must be below entry.")
    observed = datetime.fromisoformat(observed_at.replace("Z", "+00:00"))
    if observed.tzinfo is None:
        raise ValueError("Observation timestamp must include its timezone.")
    if not source.strip():
        raise ValueError("Record the source URL or provider name.")
    per_share = entry - stop
    quantity = math.floor(risk_budget / per_share)
    return {"symbol": ticker(symbol), "mode": "paper", "status": "unverified-candidate",
            "entry": entry, "stop": stop, "practice_risk_budget": risk_budget,
            "whole_shares": quantity, "planned_risk": round(quantity * per_share, 8),
            "notional": round(quantity * entry, 8), "source": source.strip(),
            "observed_at": observed.isoformat(),
            "recorded_at": datetime.now(timezone.utc).isoformat(),
            "data_delay": "unknown; confirm with provider",
            "catalyst": "", "earnings_date": "", "spread": None,
            "review_notes": "", "fill_price": None,
            "limitations": "Sizing excludes gaps, slippage, fees and available capital. No order placed."}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    link_parser = sub.add_parser("links")
    link_parser.add_argument("--ticker")
    record_parser = sub.add_parser("paper-record")
    record_parser.add_argument("--ticker", required=True)
    for name in ("entry", "stop", "risk-budget"):
        record_parser.add_argument("--" + name, type=float, required=True)
    for name in ("source", "observed-at", "output"):
        record_parser.add_argument("--" + name, required=True)
    args = parser.parse_args()
    try:
        if args.command == "links":
            print(json.dumps(links(args.ticker), indent=2))
        else:
            record = paper_record(args.ticker, args.entry, args.stop, args.risk_budget,
                                  args.source, args.observed_at)
            output = Path(args.output)
            output.parent.mkdir(parents=True, exist_ok=True)
            with output.open("x", encoding="utf-8") as file:
                json.dump(record, file, indent=2)
            print(str(output))
    except (ValueError, OSError) as error:
        parser.error(str(error))

if __name__ == "__main__":
    main()
