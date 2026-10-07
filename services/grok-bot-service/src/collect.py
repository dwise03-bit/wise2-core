"""
COLLECT - Scan & Vet
Fetches everything: fresh pools, metrics, chain data, social accounts.
No Jev call here, it's a function. This gets everything.
"""

import time
import logging
import requests
from typing import Optional, Dict, List

logger = logging.getLogger("collect")

GT = "https://api.geckoterminal.com/api/v2"
DEX = "https://api.dexscreener.com/latest/dex/tokens"

# Three chains the desk trades, plus Base which shares the BSC question set
GT_NET = {1399811149: "solana", 4663: "robinhood", 56: "bsc", 8453: "base"}
FOMO_NET = {v: k for k, v in GT_NET.items()}


def age_minutes(created) -> float:
    """createdAt comes back as epoch seconds or milliseconds depending on the row."""
    if not created:
        return 0.0
    c = float(created)
    if c > 1e11:  # milliseconds
        c /= 1000
    return max(0.0, (time.time() - c) / 60)


def universe(nets=("solana", "bsc", "robinhood"), pages=2) -> List[str]:
    """Fresh pools per chain -> ['<addr>:<netId>', ...]
    Costs one GeckoTerminal slot per chain per page, so keep pages small."""
    ids, seen = [], set()
    for net in nets:
        for page in range(1, pages + 1):
            try:
                r = requests.get(
                    f"{GT}/networks/{net}/new_pools",
                    params={"page": page},
                    timeout=20,
                ).json()
            except Exception as e:
                logger.warning(f"universe fetch failed for {net} page {page}: {e}")
                break
            for pool in r.get("data", []):
                base = (pool.get("relationships") or {}).get("base_token") or {}
                gid = (base.get("data") or {}).get("id")  # 'solana_<addr>'
                if not gid:
                    continue
                addr = gid.split("_", 1)[1]
                tid = f"{addr}:{FOMO_NET[net]}"
                if tid not in seen:
                    seen.add(tid)
                    ids.append(tid)
    logger.info(f"universe: found {len(ids)} fresh pools")
    return ids


def normalise(tid: str, m: dict) -> dict:
    """FOMO's field names become the desk's field names, once, here.
    Every file downstream reads these names and only these."""
    addr, net = tid.split(":")
    return {
        "addr": addr,
        "net": int(net),
        "tid": tid,
        "ticker": m.get("symbol", "?"),
        "mcap_usd": m.get("mcap"),
        "liquidity_usd": m.get("liq"),
        "volume_h24": m.get("vol24"),
        "price_usd": m.get("price"),
        "holder_count": m.get("holders"),
        "change": {
            "5m": m.get("change", {}).get(300),
            "1h": m.get("change", {}).get(3600),
            "4h": m.get("change", {}).get(14400),
            "24h": m.get("change", {}).get(86400),
        },
        "age_minutes": age_minutes(m.get("created")),
    }


def shortlist(fomo_tokens: Dict[str, dict]) -> List[dict]:
    """Pass one over everything FOMO knows. No network beyond FOMO itself."""
    out = []
    for tid, m in fomo_tokens.items():
        t = normalise(tid, m)
        if t["net"] in GT_NET:
            out.append(t)
    # turnover ranks the queue. It orders work, it does not decide anything
    out.sort(
        key=lambda t: t["volume_h24"] / max(t["mcap_usd"], 1) if t["volume_h24"] and t["mcap_usd"] else 0,
        reverse=True,
    )
    logger.info(f"shortlist: {len(out)} tokens after FOMO filters")
    return out


def trade_counts(t: dict) -> dict:
    """buys and sells per window. FOMO does not return them, DexScreener does.
    Called ONLY for tokens that already cleared the free checks. One per token."""
    try:
        pairs = (
            requests.get(f"{DEX}/{t['addr']}", timeout=20).json().get("pairs") or []
        )
    except Exception as e:
        logger.warning(f"trade_counts failed for {t['ticker']}: {e}")
        return {"buys_h1": None, "sells_h1": None, "trades_h24": None}

    if not pairs:
        return {"buys_h1": None, "sells_h1": None, "trades_h24": None}

    x = max(pairs, key=lambda p: (p.get("liquidity") or {}).get("usd") or 0)["txns"]
    return {
        "buys_h1": x["h1"]["buys"],
        "sells_h1": x["h1"]["sells"],
        "buys_h6": x["h6"]["buys"],
        "sells_h6": x["h6"]["sells"],
        "trades_h24": x["h24"]["buys"] + x["h24"]["sells"],
    }


def dossier(t: dict) -> dict:
    """One GT call per token. Fills what the chain actually has, null where it does not."""
    net = GT_NET[t["net"]]
    try:
        a = (
            requests.get(
                f"{GT}/networks/{net}/tokens/{t['addr']}/info", timeout=20
            )
            .json()
            .get("data", {})
            .get("attributes", {})
        )
    except Exception as e:
        logger.error(f"dossier failed for {t['ticker']}: {e}")
        raise

    d = {
        **t,
        "chain": net,
        "holder_count": (a.get("holders") or {}).get("count") or t["holder_count"],
        "top_10_percent": ((a.get("holders") or {}).get("distribution_percentage") or {}).get("top_10"),
        "developer_holding_percentage": a.get("developer_holding_percentage"),
        "gt_score_details": a.get("gt_score_details"),
        "is_honeypot": a.get("is_honeypot"),
        "mint_authority": a.get("mint_authority"),
        "freeze_authority": a.get("freeze_authority"),
        "description": a.get("description"),
        "x_handle": clean_handle(a.get("twitter_handle")),
    }

    # Solana only: exact top wallet share, free, off the public RPC
    if t["net"] == 1399811149:
        d["top_wallet_percent"] = sol_top_wallet(t["addr"])

    return d


def clean_handle(h: Optional[str]) -> Optional[str]:
    """GT returned 'LuffyX100X/status/2102659581109272876' on a Robinhood token.
    Take the first path segment, or treat the account as missing."""
    if not h:
        return None
    h = h.strip().lstrip("@").split("?")[0].split("/")[0]
    return h if h and h.replace("_", "").isalnum() and len(h) <= 15 else None


def sol_top_wallet(mint: str) -> Optional[float]:
    """Get top wallet percentage on Solana"""
    try:
        rpc = "https://api.mainnet-beta.solana.com"
        q = lambda m, p: requests.post(
            rpc,
            json={
                "jsonrpc": "2.0",
                "id": 1,
                "method": m,
                "params": p,
            },
            timeout=20,
        ).json()["result"]

        supply = float(q("getTokenSupply", [mint])["value"]["amount"])
        top = q("getTokenLargestAccounts", [mint])["value"]
        return float(top[0]["amount"]) / supply if supply and top else None
    except Exception as e:
        logger.warning(f"sol_top_wallet failed for {mint}: {e}")
        return None


def social_state(d: dict) -> dict:
    """What SOCIAL hands the judge. The X block is filled by the bot's X plugin."""
    return {
        "x_account": d.get("x_account"),  # collected by SOCIAL, not here
        "token": {
            "ticker": d["ticker"],
            "narrative": d.get("description"),
        },
    }
