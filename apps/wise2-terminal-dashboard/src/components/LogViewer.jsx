import React, { useState, useEffect, useRef } from 'react';
import './LogViewer.css';

export default function LogViewer() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const [wsReady, setWsReady] = useState(false);
  const logsEndRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const scrollToBottom = () => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Fetch initial logs
    fetch('/api/logs?limit=100')
      .then(r => r.json())
      .then(data => setLogs(data))
      .catch(err => console.error('Error fetching logs:', err));

    // Setup WebSocket for live logs
    const ws = new WebSocket(`ws://${window.location.host}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsReady(true);
      ws.send(JSON.stringify({ type: 'logs-subscribe' }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'log') {
          setLogs(prev => [...prev.slice(-499), msg.data]); // Keep last 500
        }
      } catch (err) {
        console.error('Log parse error:', err);
      }
    };

    return () => {
      if (ws.readyState === 1) ws.close();
    };
  }, []);

  const getLevelColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'ERROR':
      case 'ERR':
        return '#FF0000';
      case 'WARN':
      case 'WARNING':
        return '#FFA500';
      case 'INFO':
      case 'INF':
        return '#00D9FF';
      case 'DEBUG':
      case 'DBG':
        return '#22C55E';
      default:
        return '#94A3B8';
    }
  };

  const getLevelIcon = (level) => {
    switch (level?.toUpperCase()) {
      case 'ERROR':
      case 'ERR':
        return '✕';
      case 'WARN':
      case 'WARNING':
        return '⚠';
      case 'INFO':
      case 'INF':
        return 'ℹ';
      case 'DEBUG':
      case 'DBG':
        return '🐛';
      default:
        return '•';
    }
  };

  const filtered = logs.filter(log => {
    if (filter === 'all') return true;
    return log.level?.toUpperCase() === filter.toUpperCase();
  });

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="log-viewer">
      <div className="log-header">
        <span className="log-title">📋 System Logs</span>
        <div className="log-controls">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
            <option value="all">All Levels</option>
            <option value="error">Errors Only</option>
            <option value="warn">Warnings</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>
          <button
            className={`scroll-btn ${autoScroll ? 'active' : ''}`}
            onClick={() => setAutoScroll(!autoScroll)}
            title="Toggle auto-scroll"
          >
            {autoScroll ? '⬇' : '⬆'}
          </button>
          <button
            className="clear-btn"
            onClick={clearLogs}
            title="Clear logs"
          >
            🗑
          </button>
          <span className={`log-status ${wsReady ? 'online' : 'offline'}`}>
            {wsReady ? '● Live' : '○ Offline'}
          </span>
        </div>
      </div>

      <div className="log-container">
        {filtered.length > 0 ? (
          <div className="log-lines">
            {filtered.map((log, idx) => (
              <div key={idx} className="log-line" style={{ '--level-color': getLevelColor(log.level) }}>
                <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="log-level" style={{ color: getLevelColor(log.level) }}>
                  {getLevelIcon(log.level)} {log.level?.toUpperCase() || 'LOG'}
                </span>
                <span className="log-message">{log.message}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        ) : (
          <div className="log-empty">No logs {filter !== 'all' && `at level: ${filter}`}</div>
        )}
      </div>

      <div className="log-footer">
        <small>Showing {filtered.length} of {logs.length} logs</small>
      </div>
    </div>
  );
}
