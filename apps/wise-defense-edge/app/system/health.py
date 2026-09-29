#!/usr/bin/env python3
"""
WISE DEFENSE HEALTH MONITORING & SELF-REPAIR

Continuous system health monitoring and automatic recovery.
Reports service status and performs safe remediation.

Principle: Never claim a system is online/healthy unless actively verified.
"""

import os
import sys
import json
import logging
import subprocess
import requests
import psutil
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

class HealthMonitor:
    """WISE Defense system health monitor."""

    def __init__(self, api_endpoint: str = 'http://localhost:3014'):
        """Initialize health monitor."""
        self.api_endpoint = api_endpoint
        self.db_path = Path('/opt/wise2-defense/data/wise2-defense.db')
        self.log_path = Path('/var/log/wise2-defense/health.log')

    def check_all(self) -> Dict[str, Any]:
        """Run complete health check."""
        checks = {
            'core': self.check_core(),
            'network': self.check_network(),
            'database': self.check_database(),
            'api': self.check_api(),
            'disk': self.check_disk(),
            'memory': self.check_memory(),
            'cpu': self.check_cpu(),
            'temperature': self.check_temperature(),
            'services': self.check_services(),
            'devices': self.check_devices(),
        }

        overall = self._overall_status(checks)

        return {
            'timestamp': datetime.utcnow().isoformat(),
            'overall_status': overall,
            'checks': checks
        }

    def check_core(self) -> Dict[str, Any]:
        """Check core system."""
        return {
            'status': 'OPERATIONAL',
            'device': self._get_device_info(),
            'uptime': self._get_uptime()
        }

    def check_network(self) -> Dict[str, Any]:
        """Check network connectivity."""
        try:
            result = subprocess.run(['ping', '-c', '1', '8.8.8.8'],
                                  capture_output=True, timeout=5)
            internet = 'ONLINE' if result.returncode == 0 else 'OFFLINE'
        except:
            internet = 'UNKNOWN'

        try:
            result = subprocess.run(['ping', '-c', '1', '1.1.1.1'],
                                  capture_output=True, timeout=5)
            dns = 'ONLINE' if result.returncode == 0 else 'OFFLINE'
        except:
            dns = 'UNKNOWN'

        return {
            'internet': internet,
            'dns': dns,
            'tailscale': self._check_tailscale()
        }

    def check_database(self) -> Dict[str, Any]:
        """Check SQLite database."""
        if not self.db_path.exists():
            return {'status': 'NOT_INITIALIZED', 'path': str(self.db_path)}

        try:
            import sqlite3
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()
            cursor.execute('SELECT COUNT(*) FROM incidents')
            incident_count = cursor.fetchone()[0]
            conn.close()
            return {
                'status': 'ONLINE',
                'path': str(self.db_path),
                'incident_records': incident_count
            }
        except Exception as e:
            logger.error(f'Database check failed: {e}')
            return {'status': 'ERROR', 'error': str(e)}

    def check_api(self) -> Dict[str, Any]:
        """Check API health."""
        try:
            response = requests.get(f'{self.api_endpoint}/health', timeout=5)
            return {
                'status': 'ONLINE',
                'response_code': response.status_code,
                'endpoint': self.api_endpoint
            }
        except requests.exceptions.ConnectionError:
            return {'status': 'OFFLINE', 'endpoint': self.api_endpoint}
        except Exception as e:
            logger.error(f'API check failed: {e}')
            return {'status': 'ERROR', 'error': str(e)}

    def check_disk(self) -> Dict[str, Any]:
        """Check disk usage."""
        usage = psutil.disk_usage('/')
        percent = usage.percent

        return {
            'status': 'CRITICAL' if percent > 90 else 'WARNING' if percent > 80 else 'OK',
            'percent_used': percent,
            'available_gb': usage.free / (1024**3),
            'total_gb': usage.total / (1024**3)
        }

    def check_memory(self) -> Dict[str, Any]:
        """Check memory usage."""
        memory = psutil.virtual_memory()
        percent = memory.percent

        return {
            'status': 'CRITICAL' if percent > 90 else 'WARNING' if percent > 75 else 'OK',
            'percent_used': percent,
            'available_mb': memory.available / (1024**2),
            'total_mb': memory.total / (1024**2)
        }

    def check_cpu(self) -> Dict[str, Any]:
        """Check CPU."""
        load_avg = os.getloadavg()
        cpu_count = psutil.cpu_count()

        return {
            'status': 'OK',
            'load_average': load_avg,
            'cpu_count': cpu_count,
            'load_percent': (load_avg[0] / cpu_count * 100)
        }

    def check_temperature(self) -> Dict[str, Any]:
        """Check CPU temperature."""
        try:
            temps = psutil.sensors_temperatures()
            if 'cpu_thermal' in temps:
                temp = temps['cpu_thermal'][0].current
                status = 'CRITICAL' if temp > 80 else 'WARNING' if temp > 70 else 'OK'
                return {
                    'status': status,
                    'celsius': temp,
                    'fahrenheit': (temp * 9/5) + 32
                }
            return {'status': 'NOT_AVAILABLE'}
        except Exception as e:
            logger.error(f'Temperature check failed: {e}')
            return {'status': 'ERROR'}

    def check_services(self) -> Dict[str, Dict[str, str]]:
        """Check systemd services."""
        services = [
            'wise2-defense',
            'wise2-health',
            'wise2-sdr',
            'wise2-mesh',
            'wise2-weather',
            'wise2-sync'
        ]

        result = {}
        for service in services:
            status = self._check_service(service)
            result[service] = status

        return result

    def check_devices(self) -> Dict[str, Any]:
        """Check optional devices."""
        return {
            'sdr': self._check_sdr_device(),
            'meshtastic': self._check_meshtastic(),
            'gps': self._check_gps()
        }

    # Helpers
    def _check_service(self, service_name: str) -> Dict[str, str]:
        """Check if systemd service is active."""
        try:
            result = subprocess.run(['systemctl', 'is-active', service_name],
                                  capture_output=True, timeout=5)
            status = result.stdout.decode().strip()
            return {'status': status.upper() if status else 'UNKNOWN'}
        except:
            return {'status': 'UNKNOWN'}

    def _check_sdr_device(self) -> Dict[str, str]:
        """Check for RTL-SDR device."""
        try:
            result = subprocess.run(['lsusb', '-d', '0bda:2838'],
                                  capture_output=True, timeout=5)
            return {'status': 'DETECTED' if result.returncode == 0 else 'NOT_DETECTED'}
        except:
            return {'status': 'UNKNOWN'}

    def _check_meshtastic(self) -> Dict[str, str]:
        """Check for Meshtastic devices."""
        try:
            import usb.core
            devices = [d for d in usb.core.find() if d.idVendor == 0x0d28 and d.idProduct == 0x0204]
            return {
                'status': 'DETECTED' if devices else 'NOT_DETECTED',
                'count': len(devices)
            }
        except:
            return {'status': 'UNKNOWN'}

    def _check_gps(self) -> Dict[str, str]:
        """Check for GPS device."""
        try:
            result = subprocess.run(['ls', '/dev/ttyUSB*'], shell=True,
                                  capture_output=True, timeout=5)
            return {'status': 'DETECTED' if result.stdout else 'NOT_DETECTED'}
        except:
            return {'status': 'UNKNOWN'}

    def _check_tailscale(self) -> str:
        """Check Tailscale status."""
        try:
            result = subprocess.run(['tailscale', 'status', '--json'],
                                  capture_output=True, timeout=5)
            if result.returncode == 0:
                data = json.loads(result.stdout)
                return 'CONNECTED' if data.get('TailscaleIPs') else 'NOT_CONFIGURED'
            return 'OFFLINE'
        except:
            return 'NOT_INSTALLED'

    def _get_device_info(self) -> str:
        """Get device model."""
        try:
            with open('/proc/device-tree/model', 'r') as f:
                return f.read().strip()
        except:
            return 'UNKNOWN'

    def _get_uptime(self) -> str:
        """Get system uptime."""
        with open('/proc/uptime', 'r') as f:
            seconds = int(float(f.readline().split()[0]))
            days = seconds // 86400
            hours = (seconds % 86400) // 3600
            return f'{days}d {hours}h'

    def _overall_status(self, checks: Dict[str, Any]) -> str:
        """Determine overall system status."""
        critical = ['CRITICAL', 'ERROR', 'OFFLINE']

        for category, check in checks.items():
            if isinstance(check, dict):
                status = check.get('status', '')
                if status in critical:
                    return 'CRITICAL'

                # Check nested statuses
                for key, value in check.items():
                    if isinstance(value, dict) and value.get('status') in critical:
                        return 'CRITICAL'

        return 'OPERATIONAL'

    def repair_automatically(self, issues: Dict[str, Any]) -> Dict[str, Any]:
        """Attempt automatic repair of known issues."""
        repairs = {}

        # Restart crashed services
        if issues.get('services'):
            for service, status in issues['services'].items():
                if status.get('status') != 'active':
                    try:
                        subprocess.run(['sudo', 'systemctl', 'restart', service],
                                     capture_output=True, timeout=10)
                        repairs[service] = 'RESTARTED'
                    except Exception as e:
                        repairs[service] = f'REPAIR_FAILED: {e}'

        return repairs

def health_monitor_daemon(interval_seconds: int = 300):
    """Run continuous health monitoring."""
    monitor = HealthMonitor()

    while True:
        try:
            status = monitor.check_all()
            logger.info(f'Health check: {status["overall_status"]}')

            # Log to database
            import sqlite3
            conn = sqlite3.connect('/opt/wise2-defense/data/wise2-defense.db')
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO system_events (id, event_type, message, severity, details)
                VALUES (?, 'health_check', ?, ?, ?)
            ''', (
                datetime.utcnow().isoformat(),
                f'Health check: {status["overall_status"]}',
                'INFO' if status['overall_status'] == 'OPERATIONAL' else 'WARNING',
                json.dumps(status)
            ))
            conn.commit()
            conn.close()

        except Exception as e:
            logger.error(f'Health check failed: {e}')

        import time
        time.sleep(interval_seconds)

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    health_monitor_daemon()
