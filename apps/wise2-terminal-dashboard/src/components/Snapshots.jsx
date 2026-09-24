import React, { useState, useEffect } from 'react';
import './Snapshots.css';

export default function Snapshots({ metrics }) {
  const [snapshots, setSnapshots] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!metrics) return;

    const addSnapshot = () => {
      const snap = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        cpu: metrics.cpu,
        memory: metrics.memory,
        disk: metrics.disk,
      };

      setSnapshots(prev => {
        const updated = [snap, ...prev];
        return updated.slice(0, 12); // Keep last 12 snapshots
      });
    };

    // Snapshot every 5 minutes
    const interval = setInterval(addSnapshot, 5 * 60 * 1000);
    addSnapshot(); // First snapshot now

    return () => clearInterval(interval);
  }, [metrics]);

  const getChangeColor = (current, prev) => {
    if (!prev) return 'neutral';
    return current > prev ? 'danger' : current < prev ? 'success' : 'neutral';
  };

  const getChange = (current, prev) => {
    if (!prev) return '0';
    const diff = current - prev;
    return diff > 0 ? `+${diff.toFixed(1)}` : `${diff.toFixed(1)}`;
  };

  return (
    <div className="snapshots">
      <button
        className="snapshot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Snapshots (Cmd+J)"
      >
        📷 {snapshots.length}
      </button>

      {isOpen && (
        <div className="snapshots-panel">
          <div className="snapshots-header">
            <h4>System Snapshots</h4>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="snapshots-list">
            {snapshots.length === 0 ? (
              <div className="snapshots-empty">No snapshots yet</div>
            ) : (
              snapshots.map((snap, idx) => (
                <div key={snap.id} className="snapshot-item">
                  <div className="snapshot-time">{snap.time}</div>
                  <div className="snapshot-values">
                    <div className={`value ${getChangeColor(snap.cpu, snapshots[idx + 1]?.cpu)}`}>
                      CPU: {snap.cpu.toFixed(1)}%
                      {idx < snapshots.length - 1 && (
                        <span className="change">{getChange(snap.cpu, snapshots[idx + 1]?.cpu)}</span>
                      )}
                    </div>
                    <div className={`value ${getChangeColor(snap.memory, snapshots[idx + 1]?.memory)}`}>
                      MEM: {snap.memory.toFixed(1)}%
                      {idx < snapshots.length - 1 && (
                        <span className="change">{getChange(snap.memory, snapshots[idx + 1]?.memory)}</span>
                      )}
                    </div>
                    <div className={`value ${getChangeColor(snap.disk, snapshots[idx + 1]?.disk)}`}>
                      DSK: {snap.disk.toFixed(1)}%
                      {idx < snapshots.length - 1 && (
                        <span className="change">{getChange(snap.disk, snapshots[idx + 1]?.disk)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
