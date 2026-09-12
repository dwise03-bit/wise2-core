"""
State Manager
Maintains bridge state, action history, offline queue
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from collections import deque
import json

logger = logging.getLogger(__name__)


class StateManager:
    """
    Manages bridge state and action history
    Supports offline queue for reliability
    """

    def __init__(self, max_history: int = 1000, max_queue: int = 100):
        self.state: Dict[str, Any] = {
            "started_at": datetime.now().isoformat(),
            "midi_connected": False,
            "current_mode": "normal",
            "reaper_connected": False,
            "ai_jobs_active": 0,
            "last_action": None,
        }
        self.action_history: deque = deque(maxlen=max_history)
        self.offline_queue: deque = deque(maxlen=max_queue)
        self.max_history = max_history
        self.max_queue = max_queue

    async def set_state(self, key: str, value: Any) -> None:
        """Set a state value"""
        self.state[key] = value
        logger.debug(f"State: {key} = {value}")

    async def get_state(self, key: str) -> Optional[Any]:
        """Get a state value"""
        return self.state.get(key)

    async def append_action_log(self, action: str, context: Dict[str, Any]) -> None:
        """Log an action to history"""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "action": action,
            "context": context,
        }
        self.action_history.append(entry)
        self.state["last_action"] = action
        logger.debug(f"Action logged: {action}")

    async def queue_offline_action(self, action: str, context: Dict[str, Any]) -> None:
        """
        Queue action for later sync when VPS is available
        Maximum 100 actions (per brief)
        """
        entry = {
            "timestamp": datetime.now().isoformat(),
            "action": action,
            "context": context,
            "synced": False,
        }
        self.offline_queue.append(entry)
        logger.info(f"Queued offline action: {action} (queue size: {len(self.offline_queue)})")

    async def get_pending_offline_actions(self) -> List[Dict[str, Any]]:
        """Get actions pending sync"""
        return [a for a in self.offline_queue if not a.get("synced")]

    async def mark_action_synced(self, timestamp: str) -> None:
        """Mark action as synced to VPS"""
        for action in self.offline_queue:
            if action["timestamp"] == timestamp:
                action["synced"] = True
                break

    async def clear_synced_actions(self) -> None:
        """Remove synced actions from queue"""
        # Create new deque without synced items
        new_queue = deque(
            (a for a in self.offline_queue if not a.get("synced")),
            maxlen=self.max_queue
        )
        self.offline_queue = new_queue

    async def get_snapshot(self) -> Dict[str, Any]:
        """Get complete state snapshot"""
        return {
            "state": self.state,
            "action_history_size": len(self.action_history),
            "recent_actions": list(self.action_history)[-10:],
            "offline_queue_size": len(self.offline_queue),
            "pending_offline_count": len(await self.get_pending_offline_actions()),
        }

    def export_history_json(self, filename: str = "/tmp/wise2-sound-labs-history.json") -> bool:
        """Export action history to JSON file"""
        try:
            with open(filename, "w") as f:
                json.dump(list(self.action_history), f, indent=2)
            logger.info(f"History exported to {filename}")
            return True
        except Exception as e:
            logger.error(f"Export error: {e}")
            return False

    def get_stats(self) -> Dict[str, Any]:
        """Get statistics about state and actions"""
        # Count actions by type
        action_counts: Dict[str, int] = {}
        for entry in self.action_history:
            action = entry["action"].split(":")[0]
            action_counts[action] = action_counts.get(action, 0) + 1

        return {
            "total_actions": len(self.action_history),
            "action_counts": action_counts,
            "offline_queue_size": len(self.offline_queue),
            "state_keys": len(self.state),
        }
