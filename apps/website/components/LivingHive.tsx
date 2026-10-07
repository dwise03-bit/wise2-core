'use client';
import { useEffect, useMemo, useState } from 'react';

type HiveStatus = {generatedAt?:string;website?:{ok:boolean};api?:{ok:boolean;latencyMs?:number};hermes?:{ok:boolean;model?:string;provider?:string};deviceFabric?:{mode:string}};
const cells=[
  {name:'CUSTOMERS',sub:'CRM · ONBOARDING',href:'/crm/prospects',icon:'◉'},
  {name:'SERVICES',sub:'DELIVERY · PROJECTS',href:'/services',icon:'◆'},
  {name:'AUTOMATION',sub:'AGENTS · WORKFLOWS',href:'/bots/dashboard',icon:'⌘'},
  {name:'SUPPORT',sub:'TRIAGE · REMOTE SUPPORT',href:'/support',icon:'✦'},
  {name:'GROWTH',sub:'PIPELINE · REVENUE',href:'/revenue/dashboard',icon:'↗'},
  {name:'SECURITY',sub:'SHANNON · AUTHORIZED',href:'/dashboard',icon:'⬡'}
];
const nav=[['HIVE','/hive'],['COMMAND CENTER','/dashboard'],['HERMES','/hermes-control'],['AUTOMATION','/bots/dashboard'],['REVENUE','/revenue/dashboard'],['SUPPORT','/support'],['SYSTEMS','/systems']];

