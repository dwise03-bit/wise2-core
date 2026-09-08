"use client";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import { useState } from "react";
import "./dashboard.css";

const areas = [
  [
    "PRESSURE WASHING",
    "GET DOWN",
    "8 Active Tasks",
    "3 Opportunities",
    "Website in Progress",
    "REAPER",
    "◉",
  ],
  [
    "TRUCK WISER",
    "",
    "12 Active Jobs",
    "4 Trucks Online",
    "2 Service Alerts",
    "TRUCK WISER",
    "▣",
  ],
  [
    "CREATIVE STUDIO",
    "",
    "5 Campaigns",
    "2 In Production",
    "Water Gorilla Ready",
    "CREATIVE",
    "✦",
  ],
  [
    "SALES & CRM",
    "",
    "14 New Leads",
    "6 In Pipeline",
    "2 Proposals Out",
    "SALES AGENT",
    "↗",
  ],
  [
    "OPERATIONS",
    "",
    "23 Open Tasks",
    "4 At Risk",
    "7 Waiting on Approval",
    "PROJECT AGENT",
    "⚙",
  ],
  [
    "PEOPLE & PARTNERS",
    "",
    "18 People",
    "6 Contractors",
    "4 Active Conversations",
    "MEMORY AGENT",
    "♙",
  ],
];
const nav = [
  "World",
  "Companies",
  "Projects",
  "People",
  "Tasks",
  "Opportunities",
  "REAPER",
  "TRUCK WISER",
  "Content",
  "Finance",
  "Documents",
  "Calendar",
  "Discord",
  "Settings",
];
export default function CommandCenterPage() {
  const { status } = useSystemStatus(30000);
  const [selected, setSelected] = useState("World");
  const [message, setMessage] = useState("");
  const [command, setCommand] = useState("");
  const act = (value: string) => { setMessage(value); window.setTimeout(() => setMessage(""), 2500); };
  return (
    <main className="world-shell">
      <aside className="world-sidebar">
        <div className="world-logo">
          <span>◈</span>
          <div>
            <b>WISE²</b>
            <small>
              WORK INTELLIGENCE
              <br />
              SCALES EVERYTHING
            </small>
          </div>
        </div>
        {nav.map((n, i) => (
          <button className={"world-nav " + (selected === n ? "active" : "")} key={n} onClick={() => { setSelected(n); act(`${n} selected`); }}>
            <span>
              {
                [
                  "◉",
                  "▥",
                  "▣",
                  "♙",
                  "☑",
                  "◇",
                  "◉",
                  "▣",
                  "▤",
                  "$",
                  "▧",
                  "▦",
                  "◉",
                  "⚙",
                ][i]
              }
            </span>
            {n}
          </button>
        ))}
        <p className="sidebar-tag">
          MORE
          <br />
          BUSINESS.
          <br />
          LESS CHAOS.
          <br />A WISER WAY.
        </p>
      </aside>
      <section className="world-main">
        <header className="world-header">
          <div>
            <h1>WISE² COMMAND WORLD</h1>
            <nav>
              People　+　AI Agents　+　Projects　+　Opportunities　+　Real
              Results
            </nav>
          </div>
          <div className="world-user">
            <div className="search">Search anything...　⌕</div>
            <span className="avatar">D</span>
            <b>
              Danny<small>Owner / Operator</small>
            </b>
            ⌄
          </div>
        </header>
        <div className="world-map">
          <div className="map-title">
            <b>CONTEXT ENGINE</b>
            <small>
              Everything Connected
              <br />
              Everyone in Sync
              <br />
              AI That Works
            </small>
          </div>
          <div className="map-core">
            ◈<b>WISE²</b>
          </div>
          {areas.map((a, i) => (
            <article className={"district d" + i} key={a[0]}>
              <h3>
                {a[0]}
                <small>{a[1]}</small>
              </h3>
              <ul>
                <li>{a[2]}</li>
                <li>{a[3]}</li>
                <li>{a[4]}</li>
              </ul>
              <button onClick={() => act(`${a[0]} opened`)}>View</button>
              <div className="agent">
                {a[6]}
                <small>{a[5]}</small>
              </div>
            </article>
          ))}
          <aside className="activity">
            <h2>
              <i /> Live Activity{" "}
              <select>
                <option>All Activity</option>
              </select>
            </h2>
            {[
              "REAPER — Checked Robert’s Google reviews",
              "Sales Agent — Found a new upsell opportunity",
              "Creative — Completed Water Gorilla draft",
              "TRUCK WISER — New job request received",
              "Project Agent — 3 tasks waiting for approval",
              "Memory Agent — Connected 6 new pieces of info",
              "System — Synced with Discord",
              "REAPER — Flagged a potential risk",
            ].map((x, i) => (
              <p key={i}>
                <span>{["◉", "♧", "✦", "▣", "✺", "♙", "▣", "◉"][i]}</span>
                <b>
                  {x.split(" — ")[0]}
                  <small>{x.split(" — ")[1]}</small>
                </b>
                <time>{i * 3 + 2}m ago</time>
              </p>
            ))}
          </aside>
        </div>
        <div className="kpis">
          {[
            ["▣", "—", "Active Projects · API pending"],
            ["☑", "—", "Open Tasks · API pending"],
            ["↗", "—", "Opportunities · API pending"],
            ["♧", status.gpuAi.ollamaModels === "Ready" ? String(status.wise2Core.modelCount) : "0", "Local AI Models"],
            ["$", "—", "Potential Revenue · API pending"],
            ["▣", `${status.vpsOps.docker.healthy}/${status.vpsOps.docker.total}`, "VPS Services Healthy"],
            ["◉", status.vpsOps.wise2net, "Wise2.net Status"],
          ].map((k) => (
            <div key={k[2]}>
              <span>{k[0]}</span>
              <b>
                {k[1]}
                <small>{k[2]}</small>
              </b>
            </div>
          ))}
        </div>
        <div className="bottom-grid">
          <div className="ask">
            <span>◈</span>
            <div>
              <b>
                Ask WISE²{" "}
                <small>Ask anything. Or let your agents get to work.</small>
              </b>
              <input value={command} onChange={(e) => setCommand(e.target.value)} onKeyDown={(e) => e.key === "Enter" && act(command || "Command received")} placeholder="Ask WISE² or give a command..." />
              <div className="chips">
                {[
                  "Give me a project update",
                  "Have REAPER run an audit",
                  "Find new opportunities",
                  "Show me at-risk tasks",
                  "Plan next week",
                ].map((x) => (
                  <button key={x} onClick={() => { setCommand(x); act(x); }}>{x}</button>
                ))}
              </div>
            </div>
            <button className="send" onClick={() => act(command || "Ready for a command")}>➤</button>
          </div>
          <div className="quick">
            <h3>Quick Actions</h3>
            {[
              "▣ New Project",
              "♙ Add Lead",
              "☑ Create Task",
              "♧ Run REAPER Content",
              "♨ Generate Creep",
              "◉ Sync All",
            ].map((x) => (
              <button key={x} onClick={() => act(x.replace(/^[^ ]+ /, "") + " selected")}>{x}</button>
            ))}
          </div>
        </div>
        {message && <div className="toast" role="status">{message}</div>}<div className="system-line">
          <i className={status.access.tailscale === "Connected" ? "on" : ""} />{" "}
          SYSTEMS SYNCHRONIZED <span>LIVE STATUS CONNECTED</span>
        </div>
      </section>
    </main>
  );
}
