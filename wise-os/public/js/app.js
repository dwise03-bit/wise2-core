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
document.querySelectorAll(".nav button").forEach((button) => button.addEventListener("click", () => { document.querySelectorAll(".nav button").forEach((item) => item.classList.remove("active")); button.classList.add("active"); askImp(`${button.dataset.view} status`); }));
setInterval(() => { $("clock").textContent = new Date().toLocaleTimeString([], { hour12: false }); }, 1000);
const socket = io({ transports: ["websocket", "polling"] }); socket.on("status", render);
refresh(); setInterval(refresh, 30000);
