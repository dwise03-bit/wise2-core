"use strict";
const $ = (id) => document.getElementById(id);
const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
const time = (date) => date ? new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "NEVER";
const isPositive = (state) => ["ONLINE", "CONNECTED", "CONFIGURED", "INSTALLED"].includes(state);
const formatUptime = (seconds = 0) => `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
const iconFor = (category) => ({ POLICE: "⬟", FIRE: "♨", EMS: "+", TRAFFIC: "▣", WEATHER: "☁" }[category] || "!");

function stateNode(id, label, state) {
  const node = $(id); if (!node) return;
  node.className = isPositive(state) ? "online" : "offline";
  node.innerHTML = `<i></i>${escapeHtml(label)} ${escapeHtml(state)}`;
}

function renderIncidents(status, incidents) {
  $("incidentCount").textContent = incidents.length;
  $("providerState").textContent = status.incidents.state;
  $("demoBadge").textContent = status.demoMode ? "DEMO DATA" : "";
  const html = incidents.length ? incidents.map((item) => `<div class="incident-item"><i>${iconFor(item.category)}</i><div class="item-copy"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.distance)} mi · ${escapeHtml(item.address)}${item.demo ? " · DEMO" : ""}</small></div><span class="severity ${escapeHtml(item.severity)}">${escapeHtml(item.severity)}</span></div>`).join("") : '<div class="empty">NO LIVE INCIDENTS — PROVIDER NOT CONFIGURED</div>';
  $("incidentList").innerHTML = html;
  $("alertFeed").innerHTML = html;
  $("markers").innerHTML = incidents.map((item, i) => `<div class="marker" style="left:${24 + i * 22}%;top:${30 + (i % 2) * 27}%">${iconFor(item.category)}</div>`).join("");
  $("alertLevel").textContent = incidents.some((i) => i.severity === "CRITICAL") ? "CRITICAL" : incidents.length ? "WATCH" : "INFO";
}

function rows(items) { return items.map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value ?? "—")}</dd></div>`).join(""); }
function metric(label, value, percent) { return `<div class="metric"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}${percent == null ? "" : `<em class="meter"><i style="width:${Math.min(100, percent)}%"></i></em>`}</b></div>`; }

function render(status) {
  $("boot").classList.add("done");
  $("coreState").textContent = status.core;
  $("sdrState").textContent = status.sdr.state;
  $("meshState").textContent = status.mesh.state;
  $("lastUpdate").textContent = new Date(status.timestamp).toLocaleTimeString();
  $("lastSync").textContent = time(status.lastSync);
  $("sdrDetails").innerHTML = rows([["DEVICE", status.sdr.detected ? "RTL-SDR" : "NONE"], ["PROFILE", status.sdr.profile], ["MODE", "RECEIVE ONLY"], ["TOOLS", status.sdr.toolsInstalled ? "INSTALLED" : "NOT INSTALLED"], ["RECORDING", status.sdr.recording ? "ON" : "OFF"]]);
  $("meshDetails").innerHTML = rows([["NODES", status.mesh.visibleNodes], ["STATE", status.mesh.state], ["LAST PACKET", time(status.mesh.lastPacket)], ["TRANSPORT", "NOT ACTIVE"]]);
  const s = status.system;
  $("systemDetails").innerHTML = metric("CPU", `${s.cpu}%`, s.cpu) + metric("RAM", `${s.ram}%`, s.ram) + metric("TEMP", s.temperature == null ? "N/A" : `${s.temperature}°C`) + metric("DISK", `${s.disk}%`, s.disk) + metric("NETWORK", s.network) + metric("UPTIME", formatUptime(s.uptimeSeconds)) + metric("TAILSCALE", status.tailscale.state) + metric("WISE² LINK", status.wise2.state);
  stateNode("edgeStatus", "EDGE", status.core);
  stateNode("wiseStatus", "WISE²", status.wise2.state);
  stateNode("footerSdr", "SDR", status.sdr.state);
  stateNode("footerMesh", "MESH", status.mesh.state);
  stateNode("footerGps", "GPS", status.gps.state);
}

