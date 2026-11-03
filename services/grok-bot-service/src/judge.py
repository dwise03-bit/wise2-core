"""
JUDGE - TypeSafe/Jev Caller
Holds the only TypeSafe API key. Bots get a desk secret, never the key.
Runs on one machine, makes no trading decision of any kind.
"""

import os
import logging
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from typesafe_sdk import AsyncTypeSafeClient
from questions import SETS

logger = logging.getLogger("judge")

DESK_SECRET = os.environ.get("DESK_SECRET", "")
if not DESK_SECRET:
    raise RuntimeError("DESK_SECRET environment variable not set")

client = AsyncTypeSafeClient()  # reads TYPESAFE_API_KEY itself
app = FastAPI(title="Grok Bot Judge", version="1.0.0")


class Ask(BaseModel):
    question_set: str
    state: dict


@app.post("/judge")
async def judge(ask: Ask, authorization: str = Header("")):
    """Main judge endpoint - answers questions about token state"""
    if authorization != f"Bearer {DESK_SECRET}":
        raise HTTPException(401, "bad desk secret")
    if ask.question_set not in SETS:
        raise HTTPException(422, f"unknown question set {ask.question_set}")

    qs = SETS[ask.question_set]
    qs = qs(ask.state) if callable(qs) else qs

    try:
        r = await client.system_one(state=ask.state, questions=qs)
        logger.info(f"judge call: {ask.question_set}, model={r.model}, tokens={r.usage.input_tokens}")

        # raw answers out. never flattened, never thresholded here.
        return {
            "model": r.model,
            "answers": {k: v.model_dump() for k, v in r.answers.items()},
            "usage": r.usage.model_dump(),
        }
    except Exception as e:
        logger.error(f"judge error: {e}")
        raise HTTPException(500, f"judge error: {str(e)}")


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "service": "grok-bot-judge"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("JUDGE_PORT", 8080))
    host = os.environ.get("JUDGE_HOST", "0.0.0.0")
    logger.info(f"Starting judge on {host}:{port}")
    uvicorn.run(app, host=host, port=port)
