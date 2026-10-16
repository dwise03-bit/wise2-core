import http from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';
const upstream=process.env.UPSTREAM_URL || 'http://100.85.242.34:8088';
const port=Number(process.env.PORT || 8090);
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json'};
http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/programs'||url.pathname==='/programs/'){try{res.writeHead(200,{'Content-Type':'text/html'});res.end(await readFile(path.resolve('public/programs/index.html')));}catch{res.writeHead(500);res.end('Program directory unavailable');}return;}
 if(url.pathname==='/tunnels'||url.pathname==='/tunnels/'){try{res.writeHead(200,{'Content-Type':'text/html'});res.end(await readFile(path.resolve('public/sound-lab.html')));}catch{res.writeHead(500);res.end('Sound Lab unavailable');}return;}
 if(['/store'].some(p=>url.pathname===p || url.pathname.startsWith(p+'/'))){res.writeHead(302,{Location:upstream+url.pathname+url.search});res.end();return;}
 if(url.pathname.startsWith('/api/')){
  try{const r=await fetch(upstream+url.pathname+url.search,{signal:AbortSignal.timeout(7000)});res.writeHead(r.status,{'Content-Type':r.headers.get('content-type')||'text/plain'});res.end(Buffer.from(await r.arrayBuffer()));}catch{res.writeHead(503,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Pocket Node is currently unreachable. Try again when the mesh reconnects.'}));}return;
 }
 try{const file=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname).slice(1);const base=path.resolve('public');let target=path.resolve(base,file);if(!target.startsWith(base+path.sep))throw Error();if((await stat(target)).isDirectory())target=path.join(target,'index.html');const data=await readFile(target);res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404);res.end('Not found');}
}).listen(port,process.env.HOST || '127.0.0.1',()=>console.log(`WISE² Grand Central: http://localhost:${port}`));
