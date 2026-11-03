"""
PICK - Token Selection
CHIEF runs it, and it is the only call that ever sees more than one token at a time.
A Choice takes up to 255 options and your shortlist is never longer than ten.
"""

import logging
from typing import Optional, Tuple, List, Dict
from thresholds import PICK_MIN_WORTH, PICK_MIN_CONF, DARK_TICKET_CUT, NO_SOCIAL_CUT

logger = logging.getLogger("pick")


def summary(d: dict, ans: dict) -> str:
    """Two lines per candidate, built from answers Jev already gave.
    Never the raw dossier. A fat state costs accuracy."""
    bits = [
        f"{d['chain']}, {d['age_minutes']:.0f}m old, ${d['mcap_usd']:,.0f} mcap, "
        f"${d['liquidity_usd']:,.0f} liq, {d['holder_count'] or '?'} holders",
        f"crowd {ans.get('shape', {}).get('probabilities', {}).get('crowd', 0):.2f}, "
        f"concentration risk {ans.get('concentration_is_exit_risk', {}).get('noul', 0):.2f}",
    ]

    if "authority_risk" in ans:
        bits.append(f"authority {ans['authority_risk'].get('choice')}")
    if "sell_side_risk" in ans:
        bits.append(f"sell side {ans['sell_side_risk'].get('choice')}")
    if "data_coverage" in ans:
        bits.append(f"data {ans['data_coverage'].get('choice')}")
    if "account_is_the_project" in ans:
        bits.append(
            f"official account {ans['account_is_the_project'].get('noul', 0):.2f}, "
            f"effort {ans.get('effort', {}).get('score', 0):.1f}"
        )
    else:
        bits.append("no usable X account")
    return "; ".join(bits)


def pick(judge_result: dict, survivors: List[Tuple[dict, dict]]) -> Optional[dict]:
    """survivors: [(dossier, answers), ...]. Returns the order, or None."""
    if not survivors:
        return None

    state = {
        "candidates": [
            {"ticker": d["ticker"], "summary": summary(d, a)} for d, a in survivors
        ]
    }

    # Call judge for pick decision
    try:
        r = judge_result
        best = r["answers"].get("best", {})
        worth = r["answers"].get("worth_trading_at_all", {})
    except Exception as e:
        logger.error(f"pick judge failed: {e}")
        return None

    if worth.get("noul", 0) < PICK_MIN_WORTH:
        logger.info("pick rejected: not worth trading")
        return None  # every candidate is mediocre. Normal outcome.

    if best.get("confidence", 0) < PICK_MIN_CONF:
        logger.info("pick rejected: low confidence")
        return None  # flat over ten options means no favourite.

    # Find the chosen token
    d, ans = next(
        (x for x in survivors if x[0]["ticker"] == best.get("choice")),
        (None, None),
    )
    if d is None:
        logger.error("pick schema error: chosen option not in list")
        return None  # the schema guarantees the option is in the list

    size_factor = 1.0
    if ans.get("data_coverage", {}).get("choice") == "dark":
        size_factor *= DARK_TICKET_CUT  # less visibility, smaller ticket
    if "account_is_the_project" not in ans:
        size_factor *= NO_SOCIAL_CUT

    return {
        "model": r.get("model", "unknown"),
        "token": {
            "ticker": d["ticker"],
            "address": d["addr"],
            "network_id": d["net"],
            "chain": d["chain"],
        },
        "size_factor": round(size_factor, 2),
        "confidence": best.get("confidence"),
        "runner_up": sorted(
            best.get("probabilities", {}).items(), key=lambda kv: -kv[1]
        )[1:2],
        "why": {k: v for k, v in ans.items()},
    }
