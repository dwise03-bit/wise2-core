"""Normalize AI Hedge Fund research output into the EVERY DAY TRADER journal shape.

This adapter is read-only: it parses a local report and never places orders.
"""
import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

REQUIRED = ("symbol", "source", "observed_at")

def normalize(report):
    if not isinstance(report, dict):
        raise ValueError("Report must be a JSON object.")
    symbol = str(report.get("symbol", "")).strip().upper()
    source = str(report.get("source", "AI Hedge Fund")).strip()
    observed = str(report.get("observed_at", "")).strip()
    if not symbol or not source or not observed:
        raise ValueError("Report requires symbol, source and observed_at.")
    timestamp = datetime.fromisoformat(observed.replace("Z", "+00:00"))
    if timestamp.tzinfo is None:
        raise ValueError("observed_at must include a timezone.")
    return {
        "symbol": symbol,
        "mode": "research",
        "status": "aihf-report-unverified",
        "source": source,
        "observed_at": timestamp.isoformat(),
        "recorded_at": datetime.now(timezone.utc).isoformat(),
        "recommendation": report.get("recommendation", "unclassified"),
        "confidence": report.get("confidence"),
        "thesis": report.get("thesis", ""),
        "risk_flags": report.get("risk_flags", []),
        "metrics": report.get("metrics", {}),
        "data_delay": report.get("data_delay", "unknown; confirm with provider"),
        "execution": "disabled",
        "limitations": "Research normalization only; validate data, thesis, and risk before paper practice."
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    try:
        with Path(args.input).open(encoding="utf-8") as f:
            result = normalize(json.load(f))
        output = Path(args.output)
        output.parent.mkdir(parents=True, exist_ok=True)
        with output.open("x", encoding="utf-8") as f:
            json.dump(result, f, indent=2)
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        parser.error(str(exc))

if __name__ == "__main__":
    main()
