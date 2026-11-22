#!/usr/bin/env python3
"""WISE2 Commander read-only telemetry; private Tailscale Serve only."""
import json,os,shutil,subprocess,time
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
PORT=18781
SERVICES=['wise2-jarvis','wise2-video-worker','wise2-trading','wise2-godseye-real','wise2-shannon-staging','desktop-commander']
def state(s):
 try:
  return subprocess.run(['systemctl','--user','is-active',s+'.service'],capture_output=True,text=True,timeout=3).stdout.strip()
 except Exception:return 'unknown'
def status():
 d=shutil.disk_usage('/'); m={}
 with open('/proc/meminfo') as f:
  for l in f:
   k,v=l.split(':',1);m[k]=int(v.split()[0])*1024
 total=m['MemTotal'];used=total-m['MemAvailable']
 return dict(host=os.uname().nodename,uptime=int(float(open('/proc/uptime').read().split()[0])),load=os.getloadavg()[0],disk_percent=round(d.used/d.total*100,1),disk_free_gb=round(d.free/1e9,1),memory_percent=round(used/total*100,1),services={s:state(s) for s in SERVICES},mode='read-only')
HTML='''<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>WISE² Commander</title><style>body{font:16px system-ui;background:radial-gradient(at top right,#124566,#030913 65%);color:#e5f7ff;margin:0;padding:5vw}h1{letter-spacing:.12em}small{color:#71d7ff}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:15px}.card{padding:24px;background:#071d30;border:1px solid #2a5b75;border-radius:14px;margin:12px 0}strong{font-size:30px;color:#a6edff}li{padding:8px}button{background:#125678;color:white;padding:12px;border:1px solid #6de0ff;border-radius:8px}</style></head><body><small>WISE² / NODE 01 / TAILNET ONLY</small><h1>COMMANDER</h1><p>Live read-only telemetry. Command execution disabled.</p><div class="grid"><div class="card">STORAGE<br><strong id="disk">...</strong></div><div class="card">MEMORY<br><strong id="mem">...</strong></div><div class="card">CPU LOAD<br><strong id="load">...</strong></div><div class="card">NODE<br><strong id="host">...</strong></div></div><h2>WISE² Services</h2><div class="card"><ul id="services"></ul></div><button onclick="refresh()">Refresh</button><p id="updated"></p><script>async function refresh(){try{let r=await fetch('/api/status',{cache:'no-store'});if(!r.ok)throw Error(r.status);let d=await r.json();for(let [id,value] of Object.entries({disk:d.disk_percent+'%',mem:d.memory_percent+'%',load:d.load.toFixed(2),host:d.host}))document.getElementById(id).textContent=value;document.getElementById('services').replaceChildren(...Object.entries(d.services).map(([k,v])=>{let li=document.createElement('li');li.textContent=k+': '+v;return li}));document.getElementById('updated').textContent='Live · '+new Date().toLocaleTimeString()}catch(e){document.getElementById('updated').textContent='Connection error: '+e.message}}refresh();setInterval(refresh,15000)</script></body></html>'''
class Handler(BaseHTTPRequestHandler):
 def do_GET(self):
  if self.path in ('/','/index.html'): body=HTML.encode();kind='text/html';code=200
  elif self.path=='/api/health':body=b'{"status":"ok","mode":"read-only"}';kind='application/json';code=200
  elif self.path=='/api/status':body=json.dumps(status()).encode();kind='application/json';code=200
  else:body=b'Not found';kind='text/plain';code=404
  self.send_response(code);self.send_header('Content-Type',kind);self.send_header('Content-Length',str(len(body)));self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');self.send_header('Content-Security-Policy',"default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; object-src 'none'");self.end_headers();self.wfile.write(body)
 def do_POST(self):self.send_error(405,'Read-only')
if __name__=='__main__':ThreadingHTTPServer(('127.0.0.1',PORT),Handler).serve_forever()
