"""
QUESTIONS - Jev Question Sets
Every question the desk can ask lives here and nowhere else.
"""

from typesafe_sdk import Choice, Noul, Score

MARKET = {
    "shape": Choice(
        instructions="Classify the shape of this launch from the fields in `state`.",
        criteria={
            "crowd": "Holders growing faster than price. Buys outnumber sells across both "
            "recent windows. Volume spread rather than spiking once.",
            "one_buyer": "Price climbing faster than holders. Holder growth flat while "
            "price rises. One wallet walking the price up.",
            "fading": "Recent volume is a small fraction of the daily average, or sells "
            "outnumber buys in both recent windows.",
            "too_early": "Too few data points to tell any of the above apart yet.",
        },
    ),
    "liquidity_fits_ticket": Noul(
        instructions="A position of `intended_ticket_usd` could be exited into "
        "`liquidity_usd` without moving the price more than a few percent.",
    ),
    "momentum_already_spent": Noul(
        instructions="The move in `change` has already happened, so entering now means "
        "buying after the information is public.",
        criteria={
            "true": "The largest change sits in the older windows.",
            "false": "The recent windows carry the move.",
        },
    ),
}

CONCENTRATION = Noul(
    instructions="Holding this token means being exit liquidity, based on "
    "`top_10_percent`, `top_wallet_percent` and `holder_count`.",
    criteria={
        "true": "A few wallets can end the market by selling.",
        "false": "The float is spread widely enough to absorb a large holder.",
    },
)

DEV_LOADED = Noul(
    instructions="`developer_holding_percentage` is large enough that the creator "
    "selling would meaningfully move the price.",
)

CHAIN_SOLANA = {
    "authority_risk": Choice(
        instructions="Judge contract control risk from `mint_authority` and "
        "`freeze_authority`.",
        criteria={
            "renounced": "Both null. Supply cannot be inflated, balances cannot be frozen.",
            "mint_open": "mint_authority is set. Supply can be inflated at will.",
            "freeze_open": "freeze_authority is set. Balances can be frozen at will.",
            "both_open": "Both are set.",
        },
    ),
    "concentration_is_exit_risk": CONCENTRATION,
    "dev_still_loaded": DEV_LOADED,
}

CHAIN_BSC = {
    "sell_side_risk": Choice(
        instructions="Judge whether a position here can be sold, from `is_honeypot`, "
        "`gt_score_details` and the buy and sell counts.",
        criteria={
            "clean": "Not flagged, and sells are going through in the data.",
            "flagged": "Explicitly flagged as a honeypot.",
            "suspicious": "Not flagged, but sells are absent or vanishingly rare while "
            "buys are plentiful.",
            "unknown": "The honeypot field is missing or unknown and trade counts are "
            "too thin to stand in for it.",
        },
    ),
    "concentration_is_exit_risk": CONCENTRATION,
    "pool_quality": Score(
        instructions="Rate the pool from `gt_score_details` and `liquidity_usd`.",
        criteria=[
            "Thin and new. One withdrawal ends the market.",
            "Usable, but a large ticket would move it.",
            "Deep enough that normal desk size is invisible.",
        ],
    ),
}

CHAIN_ROBINHOOD = {
    "data_coverage": Choice(
        instructions="Judge how much of this token is visible, from which fields in "
        "`state` carry values and which are null or unknown.",
        criteria={
            "indexed": "Holder count and distribution present, honeypot field is a real answer.",
            "partial": "Holder count present from the venue, but distribution or the "
            "honeypot field is missing.",
            "dark": "Neither distribution nor honeypot available. Only price, volume and "
            "pool age are known.",
        },
    ),
    "sellable_by_evidence": Noul(
        instructions="Sells are going through on this token, judged from the buy and sell "
        "counts rather than from any honeypot flag.",
        criteria={
            "true": "Sells appear across recent windows in a normal ratio.",
            "false": "Buys with almost no sells, or no trades at all.",
        },
    ),
    "concentration_is_exit_risk": CONCENTRATION,
    "dev_still_loaded": DEV_LOADED,
}

SOCIAL = {
    "account_is_the_project": Noul(
        instructions="The account in `x_account` is the token's official account, not a "
        "fan account, an impersonator, or an unrelated similar name.",
        criteria={
            "true": "Handle matches the one published on chain and the content is about this token.",
            "false": "Similar name, different subject, or no link back.",
        },
    ),
    "audience_is_real": Noul(
        instructions="Engagement in `x_account` is consistent with its follower count, "
        "rather than a large follower number with almost no replies or reposts.",
    ),
    "recycled_account": Noul(
        instructions="`x_account` shows signs of being repurposed: far older than the "
        "token, with a handle or content history belonging to a different project.",
    ),
    "effort": Score(
        instructions="Rate how much work is visibly behind this project from `x_account`.",
        criteria=[
            "One post, one image, nothing else.",
            "A handful of posts, all promotional.",
            "Regular posting with substance beyond price.",
            "A visible team shipping visible things.",
        ],
    ),
}


def PICK(state):
    """Options built from the shortlist at call time. Choice takes up to 255."""
    return {
        "best": Choice(
            instructions="Choose the single token in `candidates` that is the best entry "
            "right now. Weigh crowd shape, contract risk, concentration and "
            "the project account together. Prefer a clean unspent setup over "
            "a larger move that already happened.",
            criteria={c["ticker"]: c["summary"] for c in state.get("candidates", [])},
        ),
        "worth_trading_at_all": Noul(
            instructions="At least one token in `candidates` is worth a position today, "
            "rather than all of them being mediocre.",
            criteria={
                "true": "At least one is a clean setup.",
                "false": "Every candidate has a disqualifying weakness.",
            },
        ),
    }


SETS = {
    "market": MARKET,
    "social": SOCIAL,
    "pick": PICK,
    "solana": CHAIN_SOLANA,
    "bsc": CHAIN_BSC,
    "robinhood": CHAIN_ROBINHOOD,
}
