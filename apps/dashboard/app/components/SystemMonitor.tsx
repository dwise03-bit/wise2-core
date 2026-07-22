'use client';

interface HealthMetric {
  cpu: number;
  ram: number;
  disk: number;
  temperature: number;
  services: number;
}

interface SystemMonitorProps {
  health: HealthMetric;
}

function HealthBar({ label, value, unit = '%', max = 100 }: { label: string; value: number; unit?: string; max?: number }) {
  const percentage = (value / max) * 100;
  const isWarning = percentage > 70;
  const isCritical = percentage > 90;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-mono">{value.toFixed(1)}{unit}</span>
      </div>
      <div className="w-full bg-[#050505] rounded-full h-2 overflow-hidden border border-[#2cd588]/20">
        <div
          className={`h-full transition-all ${
            isCritical ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-[#2cd588]'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function SystemMonitor({ health }: SystemMonitorProps) {
  return (
    <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
      <h2 className="text-xl font-bold text-[#2cd588] mb-4 flex items-center gap-2">
        <span>⚙️</span> System Health
      </h2>
      <div className="space-y-4">
        <HealthBar label="CPU" value={health.cpu} />
        <HealthBar label="Memory" value={health.ram} />
        <HealthBar label="Storage" value={health.disk} />
        <HealthBar label="Temp" value={health.temperature} unit="°C" max={100} />

        <div className="pt-4 border-t border-[#2cd588]/20 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Services Running</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-white font-mono">{health.services}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Status</span>
            <span className="text-[#2cd588] font-mono text-xs">🟢 Healthy</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Uptime</span>
            <span className="text-white font-mono text-xs">99.98%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
