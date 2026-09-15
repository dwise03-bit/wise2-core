#!/usr/bin/env bash
set -euo pipefail
root="$(git rev-parse --show-toplevel)"
cd "$root"
fail=0
printf 'WISE2 repo health\n'
node <<'NODE' || fail=1
const fs=require('fs'),p=require('path'),seen=new Map();
for(const root of ['apps','packages','services']) for(const d of fs.readdirSync(root)){const f=p.join(root,d,'package.json');if(!fs.existsSync(f))continue;try{const n=JSON.parse(fs.readFileSync(f)).name;if(n){const a=seen.get(n)||[];a.push(f);seen.set(n,a)}}catch{}}
const dup=[...seen].filter(([,v])=>v.length>1);if(dup.length){for(const [n,v] of dup)console.error('DUPLICATE PACKAGE',n,v.join(' | '));process.exit(1)}
console.log('package identities: OK');
NODE
generated="$(git ls-files | grep -E '(^|/)(dist|build|\.next)/' || true)"
if [[ -n "$generated" ]]; then echo 'tracked generated output: FAIL'; echo "$generated"; fail=1; else echo 'tracked generated output: OK'; fi
secrets="$(git ls-files | grep -E '(^|/)\.env($|\.)' | grep -v -E '(example|sample|template)' || true)"
if [[ -n "$secrets" ]]; then echo 'tracked env-like files: REVIEW'; echo "$secrets"; else echo 'tracked env-like files: OK'; fi
df -h . | awk 'NR==2{print "disk:",$4,"free ("$5" used)"}'
git status --short --branch
exit "$fail"
