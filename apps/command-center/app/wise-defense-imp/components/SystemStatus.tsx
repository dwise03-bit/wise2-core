'use client';

import { SystemStatus, HardwareStatus } from '../utils/api-client';

interface SystemStatusProps {
  system?: SystemStatus;
  hardware?: HardwareStatus;
  lastSync?: number;
}

function getStatusColor(value: string): string {
  switch (value) {
    case 'ACTIVE':
    case 'CONNECTED':
      return 'text-green-400';
    case 'OFFLINE':
    case 'MISSING_HARDWARE':
      return 'text-gray-500';
    case 'DETECTED_NOT_CONFIGURED':
    case 'MISSING_CREDENTIAL':
      return 'text-yellow-500';
    case 'DISABLED':
      return 'text-red-500';
    default:
      return 'text-gray-400';
  }
}

function getStatusDot(value: string): string {
  switch (value) {
    case 'ACTIVE':
    case 'CONNECTED':
      return '🟢';
    case 'OFFLINE':
    case 'MISSING_HARDWARE':
    case 'DISABLED':
      return '⚫';
    case 'DETECTED_NOT_CONFIGURED':
    case 'MISSING_CREDENTIAL':
      return '🟡';
    default:
      return '⚪';
  }
}

export function SystemStatusCard({ system, hardware, lastSync }: SystemStatusProps) {
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
      {/* Title */}
      <div className="text-xs font-mono uppercase text-green-400 tracking-wider">System Status</div>

      {/* System Metrics Grid */}
      {system && (
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div>
            <span className="text-gray-500">CPU</span>
            <span className="text-green-400 ml-2">{Math.round(system.cpu)}%</span>
          </div>
          <div>
            <span className="text-gray-500">RAM</span>
            <span className="text-green-400 ml-2">{Math.round(system.memory)}%</span>
          </div>
          <div>
            <span className="text-gray-500">TEMP</span>
            <span className="text-green-400 ml-2">{Math.round(system.temperature)}°C</span>
          </div>
          <div>
            <span className="text-gray-500">DISK</span>
            <span className="text-green-400 ml-2">{Math.round(system.disk)}%</span>
          </div>
        </div>
      )}

      {/* Hardware Status */}
      {hardware && (
        <div className="space-y-2 pt-2 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">SDR</span>
            <span className={getStatusColor(hardware.sdr)}>
              {getStatusDot(hardware.sdr)} {hardware.sdr}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">MESH</span>
            <span className={getStatusColor(hardware.mesh)}>
              {getStatusDot(hardware.mesh)} {hardware.mesh}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">GPS</span>
            <span className={getStatusColor(hardware.gps)}>
              {getStatusDot(hardware.gps)} {hardware.gps}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">WISE²</span>
            <span className={getStatusColor(hardware.wise2)}>
              {getStatusDot(hardware.wise2)} {hardware.wise2}
            </span>
          </div>
        </div>
      )}

      {/* Last Sync */}
      {lastSync && (
        <div className="pt-2 border-t border-gray-700 text-xs">
          <span className="text-gray-500">LAST SYNC</span>
          <span className="text-green-400 ml-2">{formatTime(Date.now() - lastSync)}</span>
        </div>
      )}
    </div>
  );
}
