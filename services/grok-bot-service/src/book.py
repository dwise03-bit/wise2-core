"""
BOOK - Position & Rejection Tracking
Two things the desk has to remember between cycles:
1. One position at a time
2. A rejected token stays rejected for a while
"""

import sqlite3
import time
import logging
import os
from typing import Optional, Dict

logger = logging.getLogger("book")

DB_PATH = os.environ.get("BOOK_DB_PATH", "desk.db")
DB = sqlite3.connect(DB_PATH, check_same_thread=False)

DB.executescript(
    """
CREATE TABLE IF NOT EXISTS position(
  id INTEGER PRIMARY KEY CHECK (id = 1),
  ticker TEXT, addr TEXT, net INT, opened_at REAL);
CREATE TABLE IF NOT EXISTS bench(
  tid TEXT PRIMARY KEY, reason TEXT, until REAL);
"""
)

# How long a rejection stands, by what fired it
from thresholds import BENCH_MINUTES, DEFAULT_BENCH


def held() -> Optional[Dict]:
    """Get currently held position, if any"""
    r = DB.execute("SELECT ticker, opened_at FROM position WHERE id=1").fetchone()
    return (
        {"ticker": r[0], "minutes": (time.time() - r[1]) / 60}
        if r
        else None
    )


def take(order: dict):
    """Take a position after a pick succeeds"""
    t = order["token"]
    DB.execute(
        "INSERT OR REPLACE INTO position VALUES (1,?,?,?,?)",
        (t["ticker"], t["address"], t["network_id"], time.time()),
    )
    DB.commit()
    logger.info(f"position taken: {t['ticker']} on {t['chain']}")


def release():
    """RISK calls this the moment a close is filled. Nothing else calls it."""
    DB.execute("DELETE FROM position")
    DB.commit()
    logger.info("position released")


def benched(tid: str) -> bool:
    """Check if a token is still benched"""
    r = DB.execute("SELECT until FROM bench WHERE tid=?", (tid,)).fetchone()
    return bool(r and r[0] > time.time())


def sit(tid: str, reason: str):
    """Bench a token after it's rejected"""
    mins = BENCH_MINUTES.get(reason, DEFAULT_BENCH)
    DB.execute(
        "INSERT OR REPLACE INTO bench VALUES (?,?,?)",
        (tid, reason, time.time() + mins * 60),
    )
    DB.commit()
    logger.info(f"benched {tid} for {reason} ({mins} min)")
