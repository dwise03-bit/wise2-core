#!/usr/bin/env node
import {loadConfig} from './config.js';
import {models,chat,vision} from './backends/ollama.js';
import {hermesChat} from './backends/hermes.js';
import {resolveRoute} from './router.js';
import {controlRequest,controlPath} from './backends/control-bridge.js';
import {handoffWithLauncher} from './backends/cloud.js';
import {execFileSync} from 'node:child_process'; import os from 'node:os';
export type ParsedArgs={command:string;args:string[];json:boolean;verbose:boolean;config?:string};
export function parseArgs(a:string[]):ParsedArgs{const r:string[]=[];let json=false,verbose=false,config:string|undefined;for(let i=0;i<a.length;i++){if(a[i]==='--json')json=true;else if(a[i]==='--verbose')verbose=true;else if(a[i]==='--config')config=a[++i];else r.push(a[i])}return{command:r[0]||'help',args:r.slice(1),json,verbose,config}}
const git=(a:string[])=>{try{return execFileSync('git',a,{encoding:'utf8'}).trim()}catch{return ''}};
const print=(v:unknown,j:boolean)=>process.stdout.write(j?JSON.stringify(v)+'\n':typeof v==='string'?v+'\n':JSON.stringify(v,null,2)+'\n');
async function main(){const p=parseArgs(process.argv.slice(2)),c=loadConfig(p.config),{command,args}=p;
if(command==='help')return print('WISE² COMMAND CENTER\nwise "prompt" | fast | code | vision | rag | gpu | hermes | status | doctor | models | routes | project | control | handoff',p.json);
if(command==='routes')return print(c.roles,p.json);
if(command==='models'){let m:string[]=[];try{m=await models(c.localOllamaUrl)}catch{}return print({local:{reachable:m.length>0,url:c.localOllamaUrl,models:m},roles:c.roles},p.json)}
if(command==='project'){const root=git(['rev-parse','--show-toplevel']);return print({isGitRepo:!!root,root:root||undefined,branch:root?git(['branch','--show-current']):undefined,dirty:!!root&&!!git(['status','--short'])},p.json)}
if(command==='control')return print(await controlRequest(c,['restart','deploy','rollback'].includes(args[0])?'POST':'GET',controlPath(args)),p.json);
if(command==='handoff'){if(args[0]!=='claude'&&args[0]!=='codex')throw Error('handoff requires claude or codex');process.exitCode=await handoffWithLauncher(args[0],process.cwd());return}
if(command==='doctor'){const checks:{id:string;ok:boolean;remediation?:string}[]=[{id:'arm64',ok:process.arch==='arm64',remediation:'Use an arm64 Node runtime'},{id:'node',ok:Number(process.versions.node.split('.')[0])>=20,remediation:'Install Node.js 20 or newer'}];let m:string[]=[];try{m=await models(c.localOllamaUrl);checks.push({id:'local-ollama',ok:true})}catch{checks.push({id:'local-ollama',ok:false,remediation:'Run: ollama serve'})}for(const[id,r]of Object.entries(c.roles))checks.push({id:`model-${id}`,ok:m.some(x=>x===r.model||x.startsWith(`${r.model}:`)),remediation:`Install or configure model ${r.model}`});return print({ok:checks.every(x=>x.ok),checks},p.json)}
if(command==='status'){let m:string[]=[];try{m=await models(c.localOllamaUrl)}catch{}return print({mac:{arch:process.arch,totalMemoryBytes:os.totalmem(),usedMemoryPercent:Math.round((1-os.freemem()/os.totalmem())*100)},localOllama:{reachable:m.length>0,url:c.localOllamaUrl,models:m},gpu:{configured:!!c.gpuOllamaUrl,reachable:false},hermes:{configured:!!c.hermesUrl,reachable:false},controlBridge:{configured:!!c.controlBridgeUrl,reachable:false},cloud:{claudeInstalled:false,codexInstalled:false},project:{isGitRepo:!!git(['rev-parse','--show-toplevel']),branch:git(['branch','--show-current'])}},p.json)}
if(command==='hermes'){if(!c.hermesUrl)throw Error('Hermes is not configured');return print(await hermesChat(c,args.join(' ')),p.json)}
const role=command==='vision'?'vision':command==='gpu'?'architect':command==='code'?'code':command==='rag'?'rag':'fast';const r=resolveRoute(role,c),prompt=args.slice(command==='vision'?1:0).join(' ');if(r.backend==='gpu-ollama'){if(!c.gpuOllamaUrl)throw Error('GPU route is not configured');process.stderr.write('WISE² route: GPU host\n');return print(await chat(c.gpuOllamaUrl,r.model,prompt,c),p.json)}return print(command==='vision'?await vision(c.localOllamaUrl,r.model,args[0],prompt,c):await chat(c.localOllamaUrl,r.model,prompt,c),p.json)}
if(!process.env.VITEST)main().catch(e=>{console.error(e instanceof Error?e.message:e);process.exitCode=1});
