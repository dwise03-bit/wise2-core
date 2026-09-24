import React, { useState, useEffect } from 'react';
import './Dashboard.css';

export default function Dashboard({ metrics }) {
  const [history, setHistory] = useState({ cpu: [], memory: [], disk: [] });
  const [alerts, setAlerts] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [thresholds, setThresholds] = useState({ cpu: 80, memory: 90, disk: 95 });

  useEffect(() => {
    if (!metrics) return;

    setHistory(prev => ({
      cpu: [...prev.cpu.slice(-59), metrics.cpu],
      memory: [...prev.memory.slice(-59), metrics.memory],
      disk: [...prev.disk.slice(-59), metrics.disk]
    }));

    // Check thresholds
    const newAlerts = [];
    if (metrics.cpu > thresholds.cpu) newAlerts.push(`⚠️ CPU high: ${metrics.cpu}%`);
    if (metrics.memory > thresholds.memory) newAlerts.push(`⚠️ Memory high: ${metrics.memory}%`);
    if (metrics.disk > thresholds.disk) newAlerts.push(`⚠️ Disk high: ${metrics.disk}%`);

    if (newAlerts.length > 0 && alerts.length === 0) {
      setAlerts(newAlerts);
      setTimeout(() => setAlerts([]), 5000);
    }
  }, [metrics, thresholds]);

  if (!metrics) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">Loading system info...</div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    return status === 'online' ? '#00FF7F' : '#ff6b6b';
  };

  const getMetricTrend = (arr) => {
    if (arr.length < 2) return '→';
    const recent = arr[arr.length - 1];
    const previous = arr[arr.length - 2];
    if (recent > previous) return '↑';
    if (recent < previous) return '↓';
    return '→';
  };

  const getAverage = (arr) => arr.length ? (arr.reduce((a, b) => a + b) / arr.length).toFixed(1) : 0;
  const getMax = (arr) => arr.length ? Math.max(...arr) : 0;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <span className="dashboard-title">System Status</span>
        <button
          className="advanced-btn"
          onClick={() => setShowAdvanced(!showAdvanced)}
          title="Toggle advanced metrics"
        >
          ⚡ Advanced
        </button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="alerts-banner">
          {alerts.map((alert, i) => <div key={i}>{alert}</div>)}
        </div>
      )}

      {/* System Metrics */}
      <div className="metrics-section">
        <h3>System Resources</h3>

        <div className="metric">
          <div className="metric-header">
            <div className="metric-label">CPU {getMetricTrend(history.cpu)}</div>
            <div className="metric-value">{metrics.cpu}%</div>
          </div>
          <div className="metric-bar">
            <div
              className="metric-fill cpu"
              style={{ width: `${metrics.cpu}%` }}
            ></div>
          </div>
          {showAdvanced && (
            <div className="metric-stats">
              Avg: {getAverage(history.cpu)}% | Max: {getMax(history.cpu)}%
            </div>
          )}
        </div>

        <div className="metric">
          <div className="metric-header">
            <div className="metric-label">Memory {getMetricTrend(history.memory)}</div>
            <div className="metric-value">{metrics.memory}%</div>
          </div>
          <div className="metric-bar">
            <div
              className="metric-fill memory"
              style={{ width: `${metrics.memory}%` }}
            ></div>
          </div>
          {showAdvanced && (
            <div className="metric-stats">
              Avg: {getAverage(history.memory)}% | Max: {getMax(history.memory)}%
            </div>
          )}
        </div>

        <div className="metric">
          <div className="metric-header">
            <div className="metric-label">Disk {getMetricTrend(history.disk)}</div>
            <div className="metric-value">{metrics.disk}%</div>
          </div>
          <div className="metric-bar">
            <div
              className="metric-fill disk"
              style={{ width: `${metrics.disk}%` }}
            ></div>
          </div>
          {showAdvanced && (
            <div className="metric-stats">
              Avg: {getAverage(history.disk)}% | Max: {getMax(history.disk)}%
            </div>
          )}
        </div>
      </div>

      {/* Services Status */}
      <div className="services-section">
        <h3>Services</h3>
        <div className="services-list">
          {Object.entries(metrics.services || {}).map(([service, status]) => (
            <div key={service} className="service-item">
              <span
                className="service-indicator"
                style={{ backgroundColor: getStatusColor(status) }}
              ></span>
              <span className="service-name">{service}</span>
              <span className={`service-status ${status}`}>
                {status === 'online' ? '✓ Online' : '✗ Offline'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Commands */}
      <div className="commands-section">
        <h3>Recent Commands</h3>
        <div className="commands-list">
          {metrics.recentCommands && metrics.recentCommands.length > 0 ? (
            metrics.recentCommands.slice(0, 8).map((cmd, idx) => (
              <div key={idx} className="command-item">
                <span className="command-text">{cmd.command}</span>
                <span className="command-time">
                  {new Date(cmd.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          ) : (
            <div className="empty-message">No commands yet</div>
          )}
        </div>
      </div>

      {/* Threshold Controls */}
      {showAdvanced && (
        <div className="thresholds-section">
          <h3>Alert Thresholds</h3>
          <div className="threshold-controls">
            <div className="threshold-item">
              <label>CPU</label>
              <input
                type="range"
                min="50"
                max="100"
                value={thresholds.cpu}
                onChange={(e) => setThresholds({...thresholds, cpu: parseInt(e.target.value)})}
              />
              <span>{thresholds.cpu}%</span>
            </div>
            <div className="threshold-item">
              <label>Memory</label>
              <input
                type="range"
                min="50"
                max="100"
                value={thresholds.memory}
                onChange={(e) => setThresholds({...thresholds, memory: parseInt(e.target.value)})}
              />
              <span>{thresholds.memory}%</span>
            </div>
            <div className="threshold-item">
              <label>Disk</label>
              <input
                type="range"
                min="50"
                max="100"
                value={thresholds.disk}
                onChange={(e) => setThresholds({...thresholds, disk: parseInt(e.target.value)})}
              />
              <span>{thresholds.disk}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="actions-section">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button
            className="action-btn"
            onClick={() => navigator.clipboard.writeText('wise2 status')}
            title="Copy to clipboard"
          >
            📊 Status
          </button>
          <button
            className="action-btn"
            onClick={() => navigator.clipboard.writeText('wise2 doctor')}
            title="Copy to clipboard"
          >
            🩺 Doctor
          </button>
          <button
            className="action-btn"
            onClick={() => navigator.clipboard.writeText('wise2 logs all')}
            title="Copy to clipboard"
          >
            📋 Logs
          </button>
          <button
            className="action-btn"
            onClick={() => navigator.clipboard.writeText('wise2 models')}
            title="Copy to clipboard"
          >
            🤖 Models
          </button>
        </div>
      </div>

      {/* Info Footer */}
      <div className="dashboard-footer">
        <small>Updates every 2 seconds</small>
      </div>
    </div>
  );
}