async function refresh() {
  try {
    const [statusRes, incidentRes, zonesRes] = await Promise.all([fetch("/api/status"), fetch("/api/incidents/recent"), fetch("/api/watch-zones")]);
    const [status, incidents, zones] = await Promise.all([statusRes.json(), incidentRes.json(), zonesRes.json()]);
    render(status); renderIncidents(status, incidents); $("zoneCount").textContent = zones.filter((z) => z.enabled).length;
  } catch { $("boot").querySelector(".boot-state").textContent = "LOCAL API UNAVAILABLE — RETRYING"; }
}

async function askImp(message) {
  $("impState").textContent = "THINKING"; $("impAvatar").setAttribute("aria-label", "IMP assistant thinking");
  try {
    const res = await fetch("/api/imp/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message }) });
    const data = await res.json(); $("impMessage").textContent = `“${data.reply}”`;
  } catch { $("impMessage").textContent = "“Local API unavailable. Check the defense service.”"; }
  $("impState").textContent = "IDLE";
}

$("keyboardBtn").addEventListener("click", () => { $("commandForm").hidden = !$("commandForm").hidden; $("commandInput").focus(); });
$("voiceBtn").addEventListener("click", () => { $("impMessage").textContent = "“Push-to-talk hardware is not configured. Keyboard control remains available.”"; });
$("commandForm").addEventListener("submit", (event) => { event.preventDefault(); const value = $("commandInput").value.trim(); if (value) askImp(value); $("commandInput").value = ""; });
document.querySelectorAll("[data-command]").forEach((button) => button.addEventListener("click", () => askImp(button.dataset.command)));

// --- View switching (topbar quick-launch + sidebar sections) ---
function setActiveView(view, label) {
  document.querySelectorAll(".applauncher button[data-view], .side-nav button[data-view]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view && (view !== "placeholder" || btn.dataset.label === label));
  });
  document.querySelectorAll(".view").forEach((panel) => panel.classList.toggle("active", panel.classList.contains(`view-${view}`)));
  if (view === "placeholder") $("placeholderTitle").textContent = (label || "SECTION").toUpperCase();
  if (view === "security") refreshShannon();
}
document.querySelectorAll(".applauncher button[data-view], .side-nav button[data-view]").forEach((button) => {
  button.addEventListener("click", () => setActiveView(button.dataset.view, button.dataset.label));
});
setInterval(() => {
  const now = new Date().toLocaleTimeString([], { hour12: false });
  $("clock").textContent = now; $("topClock").textContent = now.slice(0, 5);
}, 1000);

// --- Sidebar gauges, weather, network ---
const GAUGE_CIRC = 314;
function setGauge(id, valueId, percent, suffix = "%") {
  const circle = $(id), label = $(valueId);
  if (percent == null) { if (label) label.textContent = "N/A"; if (circle) circle.style.strokeDashoffset = GAUGE_CIRC; return; }
  const pct = Math.max(0, Math.min(100, percent));
  if (circle) circle.style.strokeDashoffset = String(GAUGE_CIRC * (1 - pct / 100));
  if (label) label.textContent = `${Math.round(pct)}${suffix}`;
}

async function refreshSystemWidgets() {
  try {
    const [sysRes, weatherRes] = await Promise.all([fetch("/api/system"), fetch("/api/weather")]);
    const [s, w] = await Promise.all([sysRes.json(), weatherRes.json()]);
    setGauge("cpuGauge", "cpuGaugeValue", s.cpu);
    setGauge("gpuGauge", "gpuGaugeValue", s.gpu);
    setGauge("ramGauge", "ramGaugeValue", s.ram);
    setGauge("diskGauge", "diskGaugeValue", s.disk);
    $("netDown").textContent = s.downMbps?.toFixed(1) ?? "0.0";
    $("netUp").textContent = s.upMbps?.toFixed(1) ?? "0.0";
    $("weatherCity").textContent = w.city || "—";
    $("weatherCond").textContent = w.state === "DEMO DATA" ? w.condition : w.state;
    $("weatherTemp").textContent = w.tempF != null ? `${w.tempF}°F` : "--°";
  } catch { /* local API unavailable; widgets keep last known values */ }
}
refreshSystemWidgets(); setInterval(refreshSystemWidgets, 10000);

