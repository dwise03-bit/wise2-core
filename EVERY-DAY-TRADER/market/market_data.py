"""Validate provider snapshots before dashboard display."""
import json
from datetime import datetime
from pathlib import Path
def validate_snapshot(snapshot):
    if not isinstance(snapshot,dict): raise ValueError("Snapshot must be an object.")
    for key in ("provider","as_of","delay","symbols"):
        if not snapshot.get(key): raise ValueError("Missing snapshot field: "+key)
    if datetime.fromisoformat(str(snapshot["as_of"]).replace("Z","+00:00")).tzinfo is None: raise ValueError("as_of must include a timezone.")
    if not isinstance(snapshot["symbols"],list): raise ValueError("symbols must be a list.")
    for row in snapshot["symbols"]:
        if not isinstance(row,dict) or not row.get("symbol") or row.get("price") is None: raise ValueError("Each symbol needs symbol and price.")
    return snapshot
def load_snapshot(path):
    with Path(path).open(encoding="utf-8") as f: return validate_snapshot(json.load(f))
