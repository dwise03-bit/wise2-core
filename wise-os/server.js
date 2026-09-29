"use strict";

const express = require("express");
const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");
const { Server } = require("socket.io");
const si = require("systeminformation");

const execFileAsync = promisify(execFile);
const ROOT = __dirname;
const CONFIG_DIR = process.env.WISE2_CONFIG_DIR || path.join(ROOT, "config");
const DATA_DIR = process.env.WISE2_DATA_DIR || path.join(ROOT, "data");
const PORT = Number(process.env.WISE2_PORT || 3000);
const DEMO_MODE = process.env.WISE2_DEMO_MODE === "true";

fs.mkdirSync(DATA_DIR, { recursive: true });

const app = express();
const server = http.createServer(app);
const io = new Server(server, { transports: ["websocket", "polling"], pingInterval: 5000 });
app.disable("x-powered-by");
app.use(express.json({ limit: "64kb" }));
app.use(express.static(path.join(ROOT, "public"), { maxAge: "1h" }));

const readJson = (name, fallback) => {
  try { return JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, name), "utf8")); }
  catch { return fallback; }
};

const commandExists = async (name) => {
  try { await execFileAsync("sh", ["-c", `command -v ${name}`], { timeout: 1500 }); return true; }
  catch { return false; }
};

const interfaces = () => Object.values(os.networkInterfaces()).flat().filter(Boolean);
const hasNetwork = () => interfaces().some((item) => !item.internal && item.family === "IPv4");
const hasUsb = (pattern) => {
  try {
    const roots = ["/sys/bus/usb/devices", "/dev"];
    return roots.some((root) => fs.existsSync(root) && fs.readdirSync(root).some((item) => pattern.test(item)));
  } catch { return false; }
};

async function getSystem() {
  const [load, memory, temperature, disks, network] = await Promise.all([
    si.currentLoad(), si.mem(), si.cpuTemperature(), si.fsSize(), si.networkStats()
  ]);
  const rootDisk = disks.find((disk) => disk.mount === "/") || disks[0] || {};
  return {
    cpu: Math.round(load.currentLoad || 0),
    ram: Math.round((memory.active / memory.total) * 100) || 0,
    ramUsedMb: Math.round(memory.active / 1048576),
    temperature: temperature.main == null ? null : Number(temperature.main.toFixed(1)),
    disk: Math.round(rootDisk.use || 0),
    network: hasNetwork() ? (network.some((item) => item.iface.startsWith("eth")) ? "Ethernet" : "Wi-Fi") : "Offline",
    uptimeSeconds: Math.floor(os.uptime()),
    hostname: os.hostname()
  };
}

async function getSdr() {
  const rtlTools = await commandExists("rtl_test");
  const detected = hasUsb(/rtl|dvb/i);
  const config = readJson("radio_profiles.json", { activeProfile: "PUBLIC SAFETY", profiles: [] });
  return {
    state: detected ? "CONNECTED" : "HARDWARE NOT DETECTED",
    detected,
    toolsInstalled: rtlTools,
    receiveOnly: true,
    profile: config.activeProfile || "NOT CONFIGURED",
    frequency: null,
    modulation: null,
    signalDb: null,
    activity: [],
    recording: false
  };
}

async function getMesh() {
  const configured = Boolean(process.env.MESHTASTIC_HOST || process.env.MESHTASTIC_SERIAL || process.env.MESHTASTIC_MQTT_URL);
  const serial = hasUsb(/ttyUSB|ttyACM/i);
  return { state: configured ? (serial || process.env.MESHTASTIC_HOST ? "CONFIGURED" : "OFFLINE") : "NOT CONFIGURED", nodes: [], visibleNodes: 0, lastPacket: null };
}

async function getGps() {
  const configured = Boolean(process.env.GPSD_HOST || process.env.WISE2_LATITUDE);
  return { state: configured ? "CONFIGURED" : "HARDWARE NOT DETECTED", latitude: null, longitude: null, source: configured ? "configured" : null };
}

function getIncidents() {
  if (!DEMO_MODE) return [];
  return [
    { id: "demo-1", provider: "DEMO", category: "POLICE", title: "Police activity", address: "Main St & 5th Ave", timestamp: new Date(Date.now() - 7 * 60000).toISOString(), severity: "WATCH", distance: 0.8, demo: true },
    { id: "demo-2", provider: "DEMO", category: "TRAFFIC", title: "Traffic collision", address: "Highway 54", timestamp: new Date(Date.now() - 13 * 60000).toISOString(), severity: "INFO", distance: 1.3, demo: true },
    { id: "demo-3", provider: "DEMO", category: "FIRE", title: "Fire response", address: "Oak Ridge Dr", timestamp: new Date(Date.now() - 20 * 60000).toISOString(), severity: "WATCH", distance: 2.1, demo: true }
  ];
}

