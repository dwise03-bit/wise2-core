import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const root = new URL('.', import.meta.url).pathname;
const gold = '#D9A441', red = '#E21A2B', black = '#070708', white = '#F7F2E8';
const items = [
  ['01-primary-logo', 'Primary Logo Patch', '3.5 × 2.5 in', 'EMBROIDERED · VELCRO BACKING', ['WISE²','DEFENSE LLC']],
  ['02-motto', 'Motto Patch', '3.5 × 2 in', 'EMBROIDERED · VELCRO BACKING', ['WORK SMARTER.','GO FURTHER.']],
  ['03-crew', 'Crew Patch', '3 × 2 in', 'EMBROIDERED · VELCRO BACKING', ['SAME','CREWS.','HIGHER IQ.']],
  ['04-crown', 'Crown Patch', '2.5 × 2 in', 'PVC / RUBBER · VELCRO BACKING', ['♛']],
  ['05-w2', 'W² Patch', '2 × 2 in', 'WOVEN · SEW ON / VELCRO', ['W²']],
  ['06-flag', 'Flag Patch', '3.5 × 2 in', 'EMBROIDERED · VELCRO BACKING', ['★ ★ ★ ★ ★','WISE DEFENSE']],
  ['07-wordmark', 'Wordmark Patch', '4 × 1.5 in', 'EMBROIDERED · VELCRO BACKING', ['WISE DEFENSE LLC']],
  ['08-1776', '1776 Patch', '3 × 1.5 in', 'EMBROIDERED · VELCRO BACKING', ['1776','FREEDOM LIVES']],
  ['09-owl', 'Owl Patch', '2.5 × 2.5 in', 'PVC / RUBBER · VELCRO BACKING', ['WISE OWL']],
  ['10-lifestyle', 'Lifestyle Patch', '2.5 × 2 in', 'EMBROIDERED · VELCRO BACKING', ['TRAIN.','TRAVEL.','CARRY.','LIVE.']],
];
const size = d => { const [w,h] = d.replaceAll(' in','').split(' × ').map(Number); return [w*300,h*300]; };
function text(s,x,y,fs,fill=gold,anchor='middle',weight=700){return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Arial,Helvetica,sans-serif" font-size="${fs}" font-weight="${weight}" letter-spacing="2" fill="${fill}">${s}</text>`}
function svg(item){
  const [id,name,dim,finish,lines]=item,[w,h]=size(dim), pad=Math.max(12,w*.035), r=Math.min(w,h)*.09;
  let body=`<rect x="${pad}" y="${pad}" width="${w-pad*2}" height="${h-pad*2}" rx="${r}" fill="${black}" stroke="#29292A" stroke-width="${Math.max(7,w*.018)}"/><rect x="${pad+10}" y="${pad+10}" width="${w-pad*2-20}" height="${h-pad*2-20}" rx="${r-6}" fill="none" stroke="#6D5228" stroke-width="3"/>`;
  if(id.includes('primary')) body+=`<path d="M${w*.35} ${h*.30} L${w*.43} ${h*.13} L${w*.50} ${h*.28} L${w*.57} ${h*.13} L${w*.65} ${h*.30} L${w*.50} ${h*.38}Z" fill="${gold}"/>${text('WISE²',w/2,h*.62,w*.22,gold)}${text('DEFENSE LLC',w/2,h*.82,w*.105,gold)}`;
  else if(id.includes('motto')) body+=text(lines[0],w/2,h*.45,w*.105,gold)+text(lines[1],w/2,h*.68,w*.105,gold)+`<path d="M${w*.25} ${h*.80} L${w*.72} ${h*.72}" stroke="${red}" stroke-width="${Math.max(8,w*.025)}"/>`;
  else if(id.includes('crew')) body+=lines.map((x,i)=>text(x,w/2,h*(.36+i*.24),w*.105,gold)).join('')+`<path d="M${w*.28} ${h*.86} L${w*.70} ${h*.78}" stroke="${red}" stroke-width="${Math.max(8,w*.025)}"/>`;
  else if(id.includes('crown')) body+=`<path d="M${w*.25} ${h*.58} L${w*.18} ${h*.30} L${w*.40} ${h*.46} L${w*.50} ${h*.22} L${w*.60} ${h*.46} L${w*.82} ${h*.30} L${w*.75} ${h*.58} Z" fill="${gold}" stroke="${white}" stroke-width="4"/><path d="M${w*.25} ${h*.65} Q${w*.5} ${h*.78} ${w*.75} ${h*.65}" fill="none" stroke="${gold}" stroke-width="${Math.max(12,w*.045)}"/>`;
  else if(id.includes('w2')) body+=text('W²',w/2,h*.65,w*.30,gold);
  else if(id.includes('flag')) body+=`<rect x="${w*.23}" y="${h*.27}" width="${w*.5}" height="${h*.46}" fill="${gold}"/><rect x="${w*.23}" y="${h*.27}" width="${w*.22}" height="${h*.46}" fill="${black}"/>${text('★ ★ ★',w*.34,h*.47,w*.045,white)}<path d="M${w*.23} ${h*.62} H${w*.73}" stroke="${red}" stroke-width="${Math.max(10,w*.04)}"/>`;
  else if(id.includes('wordmark')) body+=text(lines[0],w/2,h*.60,w*.075,gold);
  else if(id.includes('1776')) body+=text(lines[0],w/2,h*.58,w*.25,gold)+text(lines[1],w/2,h*.78,w*.065,gold);
  else if(id.includes('owl')) body+=`<path d="M${w*.28} ${h*.30} L${w*.42} ${h*.18} L${w*.50} ${h*.34} L${w*.58} ${h*.18} L${w*.72} ${h*.30} L${w*.64} ${h*.68} L${w*.50} ${h*.82} L${w*.36} ${h*.68}Z" fill="${gold}"/><circle cx="${w*.42}" cy="${h*.46}" r="${w*.06}" fill="${black}"/><circle cx="${w*.58}" cy="${h*.46}" r="${w*.06}" fill="${black}"/><path d="M${w*.47} ${h*.54} L${w*.5} ${h*.62} L${w*.53} ${h*.54}" fill="${red}"/>`;
  else body+=lines.map((x,i)=>text(x,w/2,h*(.32+i*.16),w*.09,gold)).join('')+`<path d="M${w*.28} ${h*.84} L${w*.68} ${h*.76}" stroke="${red}" stroke-width="${Math.max(8,w*.025)}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><title>${name}</title><desc>${finish}; ${dim}</desc>${body}</svg>`;
}
mkdirSync(join(root,'masters'),{recursive:true}); mkdirSync(join(root,'previews'),{recursive:true});
for(const item of items){ const [id]=item, data=svg(item), f=join(root,'masters',`${id}.svg`); writeFileSync(f,data); execFileSync('/opt/homebrew/bin/rsvg-convert',['-w',String(size(item[2])[0]*4),'-h',String(size(item[2])[1]*4),'-o',join(root,'previews',`${id}.png`),f]); }
writeFileSync(join(root,'PACK_MANIFEST.txt'), items.map((x,i)=>`${i+1}. ${x[1]} | ${x[2]} | ${x[3]}`).join('\n')+'\n');
