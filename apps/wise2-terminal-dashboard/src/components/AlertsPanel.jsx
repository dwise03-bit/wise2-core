import React, { useState, useEffect } from 'react';
import './AlertsPanel.css';

export default function AlertsPanel({ metrics }) {
  const [alerts, setAlerts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [thresholds, setThresholds] = useState({ cpu: 80, memory: 90, disk: 95 });

  useEffect(() => {
    if (!metrics) return;

    const newAlerts = [];
    const now = new Date().toISOString();

    if (metrics.cpu > thresholds.cpu) {
      newAlerts.push({
        id: 'cpu',
        type: 'critical',
        title: 'High CPU Usage',
        message: `CPU at ${metrics.cpu}%`,
        timestamp: now,
        icon: '⚡'
      });
    }

    if (metrics.memory > thresholds.memory) {
      newAlerts.push({
        id: 'memory',
        type: 'critical',
        title: 'High Memory Usage',
        message: `Memory at ${metrics.memory}%`,
        timestamp: now,
        icon: '💾'
      });
    }

    if (metrics.disk > thresholds.disk) {
      newAlerts.push({
        id: 'disk',
        type: 'critical',
        title: 'High Disk Usage',
        message: `Disk at ${metrics.disk}%`,
        timestamp: now,
        icon: '📦'
      });
    }

    // Check service status
    Object.entries(metrics.services || {}).forEach(([service, status]) => {
      if (status === 'offline') {
        newAlerts.push({
          id: `service-${service}`,
          type: 'warning',
          title: 'Service Offline',
          message: `${service} is offline`,
          timestamp: now,
          icon: '⚠️'
        });
      }
    });

    setAlerts(newAlerts);
  }, [metrics, thresholds]);

  const dismissAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const dismissAll = () => {
    setAlerts([]);
  };

  return (
    <div className="alerts-panel">
      <button
        className={`alerts-button ${alerts.length > 0 ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Alerts"
      >
        🔔 {alerts.length > 0 && <span className="alert-badge">{alerts.length}</span>}
      </button>

      {isOpen && (
        <div className="alerts-dropdown">
          <div className="alerts-header">
            <span className="alerts-title">Alerts ({alerts.length})</span>
            {alerts.length > 0 && (
              <button className="dismiss-all" onClick={dismissAll}>✕</button>
            )}
          </div>

          {alerts.length > 0 ? (
            <div className="alerts-list">
              {alerts.map(alert => (
                <div key={alert.id} className={`alert-item ${alert.type}`}>
                  <span className="alert-icon">{alert.icon}</span>
                  <div className="alert-content">
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-time">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <button
                    className="alert-dismiss"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="alerts-empty">✓ All clear</div>
          )}
        </div>
      )}
    </div>
  );
}
