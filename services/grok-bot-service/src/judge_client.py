"""
JUDGE CLIENT - Bot Interface
Six lines, and it is the only place a bot touches the network for a judgement.
"""

import os
import requests
import logging

logger = logging.getLogger("judge_client")

URL = os.environ.get("JUDGE_URL", "http://localhost:8080")
SECRET = os.environ.get("DESK_SECRET", "")

if not SECRET:
    raise RuntimeError("DESK_SECRET environment variable not set")


def judge(question_set: str, state: dict) -> dict:
    """Call the judge with a question set and state.
    Returns the raw answer from the judge service."""
    try:
        r = requests.post(
            f"{URL}/judge",
            timeout=30,
            headers={"Authorization": f"Bearer {SECRET}"},
            json={"question_set": question_set, "state": state},
        )

        if r.status_code == 422:
            raise RuntimeError(f"malformed question set {question_set}: {r.text}")

        r.raise_for_status()
        return r.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"judge call failed: {e}")
        raise


def judge_market(state: dict) -> dict:
    """Judge market conditions"""
    return judge("market", state)


def judge_chain(chain: str, state: dict) -> dict:
    """Judge chain-specific risk (solana, bsc, robinhood)"""
    return judge(chain, state)


def judge_social(state: dict) -> dict:
    """Judge social/project account"""
    return judge("social", state)


def judge_pick(state: dict) -> dict:
    """Judge which token to pick"""
    return judge("pick", state)
