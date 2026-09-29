import React, { useState } from 'react';
import './LogViewer.css';

export default function LogViewer() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState([
    { id: 1, level: 'info', msg: 'WISE² Terminal Dashboard initialized', time: '14:32:05' },
    { id: 2, level: 'success', msg: 'WebSocket connection established', time: '14:32:06' },
    { id: 3, level: 'warn', msg: 'Memory usage approaching 80%', time: '14:35:12' },
    { id: 4, level: 'error', msg: 'Failed to connect to Ollama on localhost:11434', time: '14:36:45' },
    { id: 5, level: 'info', msg: 'Metrics update: CPU 45%, MEM 78%, DISK 65%', time: '14:37:00' },
  ]);

  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? logs : logs.filter(l => l.level === filter);

  const getIcon = (level) => {
    const icons = { info: 'ℹ️', success: '✓', warn: '⚠️', error: '✕' };
    return icons[level] || '•';
  };

  return (
    <div className="log-viewer">
      <button
        className="log-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Logs (Cmd+L)"
      >
        📜 {logs.length}
      </button>

      {isOpen && (
        <div className="logs-panel">
          <div className="logs-header">
            <h4>System Logs</h4>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="logs-filters">
            {['all', 'info', 'success', 'warn', 'error'].map(f => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="logs-list">
            {filtered.map(log => (
              <div key={log.id} className={`log-entry ${log.level}`}>
                <span className="log-icon">{getIcon(log.level)}</span>
                <span className="log-time">{log.time}</span>
                <span className="log-msg">{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