// --- Security Center (Shannon AI pentester) ---
const levelClass = (level) => ["error", "warning", "note"].includes(level) ? level : "note";

function renderShannonStatus(status) {
  $("shannonState").textContent = status.installed ? status.state : "NOT INSTALLED";
  if (!$("shannonTargetInput").value) $("shannonTargetInput").value = status.target;
  if (!$("shannonRepoInput").value) $("shannonRepoInput").value = status.repo;
  [$("shannonScanBtn"), $("shannonScanBtn2")].forEach((btn) => {
    btn.disabled = status.running;
    btn.textContent = status.running ? "⏳ SCANNING…" : (btn.id === "shannonScanBtn" ? "▶ New Scan" : "▶ Start Scan");
  });
  $("statTargets").textContent = status.scanCount ?? 0;
  $("statFindings").textContent = status.findingCount ?? 0;
  $("statExploits").textContent = status.findingCount ?? 0; // Shannon only reports findings it has already exploited ("no exploit, no report")
  $("statErrors").textContent = status.counts?.error ?? 0;
  $("statWarnings").textContent = status.counts?.warning ?? 0;
  $("statLastScan").textContent = status.finishedAt ? time(status.finishedAt) : (status.workspace ? "RUN" : "—");
  $("integSarif").textContent = status.sarifAvailable ? "report.sarif ready" : "NO REPORT YET";
  renderDonut(status.counts || {});
  updatePhases(status);
}

function renderDonut(counts) {
  const total = (counts.error || 0) + (counts.warning || 0) + (counts.note || 0);
  $("donutTotal").textContent = total;
  $("legendError").textContent = counts.error || 0;
  $("legendWarning").textContent = counts.warning || 0;
  $("legendNote").textContent = counts.note || 0;
  const circ = 314, segs = [["donutError", counts.error || 0], ["donutWarning", counts.warning || 0], ["donutNote", counts.note || 0]];
  let offset = 0;
  segs.forEach(([id, count]) => {
    const length = total ? (count / total) * circ : 0;
    const el = $(id);
    el.style.strokeDasharray = `${length} ${circ - length}`;
    el.style.strokeDashoffset = String(-offset);
    offset += length;
  });
}

const PHASE_KEYWORDS = [["recon", /recon|mapping|endpoint/i], ["deps", /dependenc/i], ["scan", /vulnerab|injection|xss|ssrf/i], ["exploit", /exploit/i], ["report", /report|sarif|pdf/i]];
function updatePhases(status) {
  const items = document.querySelectorAll("#phaseList li");
  if (!status.running && status.state !== "COMPLETED") { items.forEach((li) => li.classList.remove("active", "done")); return; }
  if (status.state === "COMPLETED" && !status.running) { items.forEach((li) => li.classList.add("done")); return; }
}
function markPhaseFromLog(line) {
  const idx = PHASE_KEYWORDS.findIndex(([, re]) => re.test(line));
  if (idx === -1) return;
  const items = document.querySelectorAll("#phaseList li");
  items.forEach((li, i) => { if (i < idx) li.classList.add("done"); if (i === idx) { li.classList.add("active"); li.classList.remove("done"); } });
}

function renderShannonFindings(findings) {
  const top = findings.slice(0, 8);
  $("shannonFindingsMeta").textContent = findings.length ? `${findings.length} FOUND` : "";
  $("shannonFindings").innerHTML = top.length
    ? top.map((f) => `<div class="finding-item"><span class="level ${levelClass(f.level)}">${escapeHtml(f.level)}</span><div><small class="rule">${escapeHtml(f.rule)}</small><span class="message">${escapeHtml(f.message)}</span>${f.file ? `<small class="location">${escapeHtml(f.file)}${f.line ? ":" + f.line : ""}</small>` : ""}</div></div>`).join("")
    : '<div class="empty">NO FINDINGS — RUN A SCAN</div>';
}

