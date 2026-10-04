"use strict";

const express = require("express");
const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile, spawn } = require("child_process");
const { promisify } = require("util");
const { Server } = require("socket.io");
const si = require("systeminformation");

const execFileAsync = promisify(execFile);
const ROOT = __dirname;
const CONFIG_DIR = process.env.WISE2_CONFIG_DIR || path.join(ROOT, "config");
const DATA_DIR = process.env.WISE2_DATA_DIR || path.join(ROOT, "data");
const PORT = Number(process.env.WISE2_PORT || 3000);
const DEMO_MODE = process.env.WISE2_DEMO_MODE === "true";

const SHANNON_BIN = process.env.WISE2_SHANNON_BIN || path.join(os.homedir(), ".local", "bin", "wise2-shannon");
const SHANNON_WORKSPACES_DIR = process.env.WISE2_SHANNON_WORKSPACES_DIR || path.join(os.homedir(), ".shannon", "workspaces");
const SHANNON_DEFAULT_TARGET = process.env.WISE2_SHANNON_TARGET || "http://127.0.0.1:3080";
const SHANNON_DEFAULT_REPO = process.env.WISE2_SHANNON_REPO || "/opt/wise2/core";

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
  const [load, memory, temperature, disks, network, graphics] = await Promise.all([
    si.currentLoad(), si.mem(), si.cpuTemperature(), si.fsSize(), si.networkStats(), si.graphics().catch(() => null)
  ]);
  const rootDisk = disks.find((disk) => disk.mount === "/") || disks[0] || {};
  const gpuController = graphics?.controllers?.find((c) => c.utilizationGpu != null);
  const totalRxSec = network.reduce((sum, item) => sum + (item.rx_sec || 0), 0);
  const totalTxSec = network.reduce((sum, item) => sum + (item.tx_sec || 0), 0);
  return {
    cpu: Math.round(load.currentLoad || 0),
    gpu: gpuController ? Math.round(gpuController.utilizationGpu) : null,
    ram: Math.round((memory.active / memory.total) * 100) || 0,
    ramUsedMb: Math.round(memory.active / 1048576),
    temperature: temperature.main == null ? null : Number(temperature.main.toFixed(1)),
    disk: Math.round(rootDisk.use || 0),
    network: hasNetwork() ? (network.some((item) => item.iface.startsWith("eth")) ? "Ethernet" : "Wi-Fi") : "Offline",
    downMbps: Number(((totalRxSec * 8) / 1e6).toFixed(1)),
    upMbps: Number(((totalTxSec * 8) / 1e6).toFixed(1)),
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

// --- Shannon (AI pentester, github.com/KeygraphHQ/shannon) integration ---
// The dashboard never runs exploits itself; it shells out to the wise2-shannon
// wrapper (installed by install-shannon.sh) and reads the workspace it writes.
let shannonScan = null; // { workspace, target, repo, state, startedAt, finishedAt, exitCode }

function listShannonWorkspaces() {
  try {
    return fs.readdirSync(SHANNON_WORKSPACES_DIR)
      .map((name) => {
        const full = path.join(SHANNON_WORKSPACES_DIR, name);
        const stat = fs.statSync(full);
        return { name, full, mtimeMs: stat.mtimeMs };
      })
      .filter((item) => fs.statSync(item.full).isDirectory())
      .sort((a, b) => b.mtimeMs - a.mtimeMs);
  } catch {
    return [];
  }
}

function workspaceReportState(workspaceDir) {
  const hasReport = fs.existsSync(path.join(workspaceDir, "Security-Assessment-Report.md")) ||
    fs.existsSync(path.join(workspaceDir, "Security-Assessment-Report.pdf"));
  const hasSarif = fs.existsSync(path.join(workspaceDir, "report.sarif"));
  if (hasReport) return "COMPLETED";
  if (fs.existsSync(path.join(workspaceDir, ".shannon"))) return "INCOMPLETE";
  return hasSarif ? "COMPLETED" : "UNKNOWN";
}

// SARIF 2.1.0: level is derived by Shannon from severity (critical/high -> error,
// medium -> warning, else -> note). The original critical/high split isn't
// recoverable from SARIF alone, so the UI shows the SARIF level, not a
// fabricated severity.
function parseShannonSarif(workspaceDir) {
  try {
    const raw = fs.readFileSync(path.join(workspaceDir, "report.sarif"), "utf8");
    const doc = JSON.parse(raw);
    const results = doc.runs?.[0]?.results || [];
    return results.map((result, index) => {
      const location = result.locations?.[0]?.physicalLocation;
      return {
        id: `${index}`,
        rule: result.ruleId || "shannon/miscellaneous",
        level: result.level || "note",
        message: result.message?.text || "",
        file: location?.artifactLocation?.uri || null,
        line: location?.region?.startLine ?? null
      };
    });
  } catch {
    return [];
  }
}

// Workspace names are auto-generated as "<host>_shannon-<session-id>" (see
// docs/workspaces.md); recover a readable target label from that prefix.
// This is a display convenience, not data Shannon itself stores per-workspace.
function workspaceDisplayName(name) {
  return name.replace(/_shannon-\d+$/, "") || name;
}

// Shannon only names its workspace directory once it actually starts
// running (see docs/workspaces.md), so there is no name to match against
// the moment a scan is launched. Instead, while a scan is RUNNING, treat
// the newest workspace created since that scan's startedAt as "the" active
// one. Before that workspace exists on disk, there is nothing to point at
// yet, and the caller should treat findings as not-yet-available rather
// than stale data from a previous run.
function activeWorkspace(workspaces) {
  if (shannonScan?.state !== "RUNNING" || !shannonScan.startedAt) return null;
  const startedMs = Date.parse(shannonScan.startedAt);
  return workspaces.find((item) => item.mtimeMs >= startedMs) || null;
}

function listShannonScans(limit = 10) {
  const workspaces = listShannonWorkspaces();
  const active = activeWorkspace(workspaces);
  return workspaces.slice(0, limit).map((item) => {
    const findings = parseShannonSarif(item.full);
    const counts = findings.reduce((acc, f) => { acc[f.level] = (acc[f.level] || 0) + 1; return acc; }, {});
    return {
      workspace: item.name,
      target: workspaceDisplayName(item.name),
      state: active?.name === item.name ? "RUNNING" : workspaceReportState(item.full),
      findingCount: findings.length,
      counts,
      updatedAt: new Date(item.mtimeMs).toISOString()
    };
  });
}

async function getShannonStatus() {
  const installed = fs.existsSync(SHANNON_BIN);
  const workspaces = listShannonWorkspaces();
  const active = activeWorkspace(workspaces);
  const running = shannonScan?.state === "RUNNING";
  const launchError = shannonScan?.state === "ERROR";
  // While running, only count findings from the workspace this run created
  // (if Shannon has created it yet) — never from an older, unrelated scan.
  const current = running ? active : workspaces[0] || null;
  const findings = current ? parseShannonSarif(current.full) : [];
  const counts = findings.reduce((acc, f) => { acc[f.level] = (acc[f.level] || 0) + 1; return acc; }, {});
  return {
    installed,
    target: shannonScan?.target || SHANNON_DEFAULT_TARGET,
    repo: shannonScan?.repo || SHANNON_DEFAULT_REPO,
    running,
    workspace: current?.name || null,
    // A failed launch (e.g. the binary is missing) must not be masked by
    // whatever an earlier, unrelated scan's workspace happens to show.
    state: running ? "RUNNING" : launchError ? "LAUNCH_ERROR" : (current ? workspaceReportState(current.full) : "NOT_RUN"),
    findingCount: findings.length,
    counts,
    scanCount: workspaces.length,
    sarifAvailable: current ? fs.existsSync(path.join(current.full, "report.sarif")) : false,
    startedAt: shannonScan?.startedAt || null,
    finishedAt: shannonScan?.finishedAt || null
  };
}

function getWeather() {
  if (!DEMO_MODE) return { state: "NOT CONFIGURED", city: null, tempF: null, condition: null, alerts: [] };
  return { state: "DEMO DATA", city: "Atlanta, GA", tempF: 72, condition: "Partly Cloudy", alerts: [] };
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
  const [tailscaleInstalled, dockerInstalled] = await Promise.all([commandExists("tailscale"), commandExists("docker")]);
  return {
    core: "ONLINE", dashboard: "ONLINE", demoMode: DEMO_MODE,
    system, sdr, mesh, gps,
    incidents: { state: providerConfigured ? "CONFIGURED" : "CRIMERADAR_PROVIDER_NOT_CONFIGURED", count: getIncidents().length },
    weather: getWeather(),
    wise2: { state: wiseConfigured ? "CONFIGURED" : "NOT CONFIGURED" },
    tailscale: { state: tailscaleInstalled ? "INSTALLED" : "NOT INSTALLED" },
    docker: { state: dockerInstalled ? "INSTALLED" : "NOT INSTALLED" },
    lastSync: null,
    timestamp: new Date().toISOString()
  };
}

const asyncRoute = (handler) => async (req, res) => {
  try { await handler(req, res); }
  catch (error) { res.status(503).json({ error: "SERVICE_UNAVAILABLE", detail: error.message }); }
};

app.get("/api/health", (req, res) => res.json({ status: "ok", name: "WISE² Command Center", version: "1.0.0" }));
app.get("/api/shannon/status", asyncRoute(async (req, res) => res.json(await getShannonStatus())));
app.get("/api/shannon/scans", (req, res) => res.json(listShannonScans()));
app.get("/api/shannon/findings", (req, res) => {
  const latest = listShannonWorkspaces()[0];
  res.json(latest ? parseShannonSarif(latest.full) : []);
});
app.post("/api/shannon/scan", asyncRoute(async (req, res) => {
  if (!fs.existsSync(SHANNON_BIN)) return res.status(503).json({ error: "SHANNON_NOT_INSTALLED" });
  if (shannonScan?.state === "RUNNING") return res.status(409).json({ error: "SCAN_ALREADY_RUNNING" });
  const target = String(req.body.target || SHANNON_DEFAULT_TARGET).trim();
  const repo = String(req.body.repo || SHANNON_DEFAULT_REPO).trim();
  if (!/^https?:\/\//.test(target)) return res.status(400).json({ error: "INVALID_TARGET" });

  shannonScan = { workspace: null, target, repo, state: "RUNNING", startedAt: new Date().toISOString(), finishedAt: null, exitCode: null };
  // No shell is invoked: args are passed as an array, not interpolated into a command string.
  const child = spawn(SHANNON_BIN, ["-u", target, "-r", repo], { stdio: ["ignore", "pipe", "pipe"] });
  const emitLine = (line) => { if (line.trim()) io.emit("shannon:log", line); };
  child.stdout.on("data", (chunk) => String(chunk).split("\n").forEach(emitLine));
  child.stderr.on("data", (chunk) => String(chunk).split("\n").forEach(emitLine));
  // A spawn that fails to launch at all (bad path, EACCES, ...) emits BOTH
  // 'error' and 'close' — 'close' must not clobber the state 'error' sets.
  let launchFailed = false;
  child.on("close", async (exitCode) => {
    if (launchFailed) return;
    shannonScan = { ...shannonScan, state: "DONE", finishedAt: new Date().toISOString(), exitCode };
    io.emit("shannon:status", await getShannonStatus());
  });
  child.on("error", async (error) => {
    launchFailed = true;
    shannonScan = { ...shannonScan, state: "ERROR", finishedAt: new Date().toISOString(), exitCode: null };
    io.emit("shannon:log", `[wise2-dashboard] failed to launch wise2-shannon: ${error.message}`);
    io.emit("shannon:status", await getShannonStatus());
  });
  res.json({ started: true, target, repo });
}));
app.get("/api/status", asyncRoute(async (req, res) => res.json(await buildStatus())));
app.get("/api/system", asyncRoute(async (req, res) => res.json(await getSystem())));
app.get("/api/incidents", (req, res) => res.json({ state: DEMO_MODE ? "DEMO DATA" : "CRIMERADAR_PROVIDER_NOT_CONFIGURED", incidents: getIncidents() }));
app.get("/api/incidents/recent", (req, res) => res.json(getIncidents()));
app.get("/api/watch-zones", (req, res) => res.json(readJson("watch_zones.json", [])));
app.get("/api/sdr", asyncRoute(async (req, res) => res.json(await getSdr())));
app.get("/api/sdr/status", asyncRoute(async (req, res) => res.json(await getSdr())));
app.get("/api/mesh", asyncRoute(async (req, res) => res.json(await getMesh())));
app.get("/api/mesh/nodes", (req, res) => res.json([]));
app.get("/api/weather", (req, res) => res.json(getWeather()));
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

const HOST = process.env.WISE2_HOST || "0.0.0.0";
server.listen(PORT, HOST, () => console.log(`WISE² Command Center listening on http://${HOST}:${server.address().port}`));

module.exports = { app, server, buildStatus };
