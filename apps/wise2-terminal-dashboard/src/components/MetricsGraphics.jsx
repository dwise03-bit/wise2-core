import React from 'react';
import { createSystemStats, createServicesDisplay, createMetricsHistory, createStatusIndicator } from '../utils/graphics';
import './MetricsGraphics.css';

export default function MetricsGraphics({ metrics, historyData }) {
  if (!metrics) return null;

  const stats = createSystemStats(metrics.cpu, metrics.memory, metrics.disk);
  const services = createServicesDisplay(metrics.services || {});

  return (
    <div className="metrics-graphics">
      {/* ASCII Art Stats Display */}
      <div className="graphics-card stats-card">
        <pre className="ascii-output">{stats}</pre>
      </div>

      {/* Services Status */}
      <div className="graphics-card services-card">
        <pre className="ascii-output">{services}</pre>
      </div>

      {/* Metrics History with Sparklines */}
      {historyData && (
        <div className="graphics-card history-card">
          <div className="history-header">
            <span className="history-title">📊 Metrics Trend (60s)</span>
          </div>
          <pre className="ascii-output">
            {createMetricsHistory('CPU   ', historyData.cpu, 35)}{'\r\n'}
            {createMetricsHistory('Memory', historyData.memory, 35)}{'\r\n'}
            {createMetricsHistory('Disk  ', historyData.disk, 35)}
          </pre>
        </div>
      )}

      {/* System Information */}
      <div className="graphics-card info-card">
        <div className="info-header">
          <span className="info-title">ℹ️ System Info</span>
        </div>
        <div className="info-content">
          <div className="info-row">
            <span className="info-label">Status:</span>
            <span className="info-value">
              {createStatusIndicator('online')} Connected
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Updates:</span>
            <span className="info-value">Real-time (2s)</span>
          </div>
          <div className="info-row">
            <span className="info-label">Terminal:</span>
            <span className="info-value">PTY Active</span>
          </div>
          <div className="info-row">
            <span className="info-label">WebSocket:</span>
            <span className="info-value">Streaming</span>
          </div>
        </div>
      </div>
    </div>
  );
}
