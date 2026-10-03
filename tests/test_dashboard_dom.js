// Exercise every module and stale state without a browser or network dependency.
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
class Node {
  constructor(tag){this.tag=tag;this.children=[];this.attributes={};this.style={};this.textContent='';}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=nodes;}
  insertBefore(node,before){const i=this.children.indexOf(before);this.children.splice(i<0?this.children.length:i,0,node);}
  setAttribute(key,value){this.attributes[key]=value;}
  removeAttribute(key){delete this.attributes[key];}
  set innerHTML(value){throw new Error('dynamic HTML injection is forbidden');}
}
const ids={};const document={createElement:tag=>new Node(tag),getElementById:id=>ids[id]??(ids[id]=new Node('div')),querySelectorAll:()=>ids.navigation.children};
const context=vm.createContext({document,window:{addEventListener(){}},location:{hash:''},AbortController,
  fetch:()=>new Promise(()=>{}),setTimeout:()=>0,clearTimeout(){},console});
vm.runInContext(fs.readFileSync('command-center/public/app.js','utf8'),context);
const injection='<img src=x onerror=alert(1)>';
context.fixture={observed_at:'fixture',host:injection,os:'fixture',services:{ssh:'UNKNOWN'},
  agents:{claude:{state:'ONLINE',version:'fixture'}},hermes:{state:'NOT CONFIGURED'},shannon:{state:'PARTIAL'},
  registry:{state:'IMPLEMENTED',devices:[{display_name:injection,id:'fixture',registration:'REGISTERED',online_state:'UNKNOWN'}]},
  projects:{state:'IMPLEMENTED',names:[injection]},backups:[],backup_health:{state:'WARN'},logs:[]};
vm.runInContext('snapshot=fixture;transport="LIVE";',context);
for(const page of ['system','ai','security','devices','projects','deployments','support','alerts','logs','backups','settings']) {
  context.location.hash='#'+page;vm.runInContext('render();',context);assert(ids.grid.children.length>0,page);
}
context.location.hash='#system';vm.runInContext('render();',context);
const walk=node=>[node,...node.children.flatMap(walk)];
assert(walk(ids.grid).some(node=>node.textContent===injection),'untrusted host is rendered as literal text');
vm.runInContext('transport="STALE";render();',context);
assert(ids.subtitle.textContent.includes('stale'),'stale observations are prominently labeled');
assert(!walk(ids.grid).some(node=>node.className==='value good'),'stale values cannot be green');
console.log('Dashboard modules, literal-text rendering and stale-state checks passed');
