"""
MAIN - Shift Manager
The process that never stops: owns the cycle, calls everything in order,
hands finished orders to the seats.
"""

import time
import logging
import os
from typing import Optional, Tuple, Dict, Any
from collect import universe, shortlist, trade_counts, dossier, social_state
from filter import free_kill, trade_kill, chain_kill, soft_kill
from pick import pick as pick_token
from judge_client import judge_market, judge_chain, judge_social, judge_pick
import book

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("shift")

CHAIN_SET = {1399811149: "solana", 56: "bsc", 8453: "bsc", 4663: "robinhood"}
CYCLE_SECONDS = 900  # 15 minutes
GT_PER_MINUTE = 10  # free tier
GT_UNIVERSE = 6  # 3 chains x 2 pages
GT_DOSSIER = 3  # what is left for dossiers
DEX_BUDGET = 25  # DexScreener calls per cycle


def run_once(
    fomo_tokens: Dict[str, dict],
    desk_bank: float,
    shadow: bool = True
) -> Tuple[Optional[dict], Dict[str, Any]]:
    """Run one cycle of the trading desk"""

    # Check if currently holding a position
    if h := book.held():
        logger.info(f"holding {h['ticker']} for {h['minutes']:.0f} min, no scan this cycle")
        return None, {"held": h["ticker"], "minutes": round(h["minutes"])}

    stats = {"seen": 0, "benched": 0, "free": {}, "trade": {}, "chain": {}, "soft": {}}
    survivors = []
    gt_slots, dex_slots = GT_DOSSIER, DEX_BUDGET

    # Stage 1: Get fresh pools
    try:
        ids = universe()
    except Exception as e:
        logger.error(f"universe fetch failed: {e}")
        return None, stats

    # Stage 2: Screen free filters
    for t in shortlist(fomo_tokens):
        stats["seen"] += 1

        if book.benched(t["tid"]):
            stats["benched"] += 1
            continue

        if k := free_kill(t):
            book.sit(t["tid"], k)
            stats["free"][k] = stats["free"].get(k, 0) + 1
            continue

        # Check budget
        if dex_slots <= 0 or gt_slots <= 0:
            break

        # Stage 3: Get trade counts
        try:
            t |= trade_counts(t)
            dex_slots -= 1
        except Exception as e:
            logger.warning(f"trade_counts failed for {t.get('ticker')}: {e}")
            continue

        if k := trade_kill(t):
            book.sit(t["tid"], k)
            stats["trade"][k] = stats["trade"].get(k, 0) + 1
            continue

        # Stage 4: Get dossier
        try:
            d = dossier(t)
            gt_slots -= 1
        except Exception as e:
            logger.warning(f"dossier failed for {t.get('ticker')}: {e}")
            gt_slots -= 1
            book.sit(t["tid"], "dossier_failed")
            continue

        if k := chain_kill(d):
            book.sit(t["tid"], k)
            stats["chain"][k] = stats["chain"].get(k, 0) + 1
            continue

        # Set intended ticket
        d["intended_ticket_usd"] = desk_bank * 0.06

        # Stage 5: Judge
        ans = {}
        try:
            ans |= judge_market(d)["answers"]
            ans |= judge_chain(CHAIN_SET[d["net"]], d)["answers"]
        except Exception as e:
            logger.warning(f"judge failed for {d.get('ticker')}: {e}")
            continue

        if k := soft_kill(ans):
            book.sit(t["tid"], k)
            stats["soft"][k] = stats["soft"].get(k, 0) + 1
            continue

        survivors.append((d, ans))

    logger.info(
        f"cycle: {stats['seen']} seen, {stats['benched']} benched, "
        f"free {stats['free']}, trade {stats['trade']}, chain {stats['chain']}, soft {stats['soft']}"
    )

    if not survivors:
        return None, stats

    # Single survivor shortcut
    if len(survivors) == 1:
        d, ans = survivors[0]
        order = {
            "model": "single-survivor",
            "size_factor": 1.0,
            "confidence": None,
            "token": {
                "ticker": d["ticker"],
                "address": d["addr"],
                "network_id": d["net"],
                "chain": d["chain"],
            },
            "why": ans,
        }
    else:
        # Multi-pick
        try:
            pick_result = judge_pick({
                "candidates": [
                    {"ticker": d["ticker"], "summary": f"{d['chain']}, {d['mcap_usd']:,.0f} mcap"}
                    for d, _ in survivors
                ]
            })
            order = pick_token(pick_result, survivors)
        except Exception as e:
            logger.warning(f"pick failed: {e}")
            return None, stats

    if order is None:
        return None, stats

    if shadow:
        logger.info(f"SHADOW: would trade {order['token']['ticker']}")
        return None, stats

    # Record position
    book.take(order)
    return order, stats


def main(fomo_tokens_source=None, shadow: bool = True):
    """Main loop - runs forever"""
    logger.info("Grok Bot desk starting")

    cycle = 0
    while True:
        try:
            # Get fresh FOMO data (mock for now)
            if fomo_tokens_source:
                fomo_tokens = fomo_tokens_source()
            else:
                fomo_tokens = {}  # Would come from FOMO API in production

            order, stats = run_once(fomo_tokens, desk_bank=10000, shadow=shadow)

            if order:
                logger.info(f"ORDER: {order['token']['ticker']} at {order['confidence']}")

            cycle += 1

        except Exception as e:
            logger.exception(f"cycle {cycle} blew up: {e}")

        time.sleep(CYCLE_SECONDS)


if __name__ == "__main__":
    shadow_mode = os.environ.get("SHADOW_MODE", "true").lower() == "true"
    main(shadow=shadow_mode)