async function buildStatus() {
  const [system, sdr, mesh, gps] = await Promise.all([getSystem(), getSdr(), getMesh(), getGps()]);
  const providerConfigured = Boolean(process.env.CRIMERADAR_API_URL && process.env.CRIMERADAR_API_TOKEN);
  const wiseConfigured = Boolean(process.env.WISE2_API_URL && process.env.WISE2_DEVICE_TOKEN);
  const tailscaleInstalled = await commandExists("tailscale");
  return {
    core: "ONLINE", dashboard: "ONLINE", demoMode: DEMO_MODE,
    system, sdr, mesh, gps,
    incidents: { state: providerConfigured ? "CONFIGURED" : "CRIMERADAR_PROVIDER_NOT_CONFIGURED", count: getIncidents().length },
    weather: { state: "NOT CONFIGURED", alerts: [] },
    wise2: { state: wiseConfigured ? "CONFIGURED" : "NOT CONFIGURED" },
    tailscale: { state: tailscaleInstalled ? "INSTALLED" : "NOT INSTALLED" },
    lastSync: null,
    timestamp: new Date().toISOString()
  };
}

const asyncRoute = (handler) => async (req, res) => {
  try { await handler(req, res); }
  catch (error) { res.status(503).json({ error: "SERVICE_UNAVAILABLE", detail: error.message }); }
};

app.get("/api/health", (req, res) => res.json({ status: "ok", name: "WISE² Defense IMP", version: "1.0.0" }));
app.get("/api/status", asyncRoute(async (req, res) => res.json(await buildStatus())));
app.get("/api/system", asyncRoute(async (req, res) => res.json(await getSystem())));
app.get("/api/incidents", (req, res) => res.json({ state: DEMO_MODE ? "DEMO DATA" : "CRIMERADAR_PROVIDER_NOT_CONFIGURED", incidents: getIncidents() }));
app.get("/api/incidents/recent", (req, res) => res.json(getIncidents()));
app.get("/api/watch-zones", (req, res) => res.json(readJson("watch_zones.json", [])));
app.get("/api/sdr", asyncRoute(async (req, res) => res.json(await getSdr())));
app.get("/api/sdr/status", asyncRoute(async (req, res) => res.json(await getSdr())));
app.get("/api/mesh", asyncRoute(async (req, res) => res.json(await getMesh())));
app.get("/api/mesh/nodes", (req, res) => res.json([]));
app.get("/api/weather", (req, res) => res.json({ state: "NOT CONFIGURED", alerts: [] }));
app.get("/api/alerts", (req, res) => res.json([]));
app.get("/api/sitrep", asyncRoute(async (req, res) => {
  const status = await buildStatus();
  res.json({
    generatedAt: status.timestamp,
    facts: { incidents: status.incidents.count, sdr: status.sdr.state, mesh: status.mesh.state, weather: status.weather.state, system: "OPERATIONAL" },
    observations: [status.incidents.state, `SDR ${status.sdr.state}`, `MESH ${status.mesh.state}`],
    assessment: status.incidents.count ? "Demo activity is present. Confirm sources before acting." : "No configured live incident feed. Local system monitoring remains operational."
  });
}));
app.post("/api/imp/chat", asyncRoute(async (req, res) => {
  const prompt = String(req.body.message || "").toLowerCase();
  const status = await buildStatus();
  let reply = "AI uplink unavailable. Local defense systems remain operational.";
  if (prompt.includes("system") || prompt.includes("health")) reply = `Core online. CPU ${status.system.cpu} percent, RAM ${status.system.ram} percent, disk ${status.system.disk} percent.`;
  else if (prompt.includes("sdr") || prompt.includes("radio")) reply = `SDR status: ${status.sdr.state}. Receive-only mode is enforced.`;
  else if (prompt.includes("mesh")) reply = `Mesh status: ${status.mesh.state}. ${status.mesh.visibleNodes} visible nodes.`;
  else if (prompt.includes("incident") || prompt.includes("near")) reply = status.incidents.count ? `${status.incidents.count} clearly labeled demo incidents are loaded.` : "No live incident provider is configured.";
  res.json({ reply, source: "LOCAL_OFFLINE", timestamp: new Date().toISOString() });
}));

let latest = null;
setInterval(async () => {
  try { latest = await buildStatus(); if (io.engine.clientsCount) io.emit("status", latest); }
  catch (error) { console.error("status collection failed:", error.message); }
}, 5000).unref();

io.on("connection", async (socket) => {
  try { socket.emit("status", latest || await buildStatus()); } catch {}
});

server.listen(PORT, "0.0.0.0", () => console.log(`WISE² Defense IMP listening on http://0.0.0.0:${PORT}`));

module.exports = { app, server, buildStatus };
