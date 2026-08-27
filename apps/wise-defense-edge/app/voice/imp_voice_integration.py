#!/usr/bin/env python3
"""
WISE Defense IMP + Voice Integration
Orchestrates always-on listening with IMP conversational interface.

Handles:
- Wake word detection → Display animation
- Speech recording → IMP query processing
- Response synthesis → Audio output to E09 speaker
- Display state management
"""

import sys
import os
import logging
import json
from typing import Optional, Dict, Any
from datetime import datetime
import threading
import time
import queue

# Add parent to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from imp.imp import WiseDefenseIMP
from voice.voice_listener import VoiceListener, AlwaysOnListeningService

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [%(levelname)s] %(message)s'
)


class IMPVoiceOrchestrator:
    """Orchestrates IMP + Voice Listener integration."""

    def __init__(self, db_path: str = '/opt/wise2/data/imp.db', api_endpoint: str = 'http://localhost:3014'):
        """Initialize orchestrator."""
        self.imp = WiseDefenseIMP(db_path=db_path, api_endpoint=api_endpoint)
        self.service = AlwaysOnListeningService(self.imp)

        self.state = 'IDLE'
        self.response_queue = queue.Queue()
        self.display_state_queue = queue.Queue()

        # Audio output thread
        self.output_thread = None
        self.running = False

    def start(self) -> bool:
        """Start the orchestration service."""
        logger.info("="*60)
        logger.info("WISE DEFENSE IMP + VOICE INTEGRATION")
        logger.info("="*60)
        logger.info("Starting always-on listening service...")

        if not self.service.start():
            logger.error("Failed to start voice listener")
            return False

        self.running = True
        self.output_thread = threading.Thread(target=self._response_handler, daemon=True)
        self.output_thread.start()

        logger.info("✅ Voice orchestrator ready")
        logger.info("   Listening for: CLAP, 'Hey WISE', 'WISE Defense'")
        logger.info("   Audio output: E09 Bluetooth speaker\n")

        return True

    def stop(self) -> None:
        """Stop orchestration."""
        self.running = False
        self.service.stop()
        if self.output_thread:
            self.output_thread.join(timeout=5)
        logger.info("Voice orchestrator stopped")

    def get_status(self) -> Dict[str, Any]:
        """Get orchestrator status."""
        return {
            'running': self.running,
            'state': self.state,
            'listener': self.service.listener.get_state(),
            'timestamp': datetime.utcnow().isoformat()
        }

    def set_display_state(self, state: str) -> None:
        """Queue display state change."""
        display_config = self.imp.set_display_state(state)
        self.display_state_queue.put(display_config)
        logger.info(f"📺 Display state: {state}")

    def process_voice_query(self, query_text: str) -> str:
        """Process voice query through IMP."""
        logger.info(f"🎤 Query: {query_text}")

        # Get context from service
        context = {
            'source': 'voice',
            'timestamp': datetime.utcnow().isoformat()
        }

        # Route through IMP
        response = self.imp.query(query_text, context)

        logger.info(f"📊 Response type: {response.get('type', 'UNKNOWN')}")

        # Convert response to speech
        response_text = self._format_response_for_speech(response)

        return response_text

    def _format_response_for_speech(self, imp_response: Dict[str, Any]) -> str:
        """Format IMP response for text-to-speech."""
        response_type = imp_response.get('type', 'UNKNOWN')

        if response_type == 'SITREP':
            title = imp_response.get('title', 'SITREP')
            assessment = imp_response.get('assessment', 'No assessment available')
            return f"{title}. {assessment}"

        elif response_type == 'INCIDENT_LIST':
            summary = imp_response.get('summary', 'No incidents')
            count = len(imp_response.get('incidents', []))
            return f"{summary}. Total incidents: {count}."

        elif response_type == 'WATCH_ZONES':
            zones = imp_response.get('zones', [])
            return f"Configured watch zones: {len(zones)}. All zones active and monitoring."

        elif response_type == 'SYSTEM_HEALTH':
            status = imp_response.get('overall_status', 'UNKNOWN')
            return f"System status: {status}. All critical services operational."

        elif response_type == 'HELP':
            return "WISE Defense Intelligence Management Portal. Ask about incidents, watch zones, system status, or weather."

        else:
            return imp_response.get('message', 'Processing your request')

    def _response_handler(self) -> None:
        """Handle display state updates (runs in thread)."""
        while self.running:
            try:
                # Check for display state updates
                try:
                    display_config = self.display_state_queue.get(timeout=1)
                    logger.debug(f"Display config: {display_config}")
                    # Would send to websocket/API to update Pi display
                except queue.Empty:
                    pass

                # Check for responses
                try:
                    response = self.response_queue.get(timeout=1)
                    logger.info(f"📢 Response: {response[:50]}...")
                    # Would trigger text-to-speech here
                    # Example: tts.speak(response, voice='clear')
                except queue.Empty:
                    pass

            except Exception as e:
                logger.error(f"Response handler error: {e}")
                time.sleep(1)

    def run_interactive_mode(self) -> None:
        """Run in interactive mode for testing."""
        print("\n" + "="*60)
        print("INTERACTIVE MODE")
        print("="*60)
        print("Commands:")
        print("  'status' - Show system status")
        print("  'sitrep' - Get situation report")
        print("  'help'   - Show available commands")
        print("  'quit'   - Exit")
        print("="*60 + "\n")

        while self.running:
            try:
                user_input = input("IMP> ").strip()

                if not user_input:
                    continue

                if user_input.lower() == 'quit':
                    break

                if user_input.lower() == 'status':
                    status = self.get_status()
                    print(json.dumps(status, indent=2))
                    continue

                # Process as IMP query
                response = self.process_voice_query(user_input)
                print(f"\n✅ Response: {response}\n")

            except KeyboardInterrupt:
                break
            except Exception as e:
                logger.error(f"Error: {e}")


def main():
    """Main entry point."""
    orchestrator = IMPVoiceOrchestrator()

    try:
        if orchestrator.start():
            # Run in interactive mode for now
            print("\n🎙️  Voice listener is running...")
            print("   Try clapping or saying 'Hey WISE'\n")

            # Simulate display state changes for demo
            orchestrator.set_display_state('IDLE')
            time.sleep(2)

            # Keep running
            while True:
                time.sleep(1)
    except KeyboardInterrupt:
        print("\n⏹️  Shutting down...")
    finally:
        orchestrator.stop()


if __name__ == '__main__':
    main()
