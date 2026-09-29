import React from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './PerformanceChart.css';

export default function PerformanceChart({ historyData }) {
  if (!historyData || !historyData.cpu || historyData.cpu.length === 0) {
    return <div className="chart-loading">Loading chart data...</div>;
  }

  // Format data for charts
  const chartData = historyData.cpu.map((cpu, idx) => ({
    time: idx,
    cpu: cpu,
    memory: historyData.memory[idx] || 0,
    disk: historyData.disk[idx] || 0
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          {payload.map((entry, idx) => (
            <div key={idx} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}%
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="performance-chart">
      <div className="chart-header">
        <span className="chart-title">📈 Performance Metrics (60s)</span>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00D9FF" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF00FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#FF00FF" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFA500" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#FFA500" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(67, 56, 202, 0.2)" />
            <XAxis
              dataKey="time"
              stroke="var(--text-muted)"
              tick={{ fontSize: 10 }}
              interval={Math.floor(chartData.length / 6)}
            />
            <YAxis
              stroke="var(--text-muted)"
              tick={{ fontSize: 10 }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
              iconType="line"
            />
            <Area
              type="monotone"
              dataKey="cpu"
              stroke="#00D9FF"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCpu)"
              name="CPU"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="memory"
              stroke="#FF00FF"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMemory)"
              name="Memory"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="disk"
              stroke="#FFA500"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDisk)"
              name="Disk"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-stats">
        <div className="stat-box">
          <span className="stat-label">CPU</span>
          <span className="stat-value" style={{color: '#00D9FF'}}>
            {chartData[chartData.length - 1]?.cpu.toFixed(0)}%
          </span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Memory</span>
          <span className="stat-value" style={{color: '#FF00FF'}}>
            {chartData[chartData.length - 1]?.memory.toFixed(0)}%
          </span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Disk</span>
          <span className="stat-value" style={{color: '#FFA500'}}>
            {chartData[chartData.length - 1]?.disk.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}
