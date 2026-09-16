import React, { useState, useEffect } from 'react';
import Terminal from './components/Terminal';
import Dashboard from './components/Dashboard';
import './App.css';

export default function App() {
  const [metrics, setMetrics] = useState(null);
  const [wsReady, setWsReady] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.host}`);

    ws.onopen = () => {
      setWsReady(true);
      console.log('WebSocket connected');
      ws.send(JSON.stringify({ type: 'metric-request' }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'metrics') {
          setMetrics(msg.data);
        }
      } catch (err) {
        console.error('Parse error:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    ws.onclose = () => {
      setWsReady(false);
      console.log('WebSocket closed');
    };

    // Request metrics periodically
    const interval = setInterval(() => {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({ type: 'metric-request' }));
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      if (ws.readyState === 1) {
        ws.close();
      }
    };
  }, []);

  return (
    <div className="app">
      <div className="app-header">
        <h1>⚙️ WISE² Terminal Dashboard</h1>
        <div className="status">
          <span className={`indicator ${wsReady ? 'online' : 'offline'}`}></span>
          {wsReady ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="app-container">
        <div className="terminal-section">
          <Terminal wsReady={wsReady} />
        </div>

        <div className="dashboard-section">
          <Dashboard metrics={metrics} />
        </div>
      </div>
    </div>
  );
}
