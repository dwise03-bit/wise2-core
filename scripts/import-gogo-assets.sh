#!/usr/bin/env bash
# WISE² Go-Go asset importer. Run from repository root with a local ZIP path.
set -euo pipefail
zip_path="${1:?Usage: bash scripts/import-gogo-assets.sh /path/to/wise2-gogo-full-assets.zip}"
test -f "$zip_path" || { echo "ZIP not found: $zip_path" >&2; exit 1; }
mkdir -p sites/gogo
python3 - "$zip_path" <<'PY'
from pathlib import Path
import zipfile,sys,shutil
z=Path(sys.argv[1]); root=Path('sites/gogo').resolve()
required={'index.html','assets/gogo-bucket.jpg','assets/reference.mp4','assets/frame-3.jpg','assets/frame-7.jpg','assets/frame-11.jpg','assets/frame-15.jpg','assets/frame-19.jpg','quality/audit.json'}
with zipfile.ZipFile(z) as f:
    names=set(f.namelist())
    missing=required-names
    if missing: raise SystemExit('Missing archive assets: '+', '.join(sorted(missing)))
    for item in f.infolist():
        if item.is_dir(): continue
        dest=(root/item.filename).resolve()
        if not dest.is_relative_to(root): raise SystemExit('Unsafe archive path: '+item.filename)
        dest.parent.mkdir(parents=True,exist_ok=True)
        with f.open(item) as src,dest.open('wb') as out: shutil.copyfileobj(src,out)
for name in required:
    path=root/name
    if not path.is_file() or path.stat().st_size==0: raise SystemExit('Missing or empty: '+str(path))
print('All Go-Go assets imported and checked')
PY
echo "Next: git add sites/gogo && git commit -m 'assets: import original Go-Go cinematic media' && git push"
