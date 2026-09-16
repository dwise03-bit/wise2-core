import React from 'react';
import './Dashboard.css';

export default function Dashboard({ metrics }) {
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

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <span className="dashboard-title">System Status</span>
      </div>

      {/* System Metrics */}
      <div className="metrics-section">
        <h3>System Resources</h3>

        <div className="metric">
          <div className="metric-label">CPU</div>
          <div className="metric-bar">
            <div
              className="metric-fill cpu"
              style={{ width: `${metrics.cpu}%` }}
            ></div>
          </div>
          <div className="metric-value">{metrics.cpu}%</div>
        </div>

        <div className="metric">
          <div className="metric-label">Memory</div>
          <div className="metric-bar">
            <div
              className="metric-fill memory"
              style={{ width: `${metrics.memory}%` }}
            ></div>
          </div>
          <div className="metric-value">{metrics.memory}%</div>
        </div>

        <div className="metric">
          <div className="metric-label">Disk</div>
          <div className="metric-bar">
            <div
              className="metric-fill disk"
              style={{ width: `${metrics.disk}%` }}
            ></div>
          </div>
          <div className="metric-value">{metrics.disk}%</div>
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
