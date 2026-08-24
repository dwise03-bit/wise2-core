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


class SDRProcessor:
    """Process RTL-SDR spectrum data."""

    def __init__(
        self,
        api_url: str = DEFAULT_API_URL,
        api_key: str = '',
        freq_start: float = DEFAULT_FREQ_START,
        freq_stop: float = DEFAULT_FREQ_STOP,
        interval: int = DEFAULT_INTERVAL
    ):
        self.api_url = api_url
        self.api_key = api_key or os.getenv('WISE_DEFENSE_API_KEY', '')
        self.freq_start = freq_start
        self.freq_stop = freq_stop
        self.interval = interval
        self.running = False
        self.headers = {'X-API-Key': self.api_key}

    def check_rtl_sdr_available(self) -> bool:
        """Check if RTL-SDR tools are available."""
        try:
            result = subprocess.run(
                ['which', 'rtl_power'],
                capture_output=True,
                timeout=5
            )
            return result.returncode == 0
        except Exception as e:
            logger.error(f'Failed to check for rtl_power: {e}')
            return False

    def run_rtl_power(self, duration: int = 10) -> Optional[str]:
        """Run rtl_power for spectrum data."""
        try:
            cmd = [
                'rtl_power',
                '-f', f'{self.freq_start}M:{self.freq_stop}M:1M',  # 1 MHz steps
                '-g', '40',  # gain
                '-d', '0',   # device index
                '-i', str(duration),  # integration time
                '-'  # output to stdout
            ]

            logger.debug(f'Running: {" ".join(cmd)}')

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=duration + 5
            )

            if result.returncode != 0:
                logger.error(f'rtl_power error: {result.stderr}')
                return None

            return result.stdout

        except subprocess.TimeoutExpired:
            logger.error('rtl_power timed out')
            return None
        except FileNotFoundError:
            logger.error('rtl_power not found. Install rtl-sdr: apt install rtl-sdr')
            return None
        except Exception as e:
            logger.error(f'Failed to run rtl_power: {e}')
            return None

    def parse_rtl_power_output(self, output: str) -> List[Dict[str, Any]]:
        """Parse rtl_power CSV output."""
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
                            signals.append({
                                'frequency': freq,
                                'power_db': power,
                                'mode': 'rtl_sdr',
                                'timestamp': datetime.utcnow().isoformat()
                            })
                        freq += freq_step

                except (ValueError, IndexError) as e:
                    logger.debug(f'Failed to parse line: {line[:50]}... - {e}')
                    continue

        except Exception as e:
            logger.error(f'Failed to parse rtl_power output: {e}')

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
        """Run a single spectrum scan."""
        logger.info(f'Scanning spectrum {self.freq_start}M-{self.freq_stop}M...')

        # Run rtl_power
        output = self.run_rtl_power(duration=self.interval)
        if not output:
            return False

        # Parse output
        signals = self.parse_rtl_power_output(output)
        if not signals:
            logger.warning('No signals detected')
            return False

        # Send to API
        return self.send_spectrum_snapshot(signals)

    def run_loop(self):
        """Run continuous spectrum scanning."""
        logger.info('Starting RTL-SDR spectrum processor loop')
        logger.info(f'Interval: {self.interval}s, Frequency: {self.freq_start}M-{self.freq_stop}M')

        self.running = True

        try:
            while self.running:
                start_time = time.time()

                # Run scan
                success = self.run_once()

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

    args = parser.parse_args()

    # Create processor
    processor = SDRProcessor(
        api_url=args.api_url,
        api_key=args.api_key,
        freq_start=args.freq_start,
        freq_stop=args.freq_stop,
        interval=args.interval
    )

    # Check RTL-SDR availability
    if not processor.check_rtl_sdr_available():
        logger.error('rtl_power not found. Install: apt install rtl-sdr')
        sys.exit(1)

    # Run
    if args.once:
        success = processor.run_once()
        sys.exit(0 if success else 1)
    else:
        processor.run_loop()


if __name__ == '__main__':
    main()
