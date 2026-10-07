"""
FILTER - Screening Pipeline
Facts kill before judgements do. Pass one → free kills. Pass two → trade kills.
Pass three → chain kills. Pass four → soft kills (uses Jev).
"""

import logging
from typing import Optional
from thresholds import HARD, SOFT, SHAPE_MIN_CROWD

logger = logging.getLogger("filter")


def free_kill(t: dict) -> Optional[str]:
    """Pass one. Runs on the whole universe, costs nothing, touches no network.
    Everything it reads came back with the FOMO batch."""
    if not (HARD["min_age_minutes"] <= t["age_minutes"] <= HARD["max_age_hours"] * 60):
        return "age"
    if t["liquidity_usd"] < HARD["min_liquidity_usd"]:
        return "liquidity"
    if t["volume_h24"] < HARD["min_volume_h24"]:
        return "volume"
    if not (HARD["min_mcap_usd"] <= t["mcap_usd"] <= HARD["max_mcap_usd"]):
        return "mcap"
    return None


def trade_kill(t: dict) -> Optional[str]:
    """Pass two. One DexScreener call already spent on this token. Tens, not hundreds."""
    if t["trades_h24"] is None:
        return "no_pair"
    if t["trades_h24"] < HARD["min_trades_h24"]:
        return "trades"
    if t["sells_h1"] == 0 and (t["buys_h1"] or 0) > 20:
        return "no_sells"
    return None


def chain_kill(d: dict) -> Optional[str]:
    """After the dossier, still free. Facts, not judgements."""
    if (
        d.get("top_wallet_percent") is not None
        and d["top_wallet_percent"] > HARD["max_top_wallet"]
    ):
        return "top_wallet"
    if d.get("top_10_percent") is not None and float(d["top_10_percent"]) / 100 > HARD["max_top_10"]:
        return "top_10"
    if d.get("holder_count") is not None and d["holder_count"] < HARD["min_holders"]:
        return "holders"
    if d["chain"] == "solana" and (d["mint_authority"] or d["freeze_authority"]):
        return "authority_open"  # a fact, no model needed
    if d["chain"] == "bsc" and d.get("is_honeypot") is True:
        return "honeypot"  # also a fact
    return None


def soft_kill(ans: dict) -> Optional[str]:
    """Jev's answers against SOFT. First failure wins."""
    for name, (direction, limit) in SOFT.items():
        a = ans.get(name)
        if a is None:
            continue  # question not asked for this chain
        v = a.get("noul", a.get("score"))
        if v is None:
            continue
        if direction == "max" and v > limit:
            return name
        if direction == "min" and v < limit:
            return name

    shape = ans.get("shape")
    if shape:
        if shape["choice"] in ("fading", "one_buyer"):
            return "shape"
        if shape.get("probabilities", {}).get("crowd", 0) < SHAPE_MIN_CROWD:
            return "shape_weak"

    chain = ans.get("sell_side_risk")
    if chain and chain.get("choice") in ("flagged", "suspicious"):
        return "sell_side"

    return None


def apply_filters(t: dict) -> Optional[str]:
    """Apply all filters in order. Return the rejection reason, or None if it passes."""
    if reason := free_kill(t):
        return reason
    if reason := trade_kill(t):
        return reason
    if reason := chain_kill(t):
        return reason
    return None
