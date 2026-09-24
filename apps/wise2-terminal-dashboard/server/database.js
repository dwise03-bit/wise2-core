import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../data/metrics.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    cpu REAL,
    memory REAL,
    disk REAL
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    type TEXT,
    message TEXT,
    value REAL,
    threshold REAL
  );

  CREATE TABLE IF NOT EXISTS processes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    pid INTEGER,
    name TEXT,
    cpu REAL,
    memory REAL,
    cmd TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp);
  CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp);
  CREATE INDEX IF NOT EXISTS idx_processes_timestamp ON processes(timestamp);
`);

export const dbOps = {
  // Metrics
  storeMetrics: (cpu, memory, disk) => {
    const stmt = db.prepare('INSERT INTO metrics (cpu, memory, disk) VALUES (?, ?, ?)');
    return stmt.run(cpu, memory, disk);
  },

  getMetricsHistory: (minutes = 60) => {
    const stmt = db.prepare(`
      SELECT * FROM metrics
      WHERE timestamp > datetime('now', '-' || ? || ' minutes')
      ORDER BY timestamp DESC
      LIMIT 1000
    `);
    return stmt.all(minutes).reverse();
  },

  getMetricsStats: (minutes = 60) => {
    const stmt = db.prepare(`
      SELECT
        AVG(cpu) as avgCpu, MAX(cpu) as maxCpu, MIN(cpu) as minCpu,
        AVG(memory) as avgMemory, MAX(memory) as maxMemory, MIN(memory) as minMemory,
        AVG(disk) as avgDisk, MAX(disk) as maxDisk, MIN(disk) as minDisk
      FROM metrics
      WHERE timestamp > datetime('now', '-' || ? || ' minutes')
    `);
    return stmt.get(minutes);
  },

  exportMetricsCSV: (minutes = 60) => {
    const metrics = dbOps.getMetricsHistory(minutes);
    const header = 'timestamp,cpu,memory,disk\n';
    const rows = metrics.map(m => `${m.timestamp},${m.cpu},${m.memory},${m.disk}`).join('\n');
    return header + rows;
  },

  // Alerts
  storeAlert: (type, message, value, threshold) => {
    const stmt = db.prepare('INSERT INTO alerts (type, message, value, threshold) VALUES (?, ?, ?, ?)');
    return stmt.run(type, message, value, threshold);
  },

  getAlerts: (limit = 50) => {
    const stmt = db.prepare('SELECT * FROM alerts ORDER BY timestamp DESC LIMIT ?');
    return stmt.all(limit);
  },

  clearOldAlerts: (days = 7) => {
    const stmt = db.prepare("DELETE FROM alerts WHERE timestamp < datetime('now', '-' || ? || ' days')");
    return stmt.run(days);
  },

  // Processes
  storeProcesses: (processes) => {
    const stmt = db.prepare('INSERT INTO processes (pid, name, cpu, memory, cmd) VALUES (?, ?, ?, ?, ?)');
    const insert = db.transaction((procs) => {
      for (const proc of procs) {
        stmt.run(proc.pid, proc.name, proc.cpu || 0, proc.memory || 0, proc.cmd || '');
      }
    });
    return insert(processes);
  },

  getTopProcesses: (limit = 10) => {
    const stmt = db.prepare(`
      SELECT * FROM processes
      WHERE timestamp = (SELECT MAX(timestamp) FROM processes)
      ORDER BY memory DESC
      LIMIT ?
    `);
    return stmt.all(limit);
  },

  // Cleanup old data (keep last 30 days)
  cleanup: () => {
    db.prepare("DELETE FROM metrics WHERE timestamp < datetime('now', '-30 days')").run();
    db.prepare("DELETE FROM processes WHERE timestamp < datetime('now', '-7 days')").run();
    db.prepare("DELETE FROM alerts WHERE timestamp < datetime('now', '-14 days')").run();
  }
};

export default db;
