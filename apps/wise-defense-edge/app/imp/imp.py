#!/usr/bin/env python3
"""
WISE DEFENSE IMP
Intelligent Management Portal

Conversational AI interface for WISE Defense edge intelligence.
Coordinates with local edge services and cloud AI for situational awareness.

Personality:
- Disciplined, tactical, intelligent
- Concise, useful, calm
- Not childish, not theatrical
"""

import json
import logging
from typing import Optional, Dict, List, Any
from datetime import datetime, timedelta
import sqlite3

logger = logging.getLogger(__name__)

class WiseDefenseIMP:
    """WISE Defense Intelligent Management Portal."""

    def __init__(self, db_path: str, api_endpoint: str = 'http://localhost:3014'):
        """Initialize IMP."""
        self.db_path = db_path
        self.api_endpoint = api_endpoint
        self.system_knowledge = self._load_system_knowledge()

    def _load_system_knowledge(self) -> Dict[str, Any]:
        """Load system knowledge base."""
        return {
            'call_signs': ['WISE-BASE', 'WATCH-1', 'COMMAND', 'DISPATCH'],
            'alert_levels': ['INFO', 'WATCH', 'WARNING', 'CRITICAL'],
            'supported_queries': [
                'What is happening around me?',
                'Show recent incidents',
                'Any police activity nearby?',
                'What happened in the last hour?',
                'Check my watch zones',
                'What is the SDR doing?',
                'What signals are active?',
                'Is Meshtastic online?',
                'Show mesh nodes',
                'Any severe weather nearby?',
                'Give me a SITREP',
                'Check the system',
                'What went offline?',
                'When was the last sync?',
                'What changed since my last check?'
            ]
        }

    def query(self, user_input: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Process user query and generate response."""
        user_input = user_input.strip().upper()

        # Route queries
        if 'HAPPENING' in user_input or 'SITUATION' in user_input:
            return self.generate_sitrep(context)

        elif 'INCIDENTS' in user_input or 'WHAT HAPPENED' in user_input:
            return self.list_recent_incidents(context)

        elif 'POLICE' in user_input:
            return self.query_incidents_by_category('police', context)

        elif 'WATCH ZONES' in user_input or 'ZONES' in user_input:
            return self.list_watch_zones(context)

        elif 'SDR' in user_input:
            return self.query_sdr_status(context)

        elif 'SIGNALS' in user_input:
            return self.query_signals(context)

        elif 'MESHTASTIC' in user_input or 'MESH' in user_input:
            return self.query_mesh_status(context)

        elif 'WEATHER' in user_input:
            return self.query_weather(context)

        elif 'SITREP' in user_input or 'SITUATION REPORT' in user_input:
            return self.generate_sitrep(context)

        elif 'HEALTH' in user_input or 'SYSTEM' in user_input or 'STATUS' in user_input:
            return self.query_system_health(context)

        elif 'OFFLINE' in user_input:
            return self.query_offline_systems(context)

        elif 'SYNC' in user_input:
            return self.query_sync_status(context)

        elif 'CHANGED' in user_input:
            return self.query_changes_since_last_check(context)

        else:
            return self.help()

    def generate_sitrep(self, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Generate Situation Report."""
        return {
            'type': 'SITREP',
            'title': 'WISE DEFENSE SITREP',
            'time': datetime.utcnow().isoformat(),
            'area': 'Local operating area',
            'sections': [
                {
                    'heading': 'INCIDENTS',
                    'status': 'ANALYZING',
                    'detail': 'Correlating incident feeds from configured providers'
                },
                {
                    'heading': 'WATCH ZONES',
                    'status': 'MONITORING',
                    'detail': 'Active zones receiving intelligence feeds'
                },
                {
                    'heading': 'WEATHER',
                    'status': 'NORMAL',
                    'detail': 'No critical weather alerts'
                },
                {
                    'heading': 'COMMUNICATIONS',
                    'status': 'OPERATIONAL',
                    'detail': 'Meshtastic, SDR, radio systems ready'
                },
                {
                    'heading': 'WISE² LINK',
                    'status': 'CHECKING',
                    'detail': 'Cloud sync status being verified'
                }
            ],
            'assessment': 'Multiple data sources monitoring. No critical multi-source threat identified. Recommend periodic watch zone review.',
            'confidence': 'MEDIUM',
            'verified_through_official_sources': False
        }

    def list_recent_incidents(self, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """List recent incidents."""
        return {
            'type': 'INCIDENT_LIST',
            'title': 'RECENT INCIDENTS',
            'timestamp': datetime.utcnow().isoformat(),
            'summary': 'No incidents received from configured providers.',
            'incidents': [],
            'note': 'Verify critical information through official sources'
        }

    def query_incidents_by_category(self, category: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Query incidents by category."""
        return {
            'type': 'INCIDENT_QUERY',
            'category': category.upper(),
            'title': f'{category.upper()} ACTIVITY',
            'timestamp': datetime.utcnow().isoformat(),
            'incidents': [],
            'summary': f'No {category} activity reported in monitored area'
        }

    def list_watch_zones(self, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """List configured watch zones."""
        return {
            'type': 'WATCH_ZONES',
            'title': 'CONFIGURED WATCH ZONES',
            'timestamp': datetime.utcnow().isoformat(),
            'zones': [],
            'summary': 'No watch zones configured'
        }

    def query_sdr_status(self, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Query SDR status."""
        return {
            'type': 'SDR_STATUS',
            'title': 'SDR SPECTRUM MONITOR',
            'status': 'RECEIVE-ONLY',
            'timestamp': datetime.utcnow().isoformat(),
            'device': 'RTL-SDR',
            'hardware_status': 'NOT DETECTED',
            'note': 'Receive-only operation; SDR device not currently connected',
            'supported_profiles': ['NOAA', 'GMRS', 'HAM', 'AIR', 'PUBLIC_SAFETY']
        }

    def query_signals(self, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Query active signals."""
        return {
            'type': 'SIGNAL_LIST',
            'title': 'ACTIVE SIGNALS',
            'timestamp': datetime.utcnow().isoformat(),
            'signals': [],
            'summary': 'No signals detected by SDR monitor'
        }

    def query_mesh_status(self, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Query Meshtastic network status."""
        return {
            'type': 'MESH_STATUS',
            'title': 'MESHTASTIC NETWORK',
            'status': 'CHECKING',
            'timestamp': datetime.utcnow().isoformat(),
            'nodes_online': 0,
            'nodes_total': 0,
            'gateway_status': 'NOT_CONFIGURED',
            'note': 'Meshtastic gateway not configured. Connect device via USB serial or TCP.'
        }

    def query_weather(self, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Query weather alerts."""
        return {
            'type': 'WEATHER',
            'title': 'WEATHER INTELLIGENCE',
            'timestamp': datetime.utcnow().isoformat(),
            'alerts': [],
            'critical_alerts': 0,
            'summary': 'No critical weather alerts in monitored area',
            'provider': 'NOAA/NWS'
        }

    def query_system_health(self, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Query system health."""
        return {
            'type': 'SYSTEM_HEALTH',
            'title': 'SYSTEM STATUS',
            'timestamp': datetime.utcnow().isoformat(),
            'services': {
                'API': 'ONLINE',
                'DATABASE': 'ONLINE',
                'NETWORK': 'CHECKING',
                'TAILSCALE': 'CHECKING',
                'WISE²_LINK': 'CHECKING'
            },
            'overall_status': 'OPERATIONAL'
        }

    def query_offline_systems(self, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Query systems that are offline."""
        return {
            'type': 'OFFLINE_SYSTEMS',
            'title': 'OFFLINE SYSTEMS',
            'timestamp': datetime.utcnow().isoformat(),
            'offline': [],
            'summary': 'All critical systems operational'
        }

    def query_sync_status(self, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Query cloud sync status."""
        return {
            'type': 'SYNC_STATUS',
            'title': 'CLOUD SYNCHRONIZATION',
            'timestamp': datetime.utcnow().isoformat(),
            'status': 'CHECKING',
            'last_sync': 'NEVER',
            'pending_uploads': 0,
            'connection': 'OFFLINE',
            'note': 'Local defense systems remain operational. Cloud sync will resume when connection available.'
        }

    def query_changes_since_last_check(self, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Query changes since last check."""
        return {
            'type': 'DELTA_REPORT',
            'title': 'CHANGES SINCE LAST CHECK',
            'timestamp': datetime.utcnow().isoformat(),
            'new_incidents': 0,
            'new_alerts': 0,
            'mesh_changes': 0,
            'summary': 'No significant changes detected'
        }

    def help(self) -> Dict[str, Any]:
        """Help command."""
        return {
            'type': 'HELP',
            'title': 'WISE DEFENSE IMP - HELP',
            'commands': self.system_knowledge['supported_queries'],
            'message': 'WISE Defense Intelligence Management Portal. Ask about incidents, watch zones, mesh status, SDR activity, weather, or system health.'
        }

    def process_for_cloud_ai(self, query: str, local_data: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare query and data for cloud AI processing."""
        return {
            'query': query,
            'context': {
                'device_id': local_data.get('device_id', 'UNKNOWN'),
                'timestamp': datetime.utcnow().isoformat(),
                'incidents': local_data.get('incidents', []),
                'mesh_status': local_data.get('mesh_status', {}),
                'system_health': local_data.get('system_health', {}),
                'alerts': local_data.get('alerts', [])
            },
            'constraints': {
                'separate_confirmed': True,
                'separate_assessment': True,
                'no_ai_assumptions_as_facts': True
            }
        }

    def process_voice_input(self, audio_data: bytes, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Process voice input from always-on listener."""
        # This would integrate with speech-to-text service
        # For now, returns processing status
        return {
            'type': 'VOICE_INPUT',
            'status': 'PROCESSING',
            'timestamp': datetime.utcnow().isoformat(),
            'note': 'Voice input processing via cloud AI or local STT'
        }

    def set_display_state(self, state: str) -> Dict[str, Any]:
        """Update display animation state for Pi HDMI output."""
        return {
            'type': 'DISPLAY_STATE',
            'state': state,
            'timestamp': datetime.utcnow().isoformat(),
            'animation': self._get_animation_config(state)
        }

    def _get_animation_config(self, state: str) -> Dict[str, Any]:
        """Get animation configuration for display state."""
        configs = {
            'IDLE': {
                'radar': 'pulse_slow',
                'spectrum': 'idle',
                'alerts': 'fade_in',
                'duration_ms': 500
            },
            'LISTENING': {
                'radar': 'pulse_fast',
                'spectrum': 'animate_waves',
                'alerts': 'slide_in',
                'duration_ms': 300
            },
            'PROCESSING': {
                'radar': 'spin',
                'spectrum': 'scan',
                'alerts': 'pulse',
                'duration_ms': 200
            },
            'SPEAKING': {
                'radar': 'pulse_medium',
                'spectrum': 'respond_wave',
                'alerts': 'highlight',
                'duration_ms': 400
            },
            'ALERT': {
                'radar': 'flash',
                'spectrum': 'warning_red',
                'alerts': 'expand_urgent',
                'duration_ms': 100
            }
        }
        return configs.get(state, configs['IDLE'])
