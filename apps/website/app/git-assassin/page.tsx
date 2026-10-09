"use client";
import { useEffect, useState } from "react";

type Discovery = { name:string; url:string; description:string; stars:number; updated:string; category:string };
const topics = [
  ["AI Agents","topic:ai-agents"],["Codex Skills","codex skills"],["Claude Skills","claude code skills"],
  ["Game Development","topic:game-development"],["App Development","topic:app-development"],
  ["Local AI","topic:local-ai"],["ESP32 / Pi","esp32 raspberry pi"]
];
const projects = ["Hive","Hermes","Sound Lab","Everyday Trader","Pocket Node","TV Hub","WISE² Linux","Client Apps"];
export default function GitAssassinPage() {
 const [tab,setTab]=useState(0),[items,setItems]=useState<Discovery[]>([]),[loading,setLoading]=useState(false),[error,setError]=useState("");
 useEffect(()=>{let active=true;setLoading(true);setError("");
 const q=encodeURIComponent(topics[tab][1]+" archived:false");
 fetch("https://api.github.com/search/repositories?q="+q+"&sort=updated&order=desc&per_page=12",{headers:{"Accept":"application/vnd.github+json"}})
 .then(async r=>{if(!r.ok)throw Error("GitHub API: "+r.status);return r.json()})
 .then(data=>{if(active)setItems((data.items||[]).map((x:any)=>({name:x.full_name,url:x.html_url,description:x.description||"No description",stars:x.stargazers_count,updated:x.pushed_at,category:topics[tab][0]})))})
 .catch(e=>{if(active)setError(e.message)}).finally(()=>{if(active)setLoading(false)});
 return()=>{active=false};},[tab]);
 return <main style={{minHeight:"100vh",background:"#050d17",color:"#e5f4ff",fontFamily:"system-ui",padding:"clamp(18px,4vw,48px)"}}>
 <style>{`@keyframes pulse{50%{opacity:.4}} .ga-card:hover{border-color:#63ff9a!important;transform:translateY(-2px)} .ga-card{transition:.2s} button{cursor:pointer}`}</style>
 <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:20,flexWrap:"wrap",borderBottom:"1px solid #20415a",paddingBottom:24}}>
 <div><div style={{color:"#67ff9a",letterSpacing:4,fontSize:12}}>WISE² // LIVING HIVE</div><h1 style={{fontSize:"clamp(30px,5vw,54px)",margin:"8px 0"}}>◈ GIT ASSASSIN</h1><p style={{color:"#9cb5c7"}}>Discovery intelligence · Implementation command · Protected production</p></div>
 <span style={{border:"1px solid #276d54",borderRadius:40,padding:"10px 16px",color:"#6bffa0"}}>● RESEARCH MODE</span></header>
 <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,margin:"28px 0"}}>
 {["6-HOUR INTELLIGENCE","7 DISCOVERY CHANNELS","8 WISE² TARGETS","APPROVAL-GATED DEPLOY"].map((s,i)=><div key={s} style={{background:"#0d1e30",border:"1px solid #1d4059",borderRadius:14,padding:20}}><div style={{fontSize:28,color:"#65ff9a"}}>{["06:00","07","08","LOCKED"][i]}</div><small style={{color:"#9cb5c7"}}>{s}</small></div>)}</section>
 <h2 style={{color:"#76dbff"}}>Live GitHub Discovery</h2><nav aria-label="Discovery categories" style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>{topics.map((t,i)=><button key={t[0]} onClick={()=>setTab(i)} aria-pressed={tab===i} style={{border:"1px solid "+(tab===i?"#65ff9a":"#23475b"),background:tab===i?"#164536":"#0c1b2b",color:"#e5f4ff",padding:"10px 14px",borderRadius:10}}>{t[0]}</button>)}</nav>
 {loading&&<p role="status">Scanning GitHub repositories…</p>}{error&&<p role="alert" style={{color:"#ffac8e"}}>{error}. Retry later or use the scheduled intelligence report.</p>}
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:14}}>{items.map(x=><article className="ga-card" key={x.url} style={{background:"#0d1e30",border:"1px solid #23475b",borderRadius:14,padding:20}}><div style={{fontSize:12,color:"#68ff9e"}}>{x.category}</div><h3 style={{overflowWrap:"anywhere"}}>{x.name}</h3><p style={{color:"#abc0d0",minHeight:48}}>{x.description}</p><p style={{color:"#8ea8b8",fontSize:13}}>★ {x.stars.toLocaleString()} · Updated {new Date(x.updated).toLocaleDateString()}</p><a href={x.url} target="_blank" rel="noopener noreferrer" style={{color:"#78ddff"}}>Inspect source ↗</a></article>)}</div>
 <h2 style={{marginTop:40,color:"#76dbff"}}>WISE² Implementation Targets</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12}}>{projects.map(p=><div key={p} style={{background:"#0d1e30",border:"1px solid #23475b",padding:18,borderRadius:12}}><strong>{p}</strong><p style={{color:"#9cb5c7",fontSize:13}}>Review recommendations · Draft PR · Approval required</p></div>)}</div>
 <footer style={{marginTop:40,color:"#8ca8b9",fontSize:13}}>Public GitHub metadata only. Live deployment, Discord, service telemetry, automated coding and PR queues require backend integrations. No production writes from this interface.</footer></main>
}
