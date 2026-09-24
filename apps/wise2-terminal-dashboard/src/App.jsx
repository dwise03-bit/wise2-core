import React, { useState, useEffect } from 'react';
import Terminal from './components/Terminal';
import Dashboard from './components/Dashboard';
import PerformanceChart from './components/PerformanceChart';
import AlertsPanel from './components/AlertsPanel';
import ThemeToggle from './components/ThemeToggle';
import AIAssistant from './components/AIAssistant';
import { useTheme } from './hooks/useTheme';
import './App.css';

export default function App() {
  const [metrics, setMetrics] = useState(null);
  const [wsReady, setWsReady] = useState(false);
  const [historyData, setHistoryData] = useState({ cpu: [], memory: [], disk: [] });
  const { theme } = useTheme();

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
          // Track history for charts (60-second window)
          setHistoryData(prev => ({
            cpu: [...prev.cpu.slice(-59), msg.data.cpu],
            memory: [...prev.memory.slice(-59), msg.data.memory],
            disk: [...prev.disk.slice(-59), msg.data.disk]
          }));
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
        <div className="header-controls">
          <AlertsPanel metrics={metrics} />
          <ThemeToggle />
          <div className="status">
            <span className={`indicator ${wsReady ? 'online' : 'offline'}`}></span>
            {wsReady ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </div>

      <div className="app-container">
        <div className="terminal-section">
          <Terminal wsReady={wsReady} />
        </div>

        <div className="dashboard-section">
          <div className="dashboard-content">
            <PerformanceChart historyData={historyData} />
            <Dashboard metrics={metrics} />
          </div>
        </div>

        <div className="ai-section">
          <AIAssistant metrics={metrics} />
        </div>
      </div>
    </div>
  );
}
