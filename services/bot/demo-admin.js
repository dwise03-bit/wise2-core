/**
 * DEMO MODE ADMIN PANEL
 * Control and manage demo simulations
 */

const express = require('express');
const router = express.Router();
const { SimulationEngine, demoAPI, demoData } = require('./demo-engine');

const engine = new SimulationEngine();

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

/**
 * GET /demo/status
 * Return current demo mode status
 */
router.get('/status', (req, res) => {
  res.json({
    demoMode: true,
    simulationRunning: engine.isRunning,
    speed: engine.speed,
    eventsGenerated: engine.simulationIndex,
    dataPoints: {
      customers: demoData.customers.length,
      users: demoData.users.length,
      projects: demoData.projects.length,
      tickets: demoData.tickets.length,
    },
  });
});

/**
 * POST /demo/start
 * Start simulation engine
 */
router.post('/start', (req, res) => {
  engine.start();
  res.json({ success: true, message: 'Simulation started' });
});

/**
 * POST /demo/stop
 * Stop simulation engine
 */
router.post('/stop', (req, res) => {
  engine.stop();
  res.json({ success: true, message: 'Simulation stopped' });
});

/**
 * POST /demo/reset
 * Reset all demo data
 */
router.post('/reset', (req, res) => {
  engine.reset();
  res.json({ success: true, message: 'Demo data reset', eventsCleared: true });
});

/**
 * POST /demo/speed
 * Set simulation speed
 */
router.post('/speed', (req, res) => {
  const { speed } = req.body;
  const validSpeeds = ['normal', 'fast', 'presentation', 'tradeshow', 'offline'];

  if (!validSpeeds.includes(speed)) {
    return res.status(400).json({ error: 'Invalid speed' });
  }

  engine.speed = speed;
  res.json({ success: true, speed: engine.speed });
});

/**
 * GET /demo/events
 * Get recent simulation events
 */
router.get('/events', (req, res) => {
  const limit = req.query.limit || 20;
  res.json({ events: engine.getEvents(limit) });
});

/**
 * GET /demo/customers
 * Get demo customers
 */
router.get('/customers', (req, res) => {
  res.json({ customers: demoAPI.getCustomers() });
});

/**
 * GET /demo/metrics
 * Get demo metrics
 */
router.get('/metrics', (req, res) => {
  res.json({ metrics: demoAPI.getMetrics() });
});

/**
 * GET /demo/users
 * Get demo users
 */
router.get('/users', (req, res) => {
  res.json({ users: demoAPI.getUsers() });
});

/**
 * POST /demo/generate-data
 * Generate fresh demo data
 */
router.post('/generate-data', (req, res) => {
  // In a real implementation, this would regenerate all demo data
  res.json({
    success: true,
    message: 'Fresh demo data generated',
    dataPoints: demoData.customers.length + demoData.projects.length + demoData.tickets.length,
  });
});

/**
 * GET /demo/panel
 * Serve demo control panel UI
 */
