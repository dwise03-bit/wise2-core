"""
THRESHOLDS - Trading Rules
Every number the desk uses lives here. When you retune, edit thresholds.py and nothing else.
"""

# Stage 2: Arithmetic, runs before anything costs money
HARD = {
    "min_age_minutes": 15,  # younger than this and the data is noise
    "max_age_hours": 72,  # older than this and it is not a launch any more
    "min_liquidity_usd": 12_000,
    "min_volume_h24": 40_000,
    "min_mcap_usd": 60_000,
    "max_mcap_usd": 8_000_000,
    "min_trades_h24": 150,
    "max_top_wallet": 0.05,  # solana only, exact, from RPC
    "max_top_10": 0.60,  # where distribution exists
    "min_holders": 80,
}

# Applied to Jev's answers, per token
SOFT = {
    "concentration_is_exit_risk": ("max", 0.55),
    "momentum_already_spent": ("max", 0.60),
    "liquidity_fits_ticket": ("min", 0.60),
    "account_is_the_project": ("min", 0.70),
    "recycled_account": ("max", 0.50),
    "audience_is_real": ("min", 0.45),
    "effort": ("min", 1.0),
    "dev_still_loaded": ("max", 0.55),
    "sellable_by_evidence": ("min", 0.60),  # robinhood
}

SHAPE_MIN_CROWD = 0.55  # probabilities["crowd"], not the winning label
PICK_MIN_WORTH = 0.60
PICK_MIN_CONF = 0.55
DARK_TICKET_CUT = 0.40  # robinhood, data_coverage == dark
NO_SOCIAL_CUT = 0.60  # no usable X handle: trade smaller, do not skip

# Bench times by rejection reason (in minutes)
BENCH_MINUTES = {
    # facts that will not change while this token exists
    "honeypot": 100_000,
    "authority_open": 100_000,
    "top_wallet": 100_000,
    "sell_side": 100_000,
    # slow to change
    "recycled_account": 360,
    "account_is_the_project": 360,
    # can change as the float moves
    "top_10": 90,
    "holders": 90,
    "dev_still_loaded": 90,
    "concentration_is_exit_risk": 90,
    # can change inside the hour, keep it short or you miss the token maturing
    "shape": 25,
    "shape_weak": 25,
    "momentum_already_spent": 25,
    "liquidity_fits_ticket": 25,
    "liquidity": 25,
    "volume": 25,
    "trades": 25,
    "mcap": 25,
    "age": 20,
}

DEFAULT_BENCH = 45
