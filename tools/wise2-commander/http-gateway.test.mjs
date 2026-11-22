import test from 'node:test';
import assert from 'node:assert/strict';
import {createGateway} from './http-gateway.mjs';

const token='test-token-0123456789-abcdefghijklmnopqrstuvwxyz';
async function withServer(fn){
 const server=createGateway({token});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port+'/mcp';
 try{await fn(url);}finally{await new Promise(resolve=>server.close(resolve));}
}
const call=(url,body,auth=true)=>fetch(url,{method:'POST',headers:{'content-type':'application/json',...(auth?{authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});
test('rejects unauthenticated requests',()=>withServer(async url=>{const r=await call(url,{jsonrpc:'2.0',id:1,method:'tools/list'},false);assert.equal(r.status,401);}));
test('initializes MCP',()=>withServer(async url=>{const r=await call(url,{jsonrpc:'2.0',id:1,method:'initialize',params:{}});assert.equal(r.status,200);assert.equal((await r.json()).result.serverInfo.name,'wise2-commander');}));
test('discovers six tools',()=>withServer(async url=>{const r=await call(url,{jsonrpc:'2.0',id:2,method:'tools/list'});assert.equal((await r.json()).result.tools.length,6);}));
test('refuses deployment by default',()=>withServer(async url=>{const r=await call(url,{jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'dispatch_deployment',arguments:{repo:'wise2-core',workflow:'deploy.yml',ref:'main',approval:'x'}}});assert.equal((await r.json()).result.isError,true);}));
test('rejects unknown path',()=>withServer(async url=>{const r=await fetch(url.replace('/mcp','/other'),{headers:{authorization:'Bearer '+token}});assert.equal(r.status,404);}));