function renderScansTable(scans) {
  $("scansMeta").textContent = scans.length ? `${scans.length} SHOWN` : "";
  $("scansTableBody").innerHTML = scans.length
    ? scans.map((s) => `<tr><td>${escapeHtml(s.target)}</td><td><span class="state-chip ${escapeHtml(s.state)}">${escapeHtml(s.state)}</span></td><td>${s.findingCount}</td><td>${time(s.updatedAt)}</td></tr>`).join("")
    : '<tr><td colspan="4" class="empty">NO SCANS YET</td></tr>';
}

async function refreshShannon() {
  try {
    const [statusRes, findingsRes, scansRes, healthRes] = await Promise.all([fetch("/api/shannon/status"), fetch("/api/shannon/findings"), fetch("/api/shannon/scans"), fetch("/api/status")]);
    const [status, findings, scans, health] = await Promise.all([statusRes.json(), findingsRes.json(), scansRes.json(), healthRes.json()]);
    renderShannonStatus(status); renderShannonFindings(findings); renderScansTable(scans);
    $("integDocker").textContent = health.docker?.state || "CHECKING";
    $("impDockerReady").textContent = health.docker?.state === "INSTALLED" ? "Docker Running" : "Docker Not Installed";
    $("impTailscaleReady").textContent = health.tailscale?.state === "INSTALLED" ? "Tailscale Connected" : "Tailscale Not Installed";
    $("impShannonReady").textContent = status.installed ? "Shannon Ready" : "Shannon Not Installed";
  } catch { $("shannonState").textContent = "LOCAL API UNAVAILABLE"; }
}

function appendTerminalLine(line) {
  const term = $("shannonTerminal");
  if (term.querySelector(".empty")) term.innerHTML = "";
  const div = document.createElement("div"); div.className = "line"; div.textContent = line;
  term.appendChild(div); term.scrollTop = term.scrollHeight;
  markPhaseFromLog(line);
}

async function startScan() {
  const target = $("shannonTargetInput").value.trim();
  const repo = $("shannonRepoInput").value.trim();
  $("shannonTerminal").innerHTML = "";
  document.querySelectorAll("#phaseList li").forEach((li) => li.classList.remove("active", "done"));
  try {
    const res = await fetch("/api/shannon/scan", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ target, repo }) });
    if (!res.ok) { const err = await res.json(); appendTerminalLine(`[wise2-dashboard] scan not started: ${err.error}`); return; }
    refreshShannon();
  } catch { appendTerminalLine("[wise2-dashboard] local API unavailable."); }
}
$("shannonScanBtn").addEventListener("click", startScan);
$("shannonScanBtn2").addEventListener("click", startScan);

// Security Center tabs: all content already lives on one page (nothing here is
// a separate route), so a tab click scrolls to the matching card instead of
// faking a page that doesn't exist.
const TAB_TARGETS = { dashboard: ".hero-row", target: ".target-controls", live: ".terminal-panel", findings: ".security-bottom .findings", exploit: ".scan-progress", reports: ".integrations", integrations: ".integrations", settings: ".target-controls" };
document.querySelectorAll(".tab-btn").forEach((btn) => btn.addEventListener("click", () => {
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  document.querySelector(TAB_TARGETS[btn.dataset.tab])?.scrollIntoView({ behavior: "smooth", block: "start" });
}));

const socket = io({ transports: ["websocket", "polling"] });
socket.on("status", render);
socket.on("shannon:log", appendTerminalLine);
socket.on("shannon:status", (status) => { renderShannonStatus(status); refreshShannon(); });

refresh(); setInterval(refresh, 30000);
if (document.querySelector(".view-security.active")) refreshShannon();
setInterval(() => { if (document.querySelector(".view-security.active")) refreshShannon(); }, 10000);
