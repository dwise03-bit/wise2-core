import React, { useState } from 'react';
import './CommandHub.css';

export default function CommandHub({ metrics, onExecute }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const commands = [
    { id: 1, name: 'System Status', cmd: 'wise2-status', icon: '📊', desc: 'Full system report' },
    { id: 2, name: 'Restart Ollama', cmd: 'pkill -f ollama && sleep 2 && ollama serve', icon: '🔄', desc: 'Restart AI engine' },
    { id: 3, name: 'Clear Cache', cmd: 'npm cache clean --force', icon: '🧹', desc: 'Free up disk' },
    { id: 4, name: 'Process List', cmd: 'ps aux | head -20', icon: '⚙️', desc: 'Top processes' },
    { id: 5, name: 'Disk Usage', cmd: 'du -sh ~/* | sort -h | tail -10', icon: '💾', desc: 'Large folders' },
    { id: 6, name: 'Network Stats', cmd: 'netstat -an | grep ESTABLISHED | wc -l', icon: '🌐', desc: 'Active connections' },
    { id: 7, name: 'Memory Dump', cmd: 'vm_stat', icon: '🧠', desc: 'Memory snapshot' },
    { id: 8, name: 'Check Logs', cmd: 'tail -50 /var/log/system.log', icon: '📜', desc: 'Recent logs' },
  ];

  const filtered = commands.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.desc.toLowerCase().includes(search.toLowerCase())
  );

  const handleExecute = (cmd) => {
    onExecute?.(cmd);
    setIsOpen(false);
  };

  return (
    <div className={`command-hub ${isOpen ? 'open' : 'closed'}`}>
      <button
        className="command-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Commands (Cmd+K)"
      >
        ⌨️
      </button>

      {isOpen && (
        <div className="command-panel">
          <div className="command-header">
            <h3>Command Hub</h3>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>

          <input
            type="text"
            className="command-search"
            placeholder="Search commands... (↑↓ arrow keys, Enter to run)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />

          <div className="command-list">
            {filtered.map(cmd => (
              <button
                key={cmd.id}
                className="command-item"
                onClick={() => handleExecute(cmd.cmd)}
                title={cmd.cmd}
              >
                <span className="command-icon">{cmd.icon}</span>
                <div className="command-info">
                  <div className="command-name">{cmd.name}</div>
                  <div className="command-desc">{cmd.desc}</div>
                </div>
                <span className="command-badge">↵</span>
              </button>
            ))}
          </div>

          <div className="command-footer">
            <div className="shortcut">Cmd+K: Toggle</div>
            <div className="shortcut">Cmd+J: Snapshots</div>
            <div className="shortcut">Cmd+L: Logs</div>
          </div>
        </div>
      )}
    </div>
  );
}
