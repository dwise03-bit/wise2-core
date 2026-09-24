import React, { useState, useEffect } from 'react';
import './ProcessMonitor.css';

export default function ProcessMonitor() {
  const [processes, setProcesses] = useState([]);
  const [sortBy, setSortBy] = useState('memory');
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProcesses = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/processes');
        const data = await response.json();
        setProcesses(data);
      } catch (err) {
        console.error('Error fetching processes:', err);
      }
      setLoading(false);
    };

    fetchProcesses();
    const interval = setInterval(fetchProcesses, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const sorted = [...processes]
    .sort((a, b) => {
      if (sortBy === 'memory') return (b.memory || 0) - (a.memory || 0);
      if (sortBy === 'cpu') return (b.cpu || 0) - (a.cpu || 0);
      return a.name.localeCompare(b.name);
    })
    .slice(0, limit);

  const killProcess = async (pid) => {
    if (window.confirm(`Kill process ${pid}?`)) {
      try {
        await fetch(`/api/process/${pid}`, { method: 'DELETE' });
        setProcesses(processes.filter(p => p.pid !== pid));
      } catch (err) {
        console.error('Error killing process:', err);
      }
    }
  };

  return (
    <div className="process-monitor">
      <div className="process-header">
        <span className="process-title">⚙️ Process Monitor</span>
        <div className="process-controls">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="control-select">
            <option value="memory">By Memory</option>
            <option value="cpu">By CPU</option>
            <option value="name">By Name</option>
          </select>
          <select value={limit} onChange={(e) => setLimit(parseInt(e.target.value))} className="control-select">
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
            <option value={50}>Top 50</option>
          </select>
        </div>
      </div>

      {loading && <div className="process-loading">Loading...</div>}

      {!loading && sorted.length > 0 && (
        <div className="process-table">
          <div className="process-row header-row">
            <div className="col col-pid">PID</div>
            <div className="col col-name">Name</div>
            <div className="col col-cpu">CPU %</div>
            <div className="col col-mem">Memory %</div>
            <div className="col col-action">Action</div>
          </div>

          {sorted.map((proc) => (
            <div key={proc.pid} className="process-row">
              <div className="col col-pid">{proc.pid}</div>
              <div className="col col-name">{proc.name}</div>
              <div className="col col-cpu">
                <span className={proc.cpu > 50 ? 'high' : ''}>{(proc.cpu || 0).toFixed(1)}%</span>
              </div>
              <div className="col col-mem">
                <span className={proc.memory > 50 ? 'high' : ''}>{(proc.memory || 0).toFixed(1)}%</span>
              </div>
              <div className="col col-action">
                <button
                  className="kill-btn"
                  onClick={() => killProcess(proc.pid)}
                  title="Kill process"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && sorted.length === 0 && (
        <div className="process-empty">No processes</div>
      )}
    </div>
  );
}