export function LivingHive(){
  const [active,setActive]=useState('HERMES CORE');
  const [status,setStatus]=useState<HiveStatus|null>(null);
  const [tick,setTick]=useState(0);
  useEffect(()=>{let live=true;const load=()=>fetch('/api/hive/status',{cache:'no-store'}).then(r=>r.json()).then(x=>live&&setStatus(x)).catch(()=>{});load();const id=setInterval(()=>{load();setTick(v=>v+1)},5000);return()=>{live=false;clearInterval(id)}},[]);
  const online=useMemo(()=>[status?.website?.ok,status?.api?.ok,status?.hermes?.ok].filter(Boolean).length,[status,tick]);
  return <main className="hiveShell">
    <header className="hiveTop"><div className="brand"><span className="brandMark">W²</span><div><b>WISE²</b><small>LIVING HIVE</small></div></div><div className="crumb">PRODUCTION FABRIC <span>•</span> VPS AUTHORITY</div><div className="topHealth"><i className={status?.website?.ok?'on':'off'}/> WISE2.NET {status?.website?.ok?'ONLINE':'CHECKING'} <button aria-label="Search">⌕</button><span className="avatar">DW</span></div></header>
    <div className="hiveLayout">
      <nav className="hiveNav"><div className="navTitle">OPERATIONS</div>{nav.map(([n,h],i)=><a className={i===0?'selected':''} href={h} key={n}><span>{['⬢','▦','✦','⌘','↗','◈','◎'][i]}</span>{n}</a>)}<div className="navTitle second">FABRIC</div><a href="/systems/hardware"><span>◉</span>DEVICES</a><a href="/systems/ai-router"><span>⌁</span>AI ROUTER</a><div className="navFoot"><i className="on"/> FABRIC CONNECTED<small>TAILSCALE · VPS</small></div></nav>
      <section className="hiveMain">
        <div className="sectionHead"><div><small>WISE² OPERATING SYSTEM</small><h1>THE LIVING HIVE</h1><p>Every chamber is connected. Every signal has somewhere to go.</p></div><div className="pulse"><i/> LIVE FABRIC <b>{online}/3 CORE</b></div></div>
        <div className="honeyStage">
          <div className="gridGlow"/>
          <svg className="links" viewBox="0 0 1000 610" preserveAspectRatio="none"><defs><linearGradient id="flow"><stop stopColor="#ffb11b"/><stop offset=".5" stopColor="#8d5cff"/><stop offset="1" stopColor="#18c8ff"/></linearGradient></defs>{[[500,305,250,145],[500,305,500,92],[500,305,750,145],[500,305,250,465],[500,305,500,520],[500,305,750,465]].map((p,i)=><path key={i} d={'M'+p[0]+' '+p[1]+' Q '+((p[0]+p[2])/2+(i%2?35:-35))+' '+((p[1]+p[3])/2)+' '+p[2]+' '+p[3]}/>)}</svg>
          <a href="/hermes-control" className="coreHex" onMouseEnter={()=>setActive('HERMES CORE')}><div className="coreInner"><span>W²</span><b>HERMES CORE</b><small>ORCHESTRATION</small><em className={status?.hermes?.ok?'good':'warn'}>{status?.hermes?.ok?'ONLINE':'DEGRADED'}</em></div></a>
          {cells.map((c,i)=><a href={c.href} key={c.name} className={'hiveCell cell'+i} onMouseEnter={()=>setActive(c.name)}><div><span className="cellIcon">{c.icon}</span><b>{c.name}</b><small>{c.sub}</small><em>OPEN CHAMBER →</em></div></a>)}
          <i className="bee bee1">◆</i><i className="bee bee2">◆</i><i className="bee bee3">◆</i>
        </div>
        <div className="telemetry">
          <div><small>ACTIVE CHAMBER</small><b>{active}</b><span>Interactive production surface</span></div>
          <div><small>API GATEWAY</small><b className={status?.api?.ok?'green':'amber'}>{status?.api?.ok?'ONLINE':'CHECKING'}</b><span>{status?.api?.latencyMs!=null?status.api.latencyMs+' ms':'server-side probe'}</span></div>
          <div><small>HERMES</small><b className={status?.hermes?.ok?'green':'amber'}>{status?.hermes?.ok?'ONLINE':'DEGRADED'}</b><span>{status?.hermes?.model||'orchestration core'}</span></div>
          <div><small>DEVICE FABRIC</small><b className="violet">{status?.deviceFabric?.mode||'TAILSCALE'}</b><span>VPS authority</span></div>
        </div>
      </section>
      <aside className="opsRail">
        <div className="railHead"><span>LIVE OPERATIONS</span><i className="on"/> REAL-TIME</div>
        <div className="heroStat"><small>CORE SYSTEMS</small><strong>{online}<sup>/3</sup></strong><span>responding now</span></div>
        <div className="miniGrid"><div><small>WEBSITE</small><b>{status?.website?.ok?'ONLINE':'...'}</b></div><div><small>API</small><b>{status?.api?.ok?'ONLINE':'...'}</b></div><div><small>HERMES</small><b>{status?.hermes?.ok?'ONLINE':'DEGRADED'}</b></div><div><small>FABRIC</small><b>LINKED</b></div></div>
        <div className="activity"><h3>HIVE ACTIVITY</h3><p><i className="gold"/>Production website serving Hive <time>NOW</time></p><p><i className="purple"/>API gateway health probe <time>5S</time></p><p><i className="blue"/>Hermes server-side check <time>5S</time></p></div>
        <div className="quick"><h3>QUICK LAUNCH</h3><a href="/dashboard">COMMAND CENTER <span>↗</span></a><a href="/hermes-control">HERMES CONTROL <span>↗</span></a><a href="/revenue/dashboard">REVENUE OS <span>↗</span></a><a href="/support">SUPPORT <span>↗</span></a></div>
        <div className="securityNote"><span>⬡</span><div><b>SECURITY GATE</b><small>Shannon actions require authorized targets.</small></div></div>
      </aside>
    </div>
    <footer className="hiveFoot"><span><i className="on"/> HIVE ONLINE</span><span>BROWSER → WISE² WEBSITE → API GATEWAY → HERMES</span><span>{status?.generatedAt?new Date(status.generatedAt).toLocaleTimeString():'SYNCING'}</span></footer>
  </main>
}