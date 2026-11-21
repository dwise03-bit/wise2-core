'use client';

import { useEffect, useState } from 'react';
import './c5.css';

const repo = 'https://github.com/dwise03-bit/wise2-core';
const workflows = [
  { name: 'Sound Labs Verification', detail: 'Audio integrity and local HTTP probes', href: repo + '/actions/workflows/wise2-commander-soundlab.yml', kind: 'AUDIO', accent: '#6cc9ff' },
  { name: 'Runner Diagnostics', detail: 'Self-hosted runner and server identity', href: repo + '/actions/workflows/wise2-commander-runner-diagnostics.yml', kind: 'SYSTEM', accent: '#b29aff' },
  { name: 'Deployment Pipeline', detail: 'Build, test and production workflow', href: repo + '/actions/workflows/deploy.yml', kind: 'DEPLOY', accent: '#74e2c0' },
];
const services = [
  { name: 'Ubuntu Host', subtitle: 'wise2 · Ubuntu 24.04', tag: 'HOST' },
  { name: 'Sound Labs', subtitle: 'Boogie Rage · rendered MP3', tag: 'AUDIO' },
  { name: 'Hermes AI', subtitle: 'AI orchestration', tag: 'AGENT' },
  { name: 'WISE² Trading', subtitle: 'Trading operations', tag: 'TRADE' },
  { name: 'Web / DNS', subtitle: 'Nginx · Cloudflare', tag: 'EDGE' },
];
const box: React.CSSProperties = { background: 'linear-gradient(145deg,#121c2d,#0b1321)', border: '1px solid #233149', borderRadius: 18 };
export default function CommanderPage() {
  const [now, setNow] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<string[]>([]);
  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleString(undefined,{weekday:'short',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'}));
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, []);
  const visible = workflows.filter(w => filter === 'ALL' || w.kind === filter);
  return <main className="cmd-c5" style={{ minHeight:'100vh',background:'#070d17',color:'#edf4ff',fontFamily:'Inter,ui-sans-serif,system-ui,sans-serif',padding:'0 0 65px' }}>
    <style>{`
      .cmd-wrap{max-width:1320px;margin:auto;padding:0 30px}
      .cmd-grid{display:grid;grid-template-columns:1.45fr 1fr;gap:20px}
      .cmd-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
      .cmd-button{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;border:1px solid #3a5877;background:#17283e;color:#d9efff;border-radius:10px;padding:12px 15px;font-weight:700;font-size:13px;cursor:pointer}
      .cmd-button:hover{border-color:#64cfff;background:#213c59}
      .cmd-input{width:100%;background:#0a1423;color:white;border:1px solid #34455d;border-radius:10px;padding:13px;font:inherit}
      .cmd-service{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #253247;padding:16px 0}
      .cmd-service:last-child{border-bottom:0}
      @media(max-width:850px){.cmd-grid{grid-template-columns:1fr}.cmd-stats{grid-template-columns:repeat(2,1fr)}}
      @media(max-width:480px){.cmd-wrap{padding:0 17px}.cmd-stats{gap:10px}}
    `}</style>
    <header style={{borderBottom:'1px solid #1e3046',background:'#0b1421'}}>
      <div className="cmd-wrap" style={{height:75,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:39,height:39,display:'grid',placeItems:'center',background:'linear-gradient(145deg,#77ddff,#3159bd)',borderRadius:11,color:'#061221',fontWeight:1000,fontSize:19}}>W²</div>
          <div><div style={{fontSize:17,fontWeight:900,letterSpacing:'.09em'}}>WISE² <span style={{color:'#71d8ff'}}>COMMANDER</span></div><div style={{fontSize:10,letterSpacing:'.2em',color:'#8ba4c1'}}>OPERATIONS CONTROL</div></div>
        </div>
        <a href={repo+'/actions'} target="_blank" rel="noreferrer" className="cmd-button">GITHUB ACTIONS ↗</a>
      </div>
    </header>
    <div className="cmd-wrap">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'end',gap:20,flexWrap:'wrap',padding:'37px 0 25px'}}>
        <div><div style={{color:'#70d8ff',fontSize:11,letterSpacing:'.22em',fontWeight:800,marginBottom:10}}>WISE² / SYSTEM OPERATIONS</div><h1 style={{fontSize:'clamp(30px,4.5vw,54px)',lineHeight:1.1,margin:'0 0 10px',letterSpacing:'-.055em'}}>Mission Control<span style={{color:'#66cfff'}}>.</span></h1><div style={{color:'#9baec5',fontSize:14}}>Your infrastructure. Your workflows. One command center.</div></div>
        <div style={{color:'#9ab4d1',fontSize:12,textAlign:'right'}}><div style={{marginBottom:7}}>LOCAL CONSOLE TIME</div><strong style={{fontSize:14,color:'#e2f4ff'}}>{now || 'Loading...'}</strong></div>
      </div>
      <div style={{padding:'12px 17px',border:'1px solid #665332',background:'#241e15',borderRadius:11,fontSize:12,color:'#f1d6a0',marginBottom:20}}>● LIVE STATUS NOT CONNECTED — This interface does not invent server health. Workflow execution opens authenticated GitHub Actions. No remote shell is exposed.</div>
      <div className="cmd-c5-banner"><div><div className="cmd-c5-title">WISE² COMMANDER</div><div className="cmd-c5-sub">C5 EDITION · DEPLOY / BUILD / TEST / OPERATE</div></div></div>
      <section className="cmd-stats" style={{marginBottom:20}}>
        {[
          ['01','TARGET HOST','wise2','Ubuntu server'],
          ['03','WORKFLOWS','Configured','GitHub Actions'],
          ['—','RUNNER STATUS','Unverified','Awaiting job result'],
          ['—','AUDIO HTTP','Unverified','Playback check pending']
        ].map(([number,label,value,sub])=><div key={label} style={{...box,padding:'19px 18px',minHeight:130}}><div style={{color:'#80a3c8',fontSize:10,fontWeight:800,letterSpacing:'.13em'}}>{label}</div><div style={{fontSize:24,fontWeight:850,margin:'15px 0 3px',color:'#e8f6ff'}}>{value}</div><div style={{color:'#7f96b3',fontSize:11}}>{sub}</div></div>)}
      </section>
      <div className="cmd-grid">
        <section style={{...box,padding:23}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:24}}><div><h2 style={{fontSize:19,margin:'0 0 6px'}}>Operations Launcher</h2><div style={{color:'#8197b2',fontSize:12}}>Authorized workflows · no stored GitHub credentials</div></div><div style={{display:'flex',gap:6}}>{['ALL','AUDIO','SYSTEM','DEPLOY'].map(f=><button key={f} onClick={()=>setFilter(f)} style={{background:filter===f?'#2c5674':'#101d2d',border:'1px solid #304158',color:filter===f?'#e8faff':'#89a1bd',borderRadius:8,padding:'7px 9px',fontSize:10,cursor:'pointer'}}>{f}</button>)}</div></div>
          {visible.map(w=><div key={w.name} style={{border:'1px solid #283a51',background:'#0c1726',borderRadius:13,padding:18,marginBottom:12,display:'flex',alignItems:'center',justifyContent:'space-between',gap:15,flexWrap:'wrap'}}>
            <div style={{display:'flex',alignItems:'center',gap:13}}><div style={{width:43,height:43,flexShrink:0,borderRadius:11,display:'grid',placeItems:'center',background:'#192b40',color:w.accent,fontSize:19}}>⌘</div><div><div style={{fontWeight:800,fontSize:14}}>{w.name}</div><div style={{fontSize:11,color:'#8fa5c0',marginTop:5}}>{w.detail}</div></div></div><a className="cmd-button" href={w.href} target="_blank" rel="noreferrer">OPEN ↗</a>
          </div>)}
          <div style={{color:'#7189a5',fontSize:11,marginTop:15}}>To execute: open a workflow → Run workflow → review GitHub job output. Jobs require a matching runner.</div>
        </section>
        <section style={{...box,padding:23}}><h2 style={{fontSize:19,margin:'0 0 6px'}}>Infrastructure Inventory</h2><div style={{color:'#8197b2',fontSize:12,marginBottom:10}}>Known components · live status not asserted</div>
          {services.map(s=><div className="cmd-service" key={s.name}><div><div style={{fontWeight:750,fontSize:13}}>{s.name}</div><div style={{color:'#8197b2',fontSize:11,marginTop:5}}>{s.subtitle}</div></div><div style={{fontSize:10,letterSpacing:'.09em',color:'#93a9c4',border:'1px solid #34445b',padding:'6px 9px',borderRadius:7}}>{s.tag}</div></div>)}
        </section>
      </div>
      <div className="cmd-grid" style={{marginTop:20}}>
        <section style={{...box,padding:23}}><h2 style={{fontSize:19,margin:'0 0 6px'}}>Commander Activity Notes</h2><p style={{color:'#839ab6',fontSize:12,margin:'0 0 18px'}}>Session-only notes. No commands are executed or transmitted.</p><form onSubmit={e=>{e.preventDefault();if(note.trim()){setNotes([new Date().toLocaleTimeString()+' — '+note.trim(),...notes]);setNote('')}}} style={{display:'flex',gap:8}}><input className="cmd-input" value={note} onChange={e=>setNote(e.target.value)} placeholder="Record a deployment note or finding..." aria-label="Activity note"/><button className="cmd-button" type="submit">ADD</button></form><div style={{marginTop:15}}>{notes.length?notes.map((n,i)=><div key={i} style={{borderBottom:'1px solid #26384c',padding:'10px 0',fontSize:12,color:'#b4cce5'}}>{n}</div>):<div style={{fontSize:12,color:'#748ba7',padding:'13px 0'}}>No activity notes yet.</div>}</div></section>
        <section style={{...box,padding:23}}><h2 style={{fontSize:19,margin:'0 0 8px'}}>Safety & Access</h2><p style={{fontSize:13,lineHeight:1.8,color:'#9bb2cc'}}>Runner execution is handled by GitHub Actions. This dashboard contains no SSH credentials, API tokens, public shell, or unauthenticated command endpoint.</p><a className="cmd-button" href={repo+'/settings/actions/runners'} target="_blank" rel="noreferrer">MANAGE RUNNERS ↗</a><div style={{marginTop:20,fontSize:11,color:'#748ba7'}}>Before production use: require authenticated dashboard access and enforce GitHub environment approvals for deployment operations.</div></section>
      </div>
      <footer style={{padding:'35px 0 0',fontSize:11,color:'#5f7896',display:'flex',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}><span>WISE² COMMANDER / CONTROL PLANE V0.2 · C5 EDITION</span><span>NO CROWNS. ONE SYSTEM.</span></footer>
    </div>
  </main>;
}
