'use client';

interface MetricCardProps {
  title: string;
  value: string;
  trend: number;
  icon: string;
}

export function MetricCard({ title, value, trend, icon }: MetricCardProps) {
  const isPositive = trend >= 0;
  const trendColor = isPositive ? 'text-green-500' : 'text-red-500';
  const trendBg = isPositive ? 'bg-green-500/10' : 'bg-red-500/10';

  return (
    <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6 hover:border-[#2cd588] transition-all cursor-pointer group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {trend !== 0 && (
            <div className={`mt-2 flex items-center gap-1 text-sm font-mono ${trendColor} ${trendBg} px-2 py-1 rounded w-fit`}>
              <span>{isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <div className="text-4xl opacity-70 group-hover:opacity-100 transition-opacity">
          {icon}
        </div>
      </div>
    </div>
  );
}
