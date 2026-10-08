import { mountLIECameraPanel } from "./traffic-feed.js";

const CONFIG = window.EDT_CONFIG || { TRAFFIC_FEED_MODE: "mock" };

/* DEMO DATA — NOT LIVE. Fictional values for layout and interaction only. */
const DEMO_PULSE = [
  { symbol: "SPY", changePct: 0.42, points: [4, 5, 4, 6, 7, 6, 8] },
  { symbol: "QQQ", changePct: 0.67, points: [5, 5, 6, 6, 7, 8, 9] },
  { symbol: "NVDA", changePct: -1.18, points: [9, 8, 8, 7, 6, 6, 5] },
  { symbol: "AAPL", changePct: -0.24, points: [6, 7, 6, 6, 5, 6, 5] },
];
const DEMO_POSITIONS = [
  { id: "p1", symbol: "SPY", thesis: "Trend hold above 20-day average", status: "Open", reviewed: false },
  { id: "p2", symbol: "NVDA", thesis: "Pullback to prior range support", status: "Closed", reviewed: true },
];
const DEMO_JOURNAL = [
  { date: "Demo · Day 3", note: "Waited for confirmation. Skipped the open. Plan followed." },
  { date: "Demo · Day 4", note: "Stop hit at planned level. Logged it and moved on." },
];
const DEMO_WATCHLIST = [
  { symbol: "QQQ", why: "Trend context for the setup" },
  { symbol: "AAPL", why: "Earnings-date review pending" },
  { symbol: "NVDA", why: "Volatility check before any plan" },
];

const fmtPct = (n) => `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;

function sparkline(points, up) {
  const w = 64, h = 22, max = Math.max(...points), min = Math.min(...points);
  const step = w / (points.length - 1);
  const d = points
    .map((p, i) => `${i ? "L" : "M"}${(i * step).toFixed(1)},${(h - ((p - min) / (max - min || 1)) * h).toFixed(1)}`)
    .join(" ");
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true" class="${up ? "up" : "down"}"><path d="${d}" fill="none" stroke-width="1.6" stroke-linecap="round"/></svg>`;
}

function renderPulse() {
  const list = document.getElementById("pulse-list");
  list.innerHTML = DEMO_PULSE.map(
    (r) => `<li class="pulse-row">
      <span class="sym">${r.symbol}</span>
      ${sparkline(r.points, r.changePct >= 0)}
      <span class="chg ${r.changePct >= 0 ? "up" : "down"}">${fmtPct(r.changePct)}</span>
    </li>`
  ).join("");
}

/* Command center tabs */
const panel = document.getElementById("panel");
const tabs = [...document.querySelectorAll('[role="tab"]')];

function paperTab() {
  return `<h3>Paper positions <span class="badge badge-demo">DEMO DATA</span></h3>
  <ul class="rows">${DEMO_POSITIONS.map(
    (p) => `<li>
      <div><strong>${p.symbol}</strong> · ${p.status}<br><span class="muted">${p.thesis}</span></div>
      <button class="btn btn-small" type="button" data-review="${p.id}" aria-pressed="${p.reviewed}">${p.reviewed ? "Reviewed ✓" : "Mark reviewed"}</button>
    </li>`
  ).join("")}</ul>
  <p class="fine">Positions are practice records, not orders. No brokerage is connected.</p>`;
}
function journalTab() {
  return `<h3>Journal <span class="badge badge-demo">DEMO DATA</span></h3>
  <ul class="rows">${DEMO_JOURNAL.map((j) => `<li><div><span class="muted">${j.date}</span><br>${j.note}</div></li>`).join("")}</ul>`;
}
function watchlistTab() {
  return `<h3>Watchlist <span class="badge badge-demo">DEMO DATA</span></h3>
  <ul class="rows">${DEMO_WATCHLIST.map((w) => `<li><div><strong>${w.symbol}</strong><br><span class="muted">${w.why}</span></div></li>`).join("")}</ul>`;
}
function setupTab() {
  return `<h3>Setup Builder</h3>
  <p class="muted">Enter a practice plan. Size is whole shares only, based on the stop distance and your risk budget.</p>
  <form id="setup-form" class="setup-form">
    <label>Entry <input name="entry" type="number" step="0.01" min="0" value="50" inputmode="decimal"></label>
    <label>Stop <input name="stop" type="number" step="0.01" min="0" value="48" inputmode="decimal"></label>
    <label>Risk budget ($) <input name="risk" type="number" step="1" min="0" value="25" inputmode="decimal"></label>
  </form>
  <output id="setup-out" class="setup-out" aria-live="polite"></output>
  <p class="fine">Planned risk only. Gaps and slippage can produce larger losses.</p>`;
}

function computeSetup(form) {
  const entry = Number(form.entry.value), stop = Number(form.stop.value), risk = Number(form.risk.value);
  if (!(entry > 0 && stop > 0 && risk > 0)) return "Enter positive values for entry, stop, and risk.";
  if (entry <= stop) return "Entry must be above the stop for a long practice plan.";
  const perShare = entry - stop;
  const shares = Math.floor(risk / perShare);
  if (shares === 0) return "Risk budget is too small for one share at this stop distance.";
  return `${shares} whole share${shares === 1 ? "" : "s"} · planned risk $${(shares * perShare).toFixed(2)} · stop distance $${perShare.toFixed(2)}/share`;
}

function showTab(name) {
  const views = { paper: paperTab, journal: journalTab, watchlist: watchlistTab, setup: setupTab };
  tabs.forEach((t) => {
    const on = t.dataset.tab === name;
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    if (on) panel.setAttribute("aria-labelledby", t.id);
  });
  panel.innerHTML = views[name]();
  if (name === "setup") {
    const form = document.getElementById("setup-form");
    const out = document.getElementById("setup-out");
    const update = () => (out.textContent = computeSetup(form));
    form.addEventListener("input", update);
    update();
  }
}

tabs.forEach((t, i) => {
  t.addEventListener("click", () => showTab(t.dataset.tab));
  t.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    next.focus();
    showTab(next.dataset.tab);
  });
});

panel.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-review]");
  if (!btn) return;
  const pos = DEMO_POSITIONS.find((p) => p.id === btn.dataset.review);
  pos.reviewed = !pos.reviewed;
  showTab("paper");
});

/* Mobile menu */
const toggle = document.querySelector(".nav-toggle");
const menu = document.getElementById("mobile-menu");
toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") !== "true";
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menu.hidden = !open;
});
menu.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    menu.hidden = true;
  })
);

/* Nav surface on scroll */
const nav = document.querySelector(".nav");
const onScroll = () => (nav.dataset.scrolled = String(window.scrollY > 24));
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* Signup: front-end only. No fake success message. */
document.getElementById("signup-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("signup-email");
  const note = document.getElementById("signup-note");
  if (!input.checkValidity()) {
    note.textContent = "Enter a valid email address to continue the demo.";
    input.focus();
    return;
  }
  note.textContent = "Front-end demo. Signup is not connected to a backend yet, so nothing was sent.";
});

renderPulse();
showTab("paper");
mountLIECameraPanel(CONFIG);
