import React, { useState, useEffect } from 'react';
import './ProcessMonitor.css';

export default function ProcessMonitor() {
  const [processes, setProcesses] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [sortBy, setSortBy] = useState('cpu');

  useEffect(() => {
    const mockData = [
      { name: 'node', cpu: 12.5, mem: 8.2, cmd: 'npm start' },
      { name: 'Ollama', cpu: 45.3, mem: 24.1, cmd: 'ollama serve' },
      { name: 'Chrome', cpu: 8.7, mem: 15.3, cmd: 'chrome' },
      { name: 'Safari', cpu: 3.2, mem: 12.5, cmd: 'safari' },
      { name: 'Finder', cpu: 1.1, mem: 5.2, cmd: 'finder' },
    ];
    setProcesses(mockData);
  }, []);

  const sorted = [...processes].sort((a, b) => {
    if (sortBy === 'cpu') return (b.cpu || 0) - (a.cpu || 0);
    if (sortBy === 'mem') return (b.mem || 0) - (a.mem || 0);
    return a.name.localeCompare(b.name);
  });

  return (
    <div className={`process-monitor ${expanded ? 'expanded' : 'compact'}`}>
      <div className="process-header">
        <div className="process-title">⚙️ Top Processes</div>
        <button 
          className="process-expand"
          onClick={() => setExpanded(!expanded)}
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? '−' : '+'}
        </button>
      </div>

      {expanded && (
        <>
          <div className="process-controls">
            <button 
              className={`sort-btn ${sortBy === 'cpu' ? 'active' : ''}`}
              onClick={() => setSortBy('cpu')}
            >
              CPU
            </button>
            <button 
              className={`sort-btn ${sortBy === 'mem' ? 'active' : ''}`}
              onClick={() => setSortBy('mem')}
            >
              MEM
            </button>
            <button 
              className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`}
              onClick={() => setSortBy('name')}
            >
              NAME
            </button>
          </div>

          <div className="process-list">
            {sorted.map((proc, idx) => (
              <div key={idx} className="process-row" title={proc.cmd}>
                <div className="process-name">{proc.name}</div>
                <div className="process-metrics">
                  <span className="metric cpu">{(proc.cpu || 0).toFixed(1)}%</span>
                  <span className="metric mem">{(proc.mem || 0).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
