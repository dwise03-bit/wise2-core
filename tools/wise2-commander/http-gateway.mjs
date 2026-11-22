import http from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { execute, configStatus } from './server.mjs';

const definitions = [
  ['commander_status',{}],['github_repository',{repo:{type:'string',enum:['wise2-core','wise2-infrastructure','wise2-dashboard','wise2','wise2-trading']}}],
  ['infrastructure_health',{}],['hermes_health',{}],
  ['deployment_status',{repo:{type:'string',enum:['wise2-core','wise2-infrastructure','wise2-dashboard','wise2','wise2-trading']}}],
  ['dispatch_deployment',{repo:{type:'string'},workflow:{type:'string'},ref:{type:'string'},approval:{type:'string'}}]
];
export const toolList=definitions.map(([name,properties])=>({name,description:name.replaceAll('_',' '),inputSchema:{type:'object',properties,required:name==='github_repository'||name==='deployment_status'?['repo']:name==='dispatch_deployment'?['repo','workflow','ref','approval']:[]}}));
function authorized(req,secret) {
 const header=req.headers.authorization||'';
 if(!header.startsWith('Bearer '))return false;
 const a=Buffer.from(header.slice(7)),b=Buffer.from(secret);
 return a.length===b.length&&timingSafeEqual(a,b);
}
export function createGateway({token=process.env.WISE2_MCP_BEARER_TOKEN}={}) {
 if(!token||token.length<32)throw Error('WISE2_MCP_BEARER_TOKEN must contain at least 32 characters');
 return http.createServer(async(req,res)=>{
  const send=(status,obj,headers={})=>{res.writeHead(status,{'content-type':'application/json','cache-control':'no-store',...headers});res.end(JSON.stringify(obj));};
  if(req.url!=='/mcp')return send(404,{error:'Not found'});
  if(!authorized(req,token))return send(401,{error:'Unauthorized','hint':'Bearer token required'},{'www-authenticate':'Bearer'});
  if(req.method==='GET')return send(405,{error:'GET streaming not supported'},{allow:'POST'});
  if(req.method!=='POST')return send(405,{error:'Method not allowed'},{allow:'POST'});
  if(!String(req.headers['content-type']||'').startsWith('application/json'))return send(415,{error:'JSON required'});
  let raw='';
  try {
   for await(const chunk of req){raw+=chunk;if(raw.length>65536)return send(413,{error:'Request too large'});}
   const m=JSON.parse(raw);
   if(!m||m.jsonrpc!=='2.0'||typeof m.method!=='string'||Array.isArray(m))return send(400,{error:'Invalid JSON-RPC'});
   if(m.method==='notifications/initialized')return res.writeHead(202).end();
   if(m.id===undefined)return res.writeHead(202).end();
   let result;
   if(m.method==='initialize')result={protocolVersion:'2025-03-26',capabilities:{tools:{}},serverInfo:{name:'wise2-commander',version:configStatus().version}};
   else if(m.method==='ping')result={};
   else if(m.method==='tools/list')result={tools:toolList};
   else if(m.method==='tools/call') {
    try{const output=await execute(m.params?.name,m.params?.arguments||{});result={content:[{type:'text',text:JSON.stringify(output)}]};}
    catch(e){result={content:[{type:'text',text:String(e.message||e)}],isError:true};}
   } else return send(200,{jsonrpc:'2.0',id:m.id,error:{code:-32601,message:'Method not found'}},{'mcp-protocol-version':'2025-03-26'});
   return send(200,{jsonrpc:'2.0',id:m.id,result},{'mcp-protocol-version':'2025-03-26'});
  }catch(e){return send(400,{error:'Malformed request'});}
 });
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href){
 const host=process.env.WISE2_MCP_HOST||'127.0.0.1';
 const port=Number(process.env.PORT||8787);
 if(!Number.isInteger(port)||port<1||port>65535)throw Error('Invalid port');
 createGateway().listen(port,host,()=>process.stderr.write('WISE2 MCP gateway listening on '+host+':'+port+'\n'));
}
