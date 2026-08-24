#!/usr/bin/env python3
"""
RTL-SDR Spectrum Processor

Processes spectrum data from rtl_power and sends to WISE Defense API.
Runs as a background service, collecting spectrum snapshots every 10 seconds.

Usage:
    python3 sdr_processor.py [--api-url http://localhost:3014] [--api-key YOUR_KEY]
"""

import os
import sys
import json
import subprocess
import time
import logging
import requests
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
import argparse
import re

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/wise2-defense/sdr-processor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Constants
DEFAULT_API_URL = 'http://localhost:3014'
DEFAULT_FREQ_START = 88
DEFAULT_FREQ_STOP = 1200
DEFAULT_SAMPLE_RATE = 2.4e6
DEFAULT_INTERVAL = 10  # seconds
POWER_THRESHOLD = -50  # dB (signals below this are noise)

# Pi Connection
PI_HOST = 'big-byte.tail44396d.ts.net'  # Tailscale address
PI_USER = 'dwise'
PI_SSH_KEY = os.path.expanduser('~/.ssh/id_rsa')  # Default SSH key


class SDRProcessor:
    """Process RTL-SDR spectrum data from remote Pi via SSH."""

    def __init__(
        self,
        api_url: str = DEFAULT_API_URL,
        api_key: str = '',
        freq_start: float = DEFAULT_FREQ_START,
        freq_stop: float = DEFAULT_FREQ_STOP,
        interval: int = DEFAULT_INTERVAL,
        pi_host: str = PI_HOST,
        pi_user: str = PI_USER,
        pi_ssh_key: str = PI_SSH_KEY
    ):
        self.api_url = api_url
        self.api_key = api_key or os.getenv('WISE_DEFENSE_API_KEY', '')
        self.freq_start = freq_start
        self.freq_stop = freq_stop
        self.interval = interval
        self.running = False
        self.headers = {'X-API-Key': self.api_key}

        # Pi connection details
        self.pi_host = pi_host
        self.pi_user = pi_user
        self.pi_ssh_key = pi_ssh_key
        self.ssh_client = None

    def connect_pi(self) -> bool:
        """Verify Big Byte Pi SSH access (using system SSH)."""
        try:
            # Test SSH connection using system ssh command
            cmd = f'ssh -i {self.pi_ssh_key} -o ConnectTimeout=5 -o StrictHostKeyChecking=no {self.pi_user}@{self.pi_host} echo "SSH OK"'
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=10)

            if result.returncode == 0 and 'SSH OK' in result.stdout:
                logger.info(f'SSH connection verified to Pi: {self.pi_host}')
                return True
            else:
                logger.error(f'SSH connection failed to Pi: {result.stderr}')
                return False

        except subprocess.TimeoutExpired:
            logger.error(f'SSH connection timeout to Pi at {self.pi_host}')
            return False
        except Exception as e:
            logger.error(f'SSH authentication failed: {e}')
            return False
        except paramiko.SSHException as e:
            logger.error(f'SSH connection error: {e}')
            return False
        except Exception as e:
            logger.error(f'Failed to connect to Pi: {e}')
            return False

    def disconnect_pi(self):
        """Placeholder for disconnect (using system SSH)."""
        pass

    def check_rtl_sdr_available(self) -> bool:
        """Check if rtl_power is running on Pi."""
        try:
            cmd = f'ssh -i {self.pi_ssh_key} -o ConnectTimeout=5 -o StrictHostKeyChecking=no {self.pi_user}@{self.pi_host} "ps aux | grep [r]tl_power"'
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=10)

            if result.returncode == 0 and result.stdout.strip():
                logger.info('rtl_power is running on Pi')
                return True
            else:
                logger.error('rtl_power not running on Pi')
                return False

        except subprocess.TimeoutExpired:
            logger.error('Timeout checking rtl_power on Pi')
            return False
        except Exception as e:
            logger.error(f'Failed to check rtl_power on Pi: {e}')
            return False

    def query_pi_rtl_power(self, duration: int = 10) -> Optional[str]:
        """Query spectrum data from rtl_power running on Pi via SSH."""
        try:
            # Build rtl_power command on Pi
            pi_cmd = (
                f'rtl_power -f {self.freq_start}M:{self.freq_stop}M:1M '
                f'-g 40 -d 0 -i {duration} -'
            )

            # SSH into Pi and run rtl_power
            ssh_cmd = (
                f'ssh -i {self.pi_ssh_key} -o ConnectTimeout=5 -o StrictHostKeyChecking=no '
                f'{self.pi_user}@{self.pi_host} "{pi_cmd}"'
            )

            logger.debug(f'Executing on Pi: {pi_cmd}')

            result = subprocess.run(ssh_cmd, shell=True, capture_output=True, text=True, timeout=duration + 15)

            if result.returncode != 0:
                logger.error(f'Pi rtl_power error: {result.stderr}')
                return None

            if not result.stdout:
                logger.warning('No output from rtl_power on Pi')
                return None

            logger.debug(f'Received {len(result.stdout)} bytes from Pi')
            return result.stdout

        except subprocess.TimeoutExpired:
            logger.error(f'Timeout querying rtl_power on Pi after {duration + 15}s')
            return None
        except Exception as e:
            logger.error(f'Failed to query rtl_power on Pi: {e}')
            return None

    def classify_signal(self, frequency: float) -> str:
        """Classify signal by frequency band."""
        freq = frequency

        # VHF/UHF allocations
        if 88 <= freq < 108:
            return 'FM_RADIO'
        elif 108 <= freq < 144:
            return 'AVIATION'
        elif 144 <= freq < 174:
            return 'VHF_HAM'
        elif 162 <= freq < 163:
            return 'NOAA_WEATHER'
        elif 174 <= freq < 216:
            return 'TV_BROADCAST'
        elif 216 <= freq < 400:
            return 'UHF_TV'
        elif 400 <= freq < 420:
            return 'MILITARY'
        elif 420 <= freq < 450:
            return 'UHF_HAM'
        elif 450 <= freq < 470:
            return 'PUBLIC_SAFETY'
        elif 470 <= freq < 512:
            return 'TV_UHF'
        elif 700 <= freq < 800:
            return 'PUBLIC_SAFETY'
        elif 800 <= freq < 900:
            return 'CELLULAR'
        elif 900 <= freq < 1000:
            return 'ISM_BAND'
        else:
            return 'OTHER'

    def detect_anomalies(self, signals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Detect anomalies (signal power spikes > 10 dB above baseline)."""
        # Group by classification
        by_class = {}
        for sig in signals:
            cls = sig['classification']
            if cls not in by_class:
                by_class[cls] = []
            by_class[cls].append(sig)

        # Calculate baseline per classification
        anomalies = []
        for cls, sigs in by_class.items():
            if len(sigs) < 2:
                continue

            powers = [s['power_db'] for s in sigs]
            baseline = sum(powers) / len(powers)

            for sig in sigs:
                if sig['power_db'] > baseline + 10:
                    sig['anomaly'] = True
                    sig['anomaly_dbm_above_baseline'] = sig['power_db'] - baseline
                    anomalies.append(sig)
                else:
                    sig['anomaly'] = False

        return anomalies

    def parse_rtl_power_output(self, output: str) -> List[Dict[str, Any]]:
        """Parse rtl_power CSV output with classification and anomaly detection."""
        signals = []

        try:
            for line in output.strip().split('\n'):
                if not line or line.startswith('#'):
                    continue

                # rtl_power CSV format:
                # date, time, useless, freq_low, freq_high, freq_step, samples, [power values...]
                parts = line.split(', ')

                if len(parts) < 8:
                    continue

                try:
                    freq_low = float(parts[3])
                    freq_high = float(parts[4])
                    freq_step = float(parts[5])
                    power_values = [float(p) for p in parts[7:]]

                    # Generate frequency/power pairs
                    freq = freq_low
                    for power in power_values:
                        if power > POWER_THRESHOLD:  # Filter out noise
                            classification = self.classify_signal(freq)
                            signals.append({
                                'frequency': freq,
                                'power_db': power,
                                'classification': classification,
                                'mode': 'rtl_sdr',
                                'timestamp': datetime.utcnow().isoformat()
                            })
                        freq += freq_step

                except (ValueError, IndexError) as e:
                    logger.debug(f'Failed to parse line: {line[:50]}... - {e}')
                    continue

        except Exception as e:
            logger.error(f'Failed to parse rtl_power output: {e}')

        # Detect anomalies
        self.detect_anomalies(signals)

        return signals

    def send_spectrum_snapshot(self, signals: List[Dict[str, Any]]) -> bool:
        """Send spectrum snapshot to API."""
        try:
            endpoint = f'{self.api_url}/api/sdr/spectrum/snapshot'

            payload = {
                'signals': signals,
                'timestamp': datetime.utcnow().isoformat()
            }

            response = requests.post(
                endpoint,
                json=payload,
                headers=self.headers,
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                logger.info(
                    f'Recorded {data.get("signals_recorded", 0)} signals '
                    f'(snapshot {data.get("snapshot_id", "")[:8]})'
                )
                return True
            else:
                logger.error(
                    f'API error {response.status_code}: {response.text[:200]}'
                )
                return False

        except requests.exceptions.ConnectionError:
            logger.error(f'Cannot reach API at {self.api_url}')
            return False
        except Exception as e:
            logger.error(f'Failed to send spectrum snapshot: {e}')
            return False

    def run_once(self) -> bool:
        """Run a single spectrum scan from Pi."""
        logger.info(f'Querying spectrum {self.freq_start}M-{self.freq_stop}M from Pi...')

        # Query rtl_power on Pi
        output = self.query_pi_rtl_power(duration=self.interval)
        if not output:
            logger.error('Failed to query rtl_power from Pi')
            return False

        # Parse output
        signals = self.parse_rtl_power_output(output)
        if not signals:
            logger.warning('No signals detected')
            return False

        logger.info(f'Detected {len(signals)} signals')

        # Send to API
        return self.send_spectrum_snapshot(signals)

    def run_loop(self):
        """Run continuous spectrum scanning from Pi."""
        logger.info('Starting RTL-SDR spectrum processor loop (remote Pi mode)')
        logger.info(f'Interval: {self.interval}s, Frequency: {self.freq_start}M-{self.freq_stop}M')
        logger.info(f'Pi: {self.pi_user}@{self.pi_host}')

        self.running = True
        reconnect_attempts = 0
        max_reconnect_attempts = 5

        try:
            # Connect to Pi
            if not self.connect_pi():
                logger.error('Failed to connect to Pi on startup')
                return

            # Check rtl_power is running
            if not self.check_rtl_sdr_available():
                logger.error('rtl_power not running on Pi')
                return

            while self.running:
                start_time = time.time()

                # Run scan
                try:
                    success = self.run_once()
                    if success:
                        reconnect_attempts = 0  # Reset on success
                except Exception as e:
                    logger.error(f'Scan error: {e}')
                    reconnect_attempts += 1
                    if reconnect_attempts > max_reconnect_attempts:
                        logger.error('Max reconnection attempts reached')
                        break
                    # Try to reconnect
                    logger.info(f'Attempting reconnect ({reconnect_attempts}/{max_reconnect_attempts})')
                    self.disconnect_pi()
                    time.sleep(5)
                    self.connect_pi()

                elapsed = time.time() - start_time
                wait_time = max(0, self.interval - elapsed)

                if wait_time > 0:
                    logger.debug(f'Waiting {wait_time:.1f}s before next scan')
                    time.sleep(wait_time)

        except KeyboardInterrupt:
            logger.info('Shutting down (Ctrl+C)')
        except Exception as e:
            logger.error(f'Unexpected error: {e}', exc_info=True)
        finally:
            self.disconnect_pi()
            self.running = False
            logger.info('RTL-SDR spectrum processor stopped')

    def stop(self):
        """Stop the processor."""
        self.running = False


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description='RTL-SDR Spectrum Processor for WISE Defense'
    )
    parser.add_argument(
        '--api-url',
        default=DEFAULT_API_URL,
        help=f'API URL (default: {DEFAULT_API_URL})'
    )
    parser.add_argument(
        '--api-key',
        default=os.getenv('WISE_DEFENSE_API_KEY', ''),
        help='API key (default: env var WISE_DEFENSE_API_KEY)'
    )
    parser.add_argument(
        '--freq-start',
        type=float,
        default=DEFAULT_FREQ_START,
        help=f'Start frequency in MHz (default: {DEFAULT_FREQ_START})'
    )
    parser.add_argument(
        '--freq-stop',
        type=float,
        default=DEFAULT_FREQ_STOP,
        help=f'Stop frequency in MHz (default: {DEFAULT_FREQ_STOP})'
    )
    parser.add_argument(
        '--interval',
        type=int,
        default=DEFAULT_INTERVAL,
        help=f'Scan interval in seconds (default: {DEFAULT_INTERVAL})'
    )
    parser.add_argument(
        '--once',
        action='store_true',
        help='Run a single scan and exit'
    )
    parser.add_argument(
        '--pi-host',
        default=PI_HOST,
        help=f'Pi host/domain (default: {PI_HOST})'
    )
    parser.add_argument(
        '--pi-user',
        default=PI_USER,
        help=f'Pi SSH user (default: {PI_USER})'
    )
    parser.add_argument(
        '--pi-key',
        default=PI_SSH_KEY,
        help=f'Path to SSH key (default: {PI_SSH_KEY})'
    )

    args = parser.parse_args()

    # Create processor
    processor = SDRProcessor(
        api_url=args.api_url,
        api_key=args.api_key,
        freq_start=args.freq_start,
        freq_stop=args.freq_stop,
        interval=args.interval,
        pi_host=args.pi_host,
        pi_user=args.pi_user,
        pi_ssh_key=args.pi_key
    )

    # For single run, connect and check
    if args.once:
        if not processor.connect_pi():
            logger.error('Failed to connect to Pi')
            sys.exit(1)
        if not processor.check_rtl_sdr_available():
            logger.error('rtl_power not running on Pi')
            processor.disconnect_pi()
            sys.exit(1)

    # Run
    if args.once:
        try:
            success = processor.run_once()
            sys.exit(0 if success else 1)
        finally:
            processor.disconnect_pi()
    else:
        processor.run_loop()


if __name__ == '__main__':
    main()
