"use client";
import { useEffect, useState } from "react";
type Node = { name:string; role:string; status:"unverified"|"online"|"offline"; endpoint?:string };
const nodes:Node[]=[
 {name:"GPU VPS",role:"Hermes / Database",status:"unverified"},
 {name:"WISE² Surface",role:"Linux Command Center",status:"unverified"},
 {name:"MacBook",role:"Development Workstation",status:"unverified"},
 {name:"Pocket Node",role:"Edge AI / Voice",status:"unverified"},
 {name:"Pixel Slate",role:"Display / Linux",status:"unverified"},
 {name:"Raspberry Pi",role:"Edge Agent",status:"unverified"},
 {name:"Mobile Devices",role:"Companion Interfaces",status:"unverified"}
];
const services=[
 {name:"Hermes",purpose:"Second Brain memory and orchestration",href:"/hive"},
 {name:"Git Assassin",purpose:"GitHub research and draft implementation PRs",href:"/git-assassin"},
 {name:"Living Hive",purpose:"Approvals, alerts, command interface",href:"/hive"},
 {name:"Sound Lab",purpose:"Creative AI and audio production",href:"/soundlab"},
 {name:"Everyday Trader",purpose:"Trading analytics and AI insights",href:"/every-day-trader"},
 {name:"WISE² Linux",purpose:"Workstation and security agent fleet",href:"/hive"}
];
const stages=["Discover Devices","Verify Hermes Endpoints","Install Agents","Configure Encrypted Reporting","Initialize Second Brain DB","Enable Data Routing","Verify & Monitor"];
export default function ConnectPage(){
 const [now,setNow]=useState<string>(""); const [view,setView]=useState<"overview"|"devices"|"implementation">("overview");
 useEffect(()=>{setNow(new Date().toLocaleString());},[]);
 return <main style={{minHeight:"100vh",background:"radial-gradient(ellipse at 55% 0%,#13356c 0%,#080e23 45%,#030813 100%)",color:"#e7efff",fontFamily:"system-ui",padding:"clamp(16px,3vw,40px)"}}>
 <style>{`@keyframes glow{50%{box-shadow:0 0 24px #32bcff55}} .wise-panel{background:#08162ccf;border:1px solid #254b84;border-radius:14px;padding:18px;box-shadow:inset 0 1px #5bbaff25}.wise-card{background:#0b1d37;border:1px solid #254b84;border-radius:12px;padding:16px}.wise-card:hover{border-color:#51d8ff} .wise-core{animation:glow 3s ease-in-out infinite} .wise-link{color:#79dfff;text-decoration:none} .wise-link:hover{text-decoration:underline}`}</style>
 <header style={{display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:20,marginBottom:26,borderBottom:"1px solid #1c4371",paddingBottom:20}}>
 <div><div style={{color:"#9f92ff",letterSpacing:4,fontSize:13}}>WISE² / LIVING HIVE</div><h1 style={{fontSize:"clamp(32px,5vw,58px)",margin:"4px 0",letterSpacing:2}}>CONNECT</h1><p style={{color:"#a2b8d9",margin:0}}>SECOND BRAIN ACTIVATION · MULTI-DEVICE INTELLIGENCE · SYNCHRONIZED OPERATIONS</p></div>
 <div style={{textAlign:"right",color:"#9eb8ed",fontSize:12}}>ONE MIND<br/>MANY MACHINES<br/>A BRIGHTER TOMORROW<br/><span style={{color:"#73e4ff"}}>{now}</span></div></header>
 <div style={{marginBottom:16}}><a href="/connect/live" style={{display:"inline-block",padding:"12px 18px",borderRadius:10,background:"#123e52",border:"1px solid #65dfff",color:"#a3f6ff",textDecoration:"none"}}>◈ Open Animated Living Hive ↗</a></div><nav aria-label="WISE² Connect views" style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:24}}>{(["overview","devices","implementation"] as const).map(v=><button key={v} onClick={()=>setView(v)} aria-pressed={view===v} style={{cursor:"pointer",padding:"11px 18px",borderRadius:9,border:"1px solid "+(view===v?"#70ffb0":"#2a507e"),background:view===v?"#164b48":"#0b1b32",color:"#e6f7ff",textTransform:"capitalize"}}>{v}</button>)}</nav>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,alignItems:"start"}}>
 <section className="wise-panel"><h2 style={{color:"#9bbdff",marginTop:0}}>MACHINE STATUS</h2>{nodes.map(n=><div className="wise-card" key={n.name} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",gap:12}}><strong>{n.name}</strong><span style={{color:"#ffc678",fontSize:12}}>● {n.status.toUpperCase()}</span></div><div style={{color:"#9ab3d5",fontSize:13,marginTop:7}}>{n.role}</div></div>)}<small style={{color:"#9eb2c8"}}>Statuses require authenticated telemetry. No device health is inferred from the design reference.</small></section>
 <section className="wise-panel" style={{gridColumn:view==="overview"?"span 1":undefined}}><h2 style={{color:"#9bbdff",marginTop:0}}>SECOND BRAIN ARCHITECTURE</h2><div className="wise-core" style={{border:"2px solid #b37aff",borderRadius:18,padding:"28px 16px",textAlign:"center",background:"radial-gradient(circle,#27194b,#08142b)",margin:"24px 0"}}><div style={{fontSize:40,color:"#81d9ff"}}>◈</div><h2 style={{margin:"5px 0",color:"#fff"}}>HERMES</h2><p style={{margin:0,color:"#c5b6ff"}}>Central Intelligence & Orchestration</p><p style={{color:"#ffc678",fontSize:12}}>ENDPOINT STATUS: NOT VERIFIED</p></div><div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10}}>{services.map(s=><a className="wise-card wise-link" key={s.name} href={s.href}><strong>{s.name} ↗</strong><p style={{fontSize:12,color:"#a3b9d6"}}>{s.purpose}</p></a>)}</div></section>
 <section className="wise-panel"><h2 style={{color:"#9bbdff",marginTop:0}}>ACTIVATION CHECKLIST</h2>{stages.map((s,i)=><div key={s} style={{display:"flex",gap:14,alignItems:"start",padding:"12px 0",borderBottom:"1px solid #1e3657"}}><span style={{display:"grid",placeItems:"center",border:"1px solid #519bff",borderRadius:"50%",width:30,height:30,flexShrink:0,color:"#8fc7ff"}}>{i+1}</span><div><strong>{s}</strong><p style={{fontSize:12,color:"#9eb4d3",margin:"4px 0"}}>Awaiting verified integration evidence</p></div></div>)}</section>
 </div>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginTop:16}}>
 <section className="wise-panel"><h2 style={{color:"#9bbdff",marginTop:0}}>DATA FLOW</h2><p style={{fontSize:15,lineHeight:2}}>Devices ⇄ Encrypted Tunnel ⇄ <strong style={{color:"#bf95ff"}}>Hermes</strong> ⇄ Second Brain DB ⇄ Living Hive</p><p style={{fontSize:12,color:"#9eb4d3"}}>Architecture plan. Real-time encrypted routing is not verified.</p></section>
 <section className="wise-panel"><h2 style={{color:"#9bbdff",marginTop:0}}>IMPLEMENTATION QUEUE</h2><p style={{color:"#b2c7dd"}}>Git Assassin research dashboard and draft PR review</p><a className="wise-link" href="https://github.com/dwise03-bit/wise2-core/pull/153" target="_blank" rel="noopener noreferrer">Open Git Assassin PR #153 ↗</a><p><a className="wise-link" href="/git-assassin">Open Git Assassin Discovery ↗</a></p><p style={{fontSize:12,color:"#ffc678"}}>Production merges and deployments require approval.</p></section>
 <section className="wise-panel"><h2 style={{color:"#9bbdff",marginTop:0}}>DATA PROTECTION</h2><p style={{color:"#85ffb7"}}>✓ Approval-gated production</p><p style={{color:"#85ffb7"}}>✓ No credentials in client UI</p><p style={{color:"#85ffb7"}}>✓ Telemetry marked unverified until connected</p><p style={{color:"#9eb4d3",fontSize:12}}>Future integrations must enforce authentication, authorization, and encryption server-side.</p></section></div>
 <footer style={{paddingTop:22,color:"#849ec1",fontSize:12}}>WISE² CONNECT | HERMES | THE LIVING HIVE — UI foundation, not a claim of live activation</footer></main>
}