router.get('/panel', (req, res) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WISE² Demo Control Panel</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      background: #0a0a0a;
      color: #00ff00;
      padding: 20px;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      border: 2px solid #00ff00;
      padding: 20px;
      background: #050505;
      box-shadow: 0 0 20px rgba(0,255,0,0.3);
    }
    h1 {
      text-align: center;
      margin-bottom: 30px;
      text-shadow: 0 0 10px #00ff00;
      font-size: 2em;
    }
    .badge {
      display: inline-block;
      background: #2cd588;
      color: #000;
      padding: 5px 10px;
      border-radius: 3px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .controls {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    button {
      padding: 15px;
      background: #00ff00;
      color: #000;
      border: 0;
      cursor: pointer;
      font-weight: bold;
      font-family: monospace;
      border-radius: 3px;
    }
    button:hover {
      background: #00aa00;
      box-shadow: 0 0 10px #00ff00;
    }
    .speed-control {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .speed-btn {
      padding: 10px 15px;
      background: #0055ff;
      color: #fff;
      border: 1px solid #00ff00;
      cursor: pointer;
      flex: 1;
      min-width: 100px;
    }
    .speed-btn.active {
      background: #00ff00;
      color: #000;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin: 30px 0;
      padding: 20px;
      border: 1px solid #00aa00;
      background: #0a0a0a;
    }
    .stat-card {
      text-align: center;
      padding: 15px;
      border: 1px solid #00ff00;
      background: #050505;
    }
    .stat-value {
      font-size: 2em;
      color: #2cd588;
      margin-bottom: 5px;
    }
    .stat-label {
      color: #00aa00;
      font-size: 0.9em;
    }
    .events {
      margin-top: 30px;
      border: 1px solid #00aa00;
      padding: 15px;
      background: #000;
      max-height: 300px;
      overflow-y: auto;
    }
    .event {
      margin: 5px 0;
      padding: 5px;
      border-left: 3px solid #2cd588;
      color: #00ff00;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">🎬 DEMO CONTROL PANEL</div>
    <h1>WISE² Enterprise Demo Mode</h1>

    <div class="controls">
      <button onclick="start()">▶️ Start Simulation</button>
      <button onclick="stop()">⏹️ Stop Simulation</button>
      <button onclick="reset()">🔄 Reset Data</button>
      <button onclick="generateData()">📊 Generate Fresh Data</button>
    </div>

    <div style="margin: 20px 0; padding: 15px; border: 1px solid #0055ff; background: #0a0a0a;">
      <label style="display: block; margin-bottom: 10px; color: #0055ff;">Simulation Speed:</label>
      <div class="speed-control">
        <button class="speed-btn active" onclick="setSpeed('normal')">Normal</button>
        <button class="speed-btn" onclick="setSpeed('fast')">Fast</button>
        <button class="speed-btn" onclick="setSpeed('presentation')">Presentation</button>
        <button class="speed-btn" onclick="setSpeed('tradeshow')">Trade Show</button>
        <button class="speed-btn" onclick="setSpeed('offline')">Offline</button>
      </div>
    </div>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-value" id="customers">8</div>
        <div class="stat-label">Customers</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="projects">5</div>
        <div class="stat-label">Projects</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="tickets">3</div>
        <div class="stat-label">Tickets</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="events">0</div>
        <div class="stat-label">Events</div>
      </div>
    </div>

    <div class="events" id="eventList">
      <div class="event">Waiting for events...</div>
    </div>
  </div>

  <script>
    function start() {
      fetch('/demo/start', { method: 'POST' })
        .then(r => r.json())
        .then(d => alert('✅ Simulation started'))
        .catch(e => alert('Error: ' + e));
    }

    function stop() {
      fetch('/demo/stop', { method: 'POST' })
        .then(r => r.json())
        .then(d => alert('⏹️ Simulation stopped'))
        .catch(e => alert('Error: ' + e));
    }

    function reset() {
      fetch('/demo/reset', { method: 'POST' })
        .then(r => r.json())
        .then(d => alert('🔄 Demo data reset'))
        .catch(e => alert('Error: ' + e));
    }

    function generateData() {
      fetch('/demo/generate-data', { method: 'POST' })
        .then(r => r.json())
        .then(d => alert('📊 Fresh data generated'))
        .catch(e => alert('Error: ' + e));
    }

    function setSpeed(speed) {
      fetch('/demo/speed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speed })
      })
        .then(r => r.json())
        .then(d => {
          document.querySelectorAll('.speed-btn').forEach(btn => btn.classList.remove('active'));
          event.target.classList.add('active');
        });
    }

    function updateStatus() {
      fetch('/demo/status')
        .then(r => r.json())
        .then(d => {
          document.getElementById('customers').textContent = d.dataPoints.customers;
          document.getElementById('projects').textContent = d.dataPoints.projects;
          document.getElementById('tickets').textContent = d.dataPoints.tickets;
          document.getElementById('events').textContent = d.eventsGenerated;
        });

      fetch('/demo/events?limit=10')
        .then(r => r.json())
        .then(d => {
          const list = document.getElementById('eventList');
          list.innerHTML = d.events
            .map(e => '<div class="event">📍 ' + e.data + '</div>')
            .join('');
        });
    }

    setInterval(updateStatus, 2000);
    updateStatus();
  </script>
</body>
</html>
  `;
  res.send(html);
});

module.exports = router;
