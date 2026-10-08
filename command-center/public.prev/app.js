'use strict';
const modules = ['SYSTEM','AI','SECURITY','DEVICES','PROJECTS','DEPLOYMENTS','SUPPORT','ALERTS','LOGS','BACKUPS','SETTINGS'];
let snapshot = null;
let transport = 'COLLECTING';
const element = (tag, text, cls) => {
  const node = document.createElement(tag);
  if(text !== undefined) node.textContent = text;
  if(cls) node.className = cls;
  return node;
};
const display = value => value === null || value === undefined || value === '' ? 'UNKNOWN' : typeof value === 'object' ? JSON.stringify(value) : String(value);
function tone(value) {
  if(transport !== 'LIVE') return 'warning';
  if(['ONLINE','PASS','READY','INSTALLED','IMPLEMENTED'].includes(value)) return 'good';
  if(['OFFLINE','FAIL','ERROR'].includes(value)) return 'bad';
  return ['UNKNOWN','NOT CONFIGURED','PARTIAL','NOT AUTHORIZED','STALE'].includes(value) ? 'warning' : '';
}
function card(title, rows=[], note='') {
  const node = element('section',undefined,'card');
  node.append(element('h2',title));
  for(const [key,value] of rows) {
    const row = element('div',undefined,'row');
    row.append(element('span',key,'key'),element('span',display(value),'value '+tone(value)));
    node.append(row);
  }
  if(note) node.append(element('p',note,'note'));
  return node;
}
function metric(title,value,note,percent) {
  const node=card(title,[],note);
  node.insertBefore(element('div',display(value),'metric'),node.children[1] || null);
  if(Number.isFinite(percent)) {
    const bar=element('div',undefined,'bar'),fill=element('i');
    fill.style.width=Math.max(0,Math.min(100,percent))+'%';
    bar.append(fill);node.append(bar);
  }
  return node;
}
function alerts(d) {
  const rows=Object.entries(d.services||{}).filter(([,s])=>s!=='ONLINE');
  if(d.hermes?.state==='ERROR') rows.push(['Hermes','ERROR']);
  if(d.backup_health?.state!=='PASS') rows.push(['Latest backup integrity',d.backup_health?.state||'UNKNOWN']);
  if(d.shannon?.state!=='INSTALLED') rows.push(['Shannon package',d.shannon?.state||'UNKNOWN']);
  return rows;
}
function render() {
  const selected=(location.hash.slice(1)||'system').toUpperCase();
  const page=modules.includes(selected)?selected:'SYSTEM';
  for(const link of document.querySelectorAll('nav a')) {
    if(link.textContent===page) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  }
  document.getElementById('title').textContent=page[0]+page.slice(1).toLowerCase();
  document.getElementById('subtitle').textContent=transport==='LIVE'?'Read-only host observations. Unconfigured integrations are labeled.':'Current observations are unavailable or stale. Treat displayed data as historical.';
  const grid=document.getElementById('grid');grid.replaceChildren();
  if(!snapshot) {grid.append(card('Observations',[['Collection',transport]],'No live service state has been established.'));return;}
  const d=snapshot,svc=d.services||{},h=d.hermes||{},sh=d.shannon||{};
  let cards=[];
  switch(page) {
    case 'SYSTEM': {
      const mem=d.mem||{},disk=d.disk||{};
      const pct=mem.total_gib && Number.isFinite(mem.avail_gib)?Math.round((mem.total_gib-mem.avail_gib)/mem.total_gib*100):null;
      cards=[card('Primary node',[['Host',d.host],['OS',d.os],['Kernel',d.kernel],['CPU',d.cpu],['Uptime',d.uptime]]),
        metric('Memory',pct===null?'UNKNOWN':pct+'%',`${display(mem.avail_gib)} GiB available / ${display(mem.total_gib)} GiB total`,pct),
        metric('Storage /',Number.isFinite(disk.used_pct)?disk.used_pct+'%':'UNKNOWN',`${display(disk.free_gb)} GB free / ${display(disk.total_gb)} GB total`,disk.used_pct),
        card('Services',Object.entries(svc)),card('Mesh',[['Backend',d.mesh?.state],['IPv4',d.mesh?.ip]]),
        card('Battery',d.battery?[['Capacity',d.battery.capacity+'%'],['State',d.battery.status]]:[['State','UNKNOWN']])];break;
    }
    case 'AI':
      cards=[...Object.entries(d.agents||{}).map(([name,a])=>card(name,[['CLI executes',a.state],['Version',a.version]],'CLI functionality does not establish account authentication or model availability.')),
        card('Hermes',[['State',h.state],...['configured','reachable','authenticated','memory'].map(k=>[k,h[k]===true?'yes':'no'])],h.note),
        card('Agents / jobs / approvals',[['Integration','NOT CONFIGURED']],'The existing production Hermes owns these capabilities. No remote jobs or approvals are inferred here.')];break;
    case 'SECURITY':
      cards=[card('Shannon',[['Installation',sh.state],['Local package version',sh.cached_version],['Launcher',sh.launcher?'present':'missing'],['Engagement state',sh.engagement_state],['Authorization',sh.authorization]],'No scanner is invoked by dashboard or health probes. npx first-run installation may require connectivity.'),
        card('Authorized workflow',[['Launch','wise2 pentest']],'The preserved terminal gate asks for scope and explicit yes. Recorded directories never imply an active or authorized engagement.')];break;
    case 'DEVICES':
      cards=(d.registry?.devices||[]).map(dev=>card(dev.display_name,[['Registration',dev.registration],['Presence',dev.online_state],['Role',dev.role],['OS',dev.os],['Architecture',dev.architecture],['Last seen',dev.last_seen],['Tailscale IP',dev.tailscale_ip],['Agent version',dev.agent_version],['CPU',dev.cpu],['RAM GiB',dev.ram_gib],['Storage',dev.storage],['Services',dev.services]],'Source: '+display(dev.telemetry_source)));
      if(!cards.length) cards=[card('Registry',[['State',d.registry?.state||'UNKNOWN']])];break;
    case 'PROJECTS':
      cards=[card('Local projects',[['Discovery',d.projects?.state]],'Directory inventory only; no build/deployment health is inferred.'),...(d.projects?.names||[]).map(name=>card(name,[['State','REGISTERED']]))];break;
    case 'DEPLOYMENTS':cards=[card('Deployment integration',[['State','NOT CONFIGURED']],'No deployment backend is connected. Infrastructure changes require a reviewed target, expected effect and rollback method.')];break;
    case 'SUPPORT':cards=[card('Remote support',[['State','NOT CONFIGURED'],['OpenSSH service',svc.ssh]],'Interactive support requires consent. Existing SSH administration and Tailscale are preserved.')];break;
    case 'ALERTS': {
      const rows=alerts(d);cards=[card('Observed issues',rows,rows.length?'Unknown states require verification; they do not establish an outage.':'No issue found in the displayed probes. This is not a full acceptance result.')];break;
    }
    case 'LOGS':cards=[card('Operation audit',[],'Fixed local action/outcome records only. Raw service messages and security evidence are withheld.'),...(d.logs||[]).slice().reverse().map(e=>card(e.action,[['Time',e.time],['Outcome',e.outcome]]))];break;
    case 'BACKUPS':cards=[card('Metadata recovery',[['Latest integrity',d.backup_health?.state],['Create','wise2 backup create'],['Verify','wise2 backup verify']],'Archive inventory does not establish integrity; verification reads every payload and checks its SHA-256. Secrets, project data, Docker volumes and system configuration are excluded.'),...(d.backups||[]).map(b=>card(b.name,[['Bytes',b.bytes],['Format',b.format]],'Run verification before relying on this archive.'))];break;
    case 'SETTINGS':cards=[card('Local control',[['CLI version',d.settings?.cli_version],['Listener',d.settings?.bind],['API','read-only']],'Credentials and environment files are never returned. Enrollment and restore are reviewed local procedures.'),card('Architecture',[['Hermes','existing remote client'],['Registry','local-first'],['Deployment backend','NOT CONFIGURED']])];break;
  }
  grid.append(...cards);
}
for(const name of modules) {
  const link=element('a',name);link.href='#'+name.toLowerCase();document.getElementById('navigation').append(link);
}
window.addEventListener('hashchange',render);
async function load() {
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);
  try {
    const response=await fetch('/api/status',{signal:controller.signal,cache:'no-store'});
    if(!response.ok) throw new Error('status unavailable');
    const data=await response.json();transport=data.collection_state||'UNKNOWN';
    if(data.observed_at) snapshot=data;
    const connection=document.getElementById('connection');
    connection.textContent=(snapshot?.host||'Primary node')+' · '+transport;
    connection.className=transport==='LIVE' && !alerts(snapshot||{}).length?'good':'warning';
  } catch(error) {transport='STALE';document.getElementById('connection').textContent='Status API unavailable · STALE';document.getElementById('connection').className='warning';}
  finally {
    clearTimeout(timer);document.getElementById('observed').textContent=snapshot?.observed_at?'Observed '+snapshot.observed_at:'No observation yet';render();setTimeout(load,10000);
  }
}
render();load();
