import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
export function compare(before,after){return ['observedCommit','latestStableRelease','license','archived'].filter(k=>before[k]!==after[k]);}
export async function collect(registry,get){
 const changes=[],errors=[];
 for(const old of registry.repositories){
  try{
   const meta=await get(`/repos/${old.repository}`);
   const commits=await get(`/repos/${old.repository}/commits?per_page=1`);
   let release=null;try{release=await get(`/repos/${old.repository}/releases/latest`);}catch(e){if(e.status!==404)throw e;}
   const next={repository:meta.full_name,observedCommit:commits[0]?.sha??null,latestStableRelease:release?.tag_name??null,license:meta.license?.spdx_id??'UNVERIFIED',archived:!!meta.archived};
   // Preserve the manually inspected restriction when GitHub still has no SPDX match.
   if(old.license==='ALL-RIGHTS-RESERVED'&&next.license==='NOASSERTION')next.license=old.license;
   const changed=compare(old,next);
   if(changed.length)changes.push({repository:old.repository,changed,before:old,after:next,decision:'REVIEW',reason:'Retest compatibility and inspect exact revision before promotion.'});
  }catch(e){errors.push({repository:old.repository,error:e.message});}
 }
 return {changes,errors};
}
async function main(){
 const registry=JSON.parse(await readFile(resolve(root,'research/repositories.json'),'utf8'));
 const get=async path=>{const headers={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};if(process.env.GITHUB_TOKEN)headers.Authorization=`Bearer ${process.env.GITHUB_TOKEN}`;const r=await fetch('https://api.github.com'+path,{headers,signal:AbortSignal.timeout(20000)});if(!r.ok){const e=new Error(`GitHub HTTP ${r.status} for ${path}`);e.status=r.status;throw e;}return r.json();};
 const report=await collect(registry,get);report.generatedAt=new Date().toISOString();report.discoveries=[];
 const known=new Set(registry.repositories.map(x=>x.repository.toLowerCase()));
 const since=new Date(Date.now()-30*86400000).toISOString().slice(0,10);
 for(const topic of ['openxr','game-modding','godot-plugin','multiplayer-game','procedural-generation']){
  try{const q=encodeURIComponent(`topic:${topic} pushed:>=${since} archived:false stars:>=20`);const data=await get(`/search/repositories?q=${q}&sort=updated&order=desc&per_page=10`);for(const r of data.items??[])if(!known.has(r.full_name.toLowerCase())){known.add(r.full_name.toLowerCase());report.discoveries.push({repository:r.full_name,url:r.html_url,description:r.description,license:r.license?.spdx_id??'UNVERIFIED',pushedAt:r.pushed_at,decision:'WATCH',reason:'New candidate only: license, source, dependencies, assets and platform fit require audit.'});}}catch(e){report.errors.push({topic,error:e.message});}
 }
 await mkdir(resolve(root,'research/reports'),{recursive:true});
 await writeFile(resolve(root,'research/reports/latest.json'),JSON.stringify(report,null,2)+'\n');
 const md=`# WISE² Game Tech Radar\n\nGenerated ${report.generatedAt}. ${report.changes.length} tracked changes; ${report.discoveries.length} new candidates; ${report.errors.length} API errors. No updates installed.\n\n`+report.changes.map(c=>`- REVIEW [${c.repository}](https://github.com/${c.repository}): ${c.changed.join(', ')}`).join('\n')+'\n\n'+report.discoveries.map(c=>`- WATCH [${c.repository}](${c.url}): ${c.description??''} (license metadata: ${c.license})`).join('\n')+'\n\n'+report.errors.map(e=>`- ERROR ${e.repository??e.topic}: ${e.error}`).join('\n')+'\n';
 await writeFile(resolve(root,'research/reports/latest.md'),md);console.log(md);
 if(report.errors.length)process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await main();
