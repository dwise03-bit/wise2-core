import readline from 'node:readline';

const OWNER = process.env.WISE2_GITHUB_OWNER || 'dwise03-bit';
const REPOS = new Set(['wise2-core','wise2-infrastructure','wise2-dashboard','wise2','wise2-trading']);
const TOKEN = process.env.GITHUB_TOKEN;
const HERMES_URL = process.env.WISE2_HERMES_HEALTH_URL;
const MAX_OUTPUT = 10000;
const tools = [
  {name:'commander_status',description:'Report Commander configuration and capabilities without revealing secrets.',inputSchema:{type:'object',properties:{}}},
  {name:'github_repository',description:'Read metadata for an allowlisted WISE2 GitHub repository.',inputSchema:{type:'object',properties:{repo:{type:'string',enum:[...REPOS]}},required:['repo']}},
  {name:'infrastructure_health',description:'Read the latest GitHub Actions runs for the WISE2 infrastructure repository; not a live host health check.',inputSchema:{type:'object',properties:{}}},
  {name:'hermes_health',description:'Check the configured Hermes HTTPS health endpoint (read-only).',inputSchema:{type:'object',properties:{}}},
  {name:'deployment_status',description:'Read recent GitHub Actions workflow runs in an allowlisted repository.',inputSchema:{type:'object',properties:{repo:{type:'string',enum:[...REPOS]}},required:['repo']}},
  {name:'dispatch_deployment',description:'Request a specifically allowlisted GitHub Actions workflow dispatch. Requires server-side enablement and an explicit approval token.',inputSchema:{type:'object',properties:{repo:{type:'string',enum:[...REPOS]},workflow:{type:'string'},ref:{type:'string'},approval:{type:'string'}},required:['repo','workflow','ref','approval']}}
];
export function configStatus() { return {name:'WISE² Commander',version:'0.1.0',github_authenticated:!!TOKEN,hermes_health_configured:!!HERMES_URL,deployments_enabled:process.env.WISE2_ENABLE_DISPATCH==='true',production_verified:false}; }
function validateRepo(repo) { if(!REPOS.has(repo)) throw Error('Repository not allowlisted'); return repo; }
async function github(path,method='GET',body) {
 if(!TOKEN) throw Error('GITHUB_TOKEN is not configured');
 const response=await fetch('https://api.github.com'+path,{method,headers:{Authorization:'Bearer '+TOKEN,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'wise2-commander'},...(body?{body:JSON.stringify(body)}:{}) ,signal:AbortSignal.timeout(10000)});
 if(!response.ok) throw Error('GitHub API returned HTTP '+response.status);
 if(response.status===204) return {accepted:true};
 return response.json();
}
function safeRun(x) {return {id:x.id,name:x.name,status:x.status,conclusion:x.conclusion,html_url:x.html_url,created_at:x.created_at};}
export async function execute(name,args={}) {
 switch(name) {
 case 'commander_status': return configStatus();
 case 'github_repository': {const r=await github('/repos/'+OWNER+'/'+validateRepo(args.repo));return {full_name:r.full_name,default_branch:r.default_branch,private:r.private,updated_at:r.updated_at,html_url:r.html_url};}
 case 'infrastructure_health': {const d=await github('/repos/'+OWNER+'/wise2-infrastructure/actions/runs?per_page=5');return {source:'GitHub Actions only; host health unverified',runs:(d.workflow_runs||[]).map(safeRun)};}
 case 'deployment_status': {const d=await github('/repos/'+OWNER+'/'+validateRepo(args.repo)+'/actions/runs?per_page=10');return {source:'GitHub Actions',runs:(d.workflow_runs||[]).map(safeRun)};}
 case 'hermes_health': {
  if(!HERMES_URL) return {configured:false,healthy:null};
  const u=new URL(HERMES_URL);
  if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash) throw Error('Hermes endpoint must be a clean HTTPS URL');
  const allowed=(process.env.WISE2_ALLOWED_HEALTH_HOSTS||'').split(',').map(s=>s.trim()).filter(Boolean);
  if(!allowed.includes(u.hostname)) throw Error('Hermes host is not allowlisted');
  const r=await fetch(u,{method:'GET',redirect:'error',signal:AbortSignal.timeout(5000)});
  return {configured:true,healthy:r.ok,http_status:r.status};
 }
 case 'dispatch_deployment': {
  validateRepo(args.repo);
  if(process.env.WISE2_ENABLE_DISPATCH!=='true') throw Error('Deployment dispatch disabled');
  const workflows=(process.env.WISE2_ALLOWED_WORKFLOWS||'').split(',').filter(Boolean);
  if(!workflows.includes(args.workflow)) throw Error('Workflow not allowlisted');
  if(!/^[A-Za-z0-9._/-]{1,100}$/.test(args.ref)||args.ref.includes('..')) throw Error('Invalid ref');
  if(!process.env.WISE2_DISPATCH_APPROVAL||args.approval!==process.env.WISE2_DISPATCH_APPROVAL) throw Error('Explicit approval required');
  await github('/repos/'+OWNER+'/'+args.repo+'/actions/workflows/'+encodeURIComponent(args.workflow)+'/dispatches','POST',{ref:args.ref});
  return {accepted:true,verified_deployed:false,note:'Workflow requested; inspect run and independent health checks before reporting deployment'};
 }
 default: throw Error('Unknown tool');
 }
}
function reply(id,result,error) {const msg={jsonrpc:'2.0',id,...(error?{error:{code:-32603,message:String(error.message||error)}}:{result})};process.stdout.write(JSON.stringify(msg)+'\n');}
export async function handle(message) {
 const {id,method,params={}}=message;
 if(method==='notifications/initialized') return;
 if(method==='initialize') return reply(id,{protocolVersion:'2025-03-26',capabilities:{tools:{}},serverInfo:{name:'wise2-commander',version:'0.1.0'}});
 if(method==='ping') return reply(id,{});
 if(method==='tools/list') return reply(id,{tools});
 if(method==='tools/call') {try {const data=await execute(params.name,params.arguments||{});return reply(id,{content:[{type:'text',text:JSON.stringify(data).slice(0,MAX_OUTPUT)}]});}catch(e){return reply(id,{content:[{type:'text',text:String(e.message||e)}],isError:true});}}
 if(id!==undefined) reply(id,null,Error('Method not found'));
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href) {
 const rl=readline.createInterface({input:process.stdin,crlfDelay:Infinity});
 rl.on('line',async line=>{try{await handle(JSON.parse(line));}catch(e){process.stderr.write(String(e)+'\n');}});
}
